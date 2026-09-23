import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getRevealRecord, revealSymbol } from "@/lib/signals/billing-store";
import { allowanceFromRecord } from "@/lib/signals/quota";
import { gateScanner } from "@/lib/signals/redact";
import { preferPublishedScanSnapshot, binanceScanningAllowed } from "@/lib/signals/host-role";
import {
  emptyOfflineScannerResponse,
  filterSnapshotForMode,
  loadPublishedScanSnapshot,
  snapshotAgeMs,
} from "@/lib/signals/scan-snapshot";
import { getOfficialStore } from "@/lib/signals/official-store";
import { mergeOfficialLiveIntoResponse } from "@/lib/signals/official-live";
import { scanMarkets, scanSymbol, startBackgroundScanLoop } from "@/lib/signals-engine/scanner";
import { selectNearSetups } from "@/lib/signals-engine/near-setups";
import { DEFAULT_SETTINGS } from "@/lib/signals-engine/types";
import { allowedScanMode, clampWatchlist, parseScanMode } from "@/lib/signals-engine/universe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function withOfficialLiveOverlay(scan: ReturnType<typeof filterSnapshotForMode>) {
  try {
    const active = await getOfficialStore().listActive();
    return mergeOfficialLiveIntoResponse(scan, active);
  } catch {
    return {
      ...scan,
      officialLive: scan.officialLive || [],
      nearSetups: scan.nearSetups?.length ? scan.nearSetups : selectNearSetups(scan.coins || []),
    };
  }
}

async function loadPublishedBoard(mode: ReturnType<typeof parseScanMode>, custom?: string[]) {
  const published = await loadPublishedScanSnapshot();
  if (!published?.response) {
    return {
      scan: emptyOfflineScannerResponse(
        "Scanner board unavailable. The persistent Signals worker has not published a snapshot yet.",
      ),
      publishedAt: null as string | null,
      ageMs: null as number | null,
    };
  }
  const filtered = filterSnapshotForMode(published.response, mode, custom);
  const age = snapshotAgeMs(published);
  const warnings = [...(filtered.warnings || [])];
  if (age != null && age > 5 * 60_000) {
    warnings.push(`Published scanner snapshot is ${Math.round(age / 1000)}s old. Waiting for the next worker cycle.`);
  }
  if (mode === "100" || mode === "all") {
    warnings.push("Published worker board currently covers the Top 50 liquid USDT-M perpetuals.");
  }
  const nearSetups = filtered.nearSetups?.length
    ? filtered.nearSetups
    : selectNearSetups(published.response.coins || []);
  const base = {
    ...filtered,
    nearSetups,
    warnings,
    stale: filtered.stale || (age != null && age > 3 * 60_000),
  };
  const scan = await withOfficialLiveOverlay(base);
  return {
    scan,
    publishedAt: published.publishedAt,
    ageMs: age,
  };
}

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in with your Pippinway account to use Signals." }, { status: 401 });
    }
    const usePublished = preferPublishedScanSnapshot();
    if (binanceScanningAllowed() && !usePublished) {
      startBackgroundScanLoop();
    }
    const symbol = req.nextUrl.searchParams.get("symbol");
    const force = req.nextUrl.searchParams.get("force") === "1";
    const reveal = req.nextUrl.searchParams.get("reveal") === "1";
    let revealed = (await getRevealRecord(access.uid))?.symbols || [];
    if (symbol && reveal && access.plan !== "pro") {
      const result = await revealSymbol(access.uid, symbol.toUpperCase(), access.config.freeDailyReveals);
      revealed = result.record.symbols;
      if (!result.allowed) {
        return NextResponse.json({
          error: `Free accounts can reveal ${access.config.freeDailyReveals} unique complete signals per UTC day.`,
          allowance: result.allowance,
        }, { status: 403 });
      }
    }
    const allowance = allowanceFromRecord(await getRevealRecord(access.uid), access.config.freeDailyReveals);
    if (symbol) {
      let coin;
      if (usePublished || !binanceScanningAllowed()) {
        const { scan } = await loadPublishedBoard("50");
        coin = scan.coins.find((item) => item.symbol === symbol.toUpperCase()) || null;
        if (!coin) {
          return NextResponse.json({
            error: "Symbol is not in the published Top 50 board yet.",
            access: { plan: access.plan, allowance },
          }, { status: 404 });
        }
      } else {
        coin = await scanSymbol(symbol.toUpperCase());
      }
      const gated = gateScanner(
        {
          settings: {
            ...DEFAULT_SETTINGS,
            leverage: access.settings.leverage,
            marginUSDT: access.settings.marginUSDT,
          },
          fetchedAt: new Date().toISOString(),
          pricesUpdatedAt: new Date().toISOString(),
          stale: coin.stale,
          warnings: [],
          coins: [coin],
        },
        access,
        { revealed },
      );
      return NextResponse.json({
        coin: gated.coins[0],
        access: { ...(gated as { access?: Record<string, unknown> }).access, allowance },
        fetchedAt: new Date().toISOString(),
      });
    }
    if (access.plan !== "pro") {
      const { buildFreeDailyPayload } = await import("@/lib/signals/free-daily");
      const daily = await buildFreeDailyPayload(access, force);
      return NextResponse.json({
        coins: daily.signals,
        eligible: daily.eligible,
        preview: daily.preview,
        nearSetups: daily.nearSetups,
        warnings: daily.warnings,
        fetchedAt: daily.fetchedAt,
        stale: daily.stale,
        access: { plan: "free", allowance: daily.allowance, subscription: daily.subscription, revealed: daily.allowance.symbols },
        universe: { mode: "15", eligible: daily.eligible.length, selected: daily.signals.length, listedAt: daily.fetchedAt },
        counts: {
          long: daily.signals.filter((coin) => coin.direction === "LONG").length,
          short: daily.signals.filter((coin) => coin.direction === "SHORT").length,
          wait: 0,
          invalid: 0,
          expired: 0,
          pending: daily.pending ? 1 : 0,
        },
        health: daily.health,
      });
    }
    const requested = parseScanMode(req.nextUrl.searchParams.get("mode") || access.settings.scanMode);
    const allowed = allowedScanMode(access.plan, requested);
    const custom = clampWatchlist(
      req.nextUrl.searchParams.get("watchlist")?.split(",") || access.settings.watchlist,
    );

    if (usePublished || !binanceScanningAllowed()) {
      const { scan, publishedAt } = await loadPublishedBoard(allowed.mode, custom);
      const gated = gateScanner(scan, access, { revealed });
      if (allowed.warning) gated.warnings = [...gated.warnings, allowed.warning];
      return NextResponse.json({
        ...gated,
        publishedAt,
        source: "persistent-worker",
        access: { ...(gated as { access?: Record<string, unknown> }).access, allowance },
      });
    }

    const scan = await withOfficialLiveOverlay(await scanMarkets(force, { mode: allowed.mode, custom, force }));
    const gated = gateScanner(scan, access, { revealed });
    if (allowed.warning) gated.warnings = [...gated.warnings, allowed.warning];
    return NextResponse.json({
      ...gated,
      access: { ...(gated as { access?: Record<string, unknown> }).access, allowance },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Scanner error" }, { status: 502 });
  }
}
