import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess, readBearer } from "@/lib/signals/access";
import {
  billingBackend,
  firebaseAdminStatus,
  hasFirebaseAdminCredentials,
  listPayments,
  listSignalsUsers,
  saveSignalsConfigDoc,
  setSignalsUserPlan,
} from "@/lib/signals/billing-store";
import { sanitizeConfig } from "@/lib/signals/config";
import { binanceScanningAllowed, preferPublishedScanSnapshot } from "@/lib/signals/host-role";
import { getOfficialStore } from "@/lib/signals/official-store";
import { getOfficialPerformance } from "@/lib/signals/performance";
import { loadPublishedScanSnapshot } from "@/lib/signals/scan-snapshot";
import { getHistory } from "@/lib/signals-engine/history";
import { monitorIsRunning } from "@/lib/signals-engine/monitor";
import { getLivePrices } from "@/lib/signals-engine/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access?.isAdmin) {
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    }
    const store = getOfficialStore();
    const paymentUids = listPayments()
      .then((items) => items.map((item) => item.uid))
      .catch(() => [] as string[]);
    const [history, prices, officialHealth, performance, official, extraUids] = await Promise.all([
      getHistory(),
      (preferPublishedScanSnapshot() || !binanceScanningAllowed())
        ? loadPublishedScanSnapshot().then((published) => ({
            fetchedAt: published?.publishedAt || new Date().toISOString(),
            stale: !published,
            error: published ? null : "Waiting for persistent worker snapshot",
            prices: (published?.response?.coins || []).map((coin) => ({
              symbol: coin.symbol,
              price: coin.price,
              changePct: coin.changePct ?? null,
              available: coin.available !== false,
            })),
          }))
        : getLivePrices(),
      store.health(),
      getOfficialPerformance(),
      store.listSignals(),
      paymentUids,
    ]);
    const usersResult = await listSignalsUsers(readBearer(req), [access.uid, ...extraUids]).catch((error) => ({
      users: [],
      backend: "admin-token-subset" as const,
      error: error instanceof Error ? error.message : "User directory failed.",
    }));
    const stale = prices.stale || officialHealth.stale || !officialHealth.lastSuccessAt;
    return NextResponse.json({
      config: access.config,
      users: usersResult.users,
      usersError: usersResult.error || null,
      firestoreAdminConfigured: hasFirebaseAdminCredentials(),
      firebaseAdmin: firebaseAdminStatus(),
      billingBackend: billingBackend(),
      usersBackend: usersResult.backend,
      health: {
        stale,
        error: prices.error || officialHealth.error,
        fetchedAt: prices.fetchedAt,
        lastSuccessAt: officialHealth.lastSuccessAt,
        lastPriceAt: officialHealth.lastPriceAt,
        lastScanAt: officialHealth.lastScanAt,
        availablePairs: officialHealth.availablePairs || prices.prices.filter((row) => row.available && row.price != null).length,
        totalPairs: officialHealth.totalPairs || prices.prices.length,
        monitoring: monitorIsRunning() ? "running" : officialHealth.monitoring,
        writeErrors: officialHealth.writeErrors,
        lastWriteError: officialHealth.lastWriteError,
        activeCount: official.filter((item) => !["TARGET_HIT", "STOP_HIT", "EXPIRED", "INVALIDATED", "MISSED_ENTRY"].includes(item.lifecycleStatus)).length,
        expiredCount: official.filter((item) => item.lifecycleStatus === "EXPIRED" || item.lifecycleStatus === "MISSED_ENTRY").length,
        backend: officialHealth.backend,
        lastCycleAt: officialHealth.lastCycleAt ?? null,
        lastCycleDurationMs: officialHealth.lastCycleDurationMs ?? null,
        lastFullUniverseAt: officialHealth.lastFullUniverseAt ?? null,
        lastFullUniverseDurationMs: officialHealth.lastFullUniverseDurationMs ?? null,
        requestWeightUsed: officialHealth.requestWeightUsed ?? null,
        requestWeightLimit: officialHealth.requestWeightLimit ?? 2400,
        queueBacklog: officialHealth.queueBacklog ?? 0,
        workerStatus: officialHealth.workerStatus,
        freshCount: officialHealth.freshCount,
        staleCount: officialHealth.staleCount,
        failedCount: officialHealth.failedCount,
        pendingCount: officialHealth.pendingCount,
        neverScannedCount: officialHealth.neverScannedCount,
        validatedLong: officialHealth.validatedLong,
        validatedShort: officialHealth.validatedShort,
        waitCount: officialHealth.waitCount,
        rejectedCount: officialHealth.rejectedCount,
        coverageNote: officialHealth.coverageNote,
      },
      performance,
      prices: prices.prices,
      history,
      investigation: official.map((item) => ({
        id: item.id,
        symbol: item.symbol,
        interval: item.interval,
        openedAt: item.openedAt,
        originalEntry: item.originalEntry,
        stop: item.stop,
        target: item.target,
        pattern: item.pattern,
        lifecycleStatus: item.lifecycleStatus,
        fillConfirmed: item.fillConfirmed,
        investigation: item.investigation || null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin signals error" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access?.isAdmin) {
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({})) as {
      action?: string;
      config?: Record<string, unknown>;
      userId?: string;
      plan?: string;
    };
    if (body.action === "saveConfig") {
      const config = sanitizeConfig(body.config || {});
      await saveSignalsConfigDoc(readBearer(req), config);
      return NextResponse.json({ config });
    }
    if (body.action === "setPlan") {
      const plan = body.plan === "pro" ? "pro" : body.plan === "free" ? "free" : null;
      if (!body.userId || !plan) {
        return NextResponse.json({ error: "Choose a user and a plan." }, { status: 400 });
      }
      const record = await setSignalsUserPlan(
        readBearer(req),
        String(body.userId),
        plan,
        access.config.subscriptionDays,
      );
      return NextResponse.json({ userId: body.userId, ...record });
    }
    return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin update failed" }, { status: 502 });
  }
}
