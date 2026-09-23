import { getRevealRecord } from "./billing-store";
import { allowanceFromRecord } from "./quota";
import { gateScanner } from "./redact";
import type { SignalsAccess } from "./access";
import type { CoinScan } from "@/lib/signals-engine/types";
import { preferPublishedScanSnapshot, binanceScanningAllowed } from "@/lib/signals/host-role";
import {
  emptyOfflineScannerResponse,
  filterSnapshotForMode,
  loadPublishedScanSnapshot,
  snapshotAgeMs,
} from "@/lib/signals/scan-snapshot";
import { scanMarkets, startBackgroundScanLoop } from "@/lib/signals-engine/scanner";

export type FreeEligibleCoin = {
  symbol: string;
  locked: true;
  price: number | null;
  changePct: number | null;
  stale: boolean;
  available: boolean;
  scanState?: string;
};

export function publicEligibleCoin(coin: Pick<CoinScan, "symbol" | "price" | "changePct" | "stale" | "available" | "scanState">): FreeEligibleCoin {
  return {
    symbol: String(coin.symbol || "").toUpperCase(),
    locked: true,
    price: coin.price ?? null,
    changePct: coin.changePct ?? null,
    stale: Boolean(coin.stale),
    available: coin.available !== false,
    scanState: coin.scanState,
  };
}

export function splitFreeDashboard(input: {
  coins: CoinScan[];
  watchlist: string[];
  revealed: string[];
}) {
  const revealed = [...new Set(input.revealed.map((item) => item.toUpperCase()).filter(Boolean))];
  const watchlist = [...new Set(input.watchlist.map((item) => item.toUpperCase()).filter(Boolean))];
  const bySymbol = new Map(input.coins.map((coin) => [coin.symbol.toUpperCase(), coin]));
  const signals = revealed.map((symbol) => bySymbol.get(symbol)).filter((coin): coin is CoinScan => Boolean(coin));
  const eligible = watchlist
    .filter((symbol) => !revealed.includes(symbol))
    .map((symbol) => publicEligibleCoin(bySymbol.get(symbol) || {
      symbol,
      price: null,
      changePct: null,
      stale: false,
      available: true,
    }));
  return { signals, eligible, revealed };
}

async function loadFreeScan(force: boolean) {
  if (preferPublishedScanSnapshot() || !binanceScanningAllowed()) {
    const published = await loadPublishedScanSnapshot();
    if (!published?.response) {
      return emptyOfflineScannerResponse(
        "Free Signals board unavailable until the persistent worker publishes a scanner snapshot.",
      );
    }
    const filtered = filterSnapshotForMode(published.response, "15");
    const age = snapshotAgeMs(published);
    const warnings = [...(filtered.warnings || [])];
    if (age != null && age > 5 * 60_000) {
      warnings.push(`Published scanner snapshot is ${Math.round(age / 1000)}s old.`);
    }
    return { ...filtered, warnings, stale: filtered.stale || (age != null && age > 3 * 60_000) };
  }
  startBackgroundScanLoop();
  return scanMarkets(force, { mode: "15", force });
}

export async function buildFreeDailyPayload(access: SignalsAccess, force = false) {
  const scan = await loadFreeScan(force);
  const record = await getRevealRecord(access.uid);
  const allowance = allowanceFromRecord(record, access.config.freeDailyReveals);
  const gated = gateScanner(scan, access, { revealed: allowance.symbols });
  const view = splitFreeDashboard({
    coins: gated.coins,
    watchlist: access.config.freeSymbols,
    revealed: allowance.symbols,
  });
  return {
    plan: "free" as const,
    pending: Boolean(scan.progress?.running || (scan.progress?.pending ?? 0) > 0),
    frozen: false,
    signals: view.signals,
    eligible: view.eligible,
    preview: view.eligible.slice(0, 6).map((item) => ({ symbol: item.symbol, locked: true as const })),
    availableCount: view.signals.length,
    allowance,
    subscription: access.subscription,
    config: {
      proPriceMonthly: access.config.proPriceMonthly,
      currency: access.config.currency,
      freeSymbols: access.config.freeSymbols,
      freeDailyReveals: access.config.freeDailyReveals,
    },
    resetAt: allowance.resetAt,
    timezone: "UTC" as const,
    fetchedAt: scan.fetchedAt,
    stale: scan.stale,
    warnings: gated.warnings,
    health: scan.health,
  };
}
