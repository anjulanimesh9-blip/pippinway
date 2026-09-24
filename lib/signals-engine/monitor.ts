import { fetchKlines, getTickers, getExchangeFilters } from "./binance";
import { advanceLifecycle, isTerminal, resolveOutcomeFromCandle } from "./lifecycle";
import { activeScanSymbols } from "./scanner";
import { listEligiblePerpetuals } from "./universe";
import { getOfficialStore, persistReconcile, publishedFromOfficial } from "@/lib/signals/official-store";
import { activeCount, expiredCount } from "@/lib/signals/performance";
import type { OfficialSignal } from "@/lib/signals/official-types";
import type { SignalLifecycle } from "./types";

const CYCLE_MS = 60_000;
const g = globalThis as typeof globalThis & {
  __pippinwaySignalsMonitor?: { stop: () => void; startedAt: string };
};

export function monitorIsRunning() {
  return Boolean(g.__pippinwaySignalsMonitor);
}

type PathCandle = { high: number; low: number; close: number; openTime: number };

/**
 * Walk 1m candle high/low to advance entry observation then TARGET / STOP / AMBIGUOUS.
 */
export function resolveActiveFromCandles(
  record: OfficialSignal,
  candles: PathCandle[],
  now: string,
  livePrice?: number | null,
): SignalLifecycle {
  let lifecycle = publishedFromOfficial(record).lifecycle;

  for (const candle of candles) {
    if (isTerminal(lifecycle.status)) break;
    const stamp = new Date(candle.openTime + 60_000).toISOString();

    if (lifecycle.status === "WAITING_FOR_ENTRY") {
      const touchedEntry = candle.low <= record.originalEntry && candle.high >= record.originalEntry;
      lifecycle = advanceLifecycle({
        lifecycle: touchedEntry ? { ...lifecycle, seenAwayFromEntry: true } : { ...lifecycle, seenAwayFromEntry: lifecycle.seenAwayFromEntry || candle.close !== record.originalEntry },
        direction: record.direction,
        entry: record.originalEntry,
        stop: record.stop,
        target: record.target,
        livePrice: touchedEntry ? record.originalEntry : candle.close,
        now: stamp,
        delisted: false,
      });
    }

    if (lifecycle.status === "TRIGGERED" || lifecycle.status === "ACTIVE") {
      const hit = resolveOutcomeFromCandle(record.direction, record.stop, record.target, candle.high, candle.low);
      lifecycle = advanceLifecycle({
        lifecycle,
        direction: record.direction,
        entry: record.originalEntry,
        stop: record.stop,
        target: record.target,
        livePrice: candle.close,
        now: stamp,
        delisted: false,
        candleHigh: candle.high,
        candleLow: candle.low,
      });
      if (hit && !isTerminal(lifecycle.status)) {
        // Force close using candle range if advance did not (defensive).
        lifecycle = advanceLifecycle({
          lifecycle,
          direction: record.direction,
          entry: record.originalEntry,
          stop: record.stop,
          target: record.target,
          livePrice: candle.close,
          now: stamp,
          delisted: false,
          candleHigh: candle.high,
          candleLow: candle.low,
        });
      }
    }
  }

  if (!isTerminal(lifecycle.status) && livePrice != null && Number.isFinite(livePrice)) {
    lifecycle = advanceLifecycle({
      lifecycle,
      direction: record.direction,
      entry: record.originalEntry,
      stop: record.stop,
      target: record.target,
      livePrice,
      now,
      delisted: false,
    });
  }

  return lifecycle;
}

function monitorCoinPayload(
  record: OfficialSignal,
  price: number | null,
  now: string,
  advanced: SignalLifecycle,
  available: boolean,
  reason: string,
) {
  return {
    symbol: record.symbol,
    available,
    price,
    priceUpdatedAt: now,
    stale: !available,
    trend: "MIXED" as const,
    direction: record.direction,
    pattern: record.pattern,
    patternStatus: record.patternStatus as never,
    timeframes: [],
    setup: {
      direction: record.direction,
      executable: false,
      executableReason: "Monitor tick",
      validationReasons: [] as string[],
      marginUSDT: record.marginUSDT,
      allocatedMarginUSDT: record.marginUSDT,
      requiredMarginUSDT: record.requiredMarginUSDT,
      leverage: record.leverage,
      marginMode: record.marginMode,
      notionalUSDT: record.notionalUSDT,
      quantity: record.quantity,
      entry: record.originalEntry,
      stop: record.stop,
      target: record.target,
      riskReward: 0,
      grossRiskReward: 0,
      netRiskReward: 0,
      estimatedProfitUSDT: 0,
      estimatedLossUSDT: 0,
      estimatedFeesUSDT: record.totalFeesUSDT,
      entryFeeUSDT: record.totalFeesUSDT / 2,
      exitFeeUSDT: record.totalFeesUSDT / 2,
      totalFeesUSDT: record.totalFeesUSDT,
      grossProfitUSDT: 0,
      grossLossUSDT: 0,
      netProfitUSDT: 0,
      netLossUSDT: 0,
      tickSize: 0,
      stepSize: 0,
      minNotional: 0,
      minQty: 0,
      liquidationEstimateUSDT: null,
      liquidationRisk: "UNAVAILABLE" as const,
      liquidationNote: "Monitor tick does not invent liquidation.",
    },
    entryConditions: record.entryConditions,
    reason,
    nextStep: advanced.nextStep,
    lastCandleCloseAt: record.lastCandleCloseAt,
    analyzedAt: record.openedAt,
    originalEntry: record.originalEntry,
    lifecycle: advanced,
  };
}

export async function monitorPriceTick() {
  const store = getOfficialStore();
  const now = new Date().toISOString();
  try {
    const active = await store.listActive();
    // Keep lifecycle prices for active official signals even after they drop out of Top 100.
    const symbols = [...new Set([...activeScanSymbols(), ...active.map((record) => record.symbol)])];
    const [prices, filters, listed] = await Promise.all([
      getTickers(symbols),
      getExchangeFilters(symbols),
      listEligiblePerpetuals().catch(() => ({ count: symbols.length })),
    ]);

    for (const record of active) {
      if (isTerminal(record.lifecycleStatus)) continue;

      const listedFilters = filters.get(record.symbol);
      const published = publishedFromOfficial(record);

      if (listedFilters && !listedFilters.available) {
        const advanced = advanceLifecycle({
          lifecycle: published.lifecycle,
          direction: record.direction,
          entry: record.originalEntry,
          stop: record.stop,
          target: record.target,
          livePrice: prices.get(record.symbol) ?? record.lastPrice ?? record.originalEntry,
          now,
          delisted: true,
        });
        await persistReconcile(
          monitorCoinPayload(
            record,
            prices.get(record.symbol) ?? record.lastPrice,
            now,
            advanced,
            false,
            listedFilters.reason || "Symbol is no longer an eligible USDT-M perpetual.",
          ),
          { ...published, lifecycle: advanced },
          record.lifecycleStatus,
        );
        continue;
      }

      const price = prices.get(record.symbol);
      if (price == null) continue;

      let candles: PathCandle[] = [];
      try {
        const raw = await fetchKlines(record.symbol, "1m", { limit: 12 });
        candles = raw.map((c) => ({ high: c.high, low: c.low, close: c.close, openTime: c.openTime }));
      } catch {
        candles = [];
      }

      const advanced = candles.length
        ? resolveActiveFromCandles(record, candles, now, price)
        : advanceLifecycle({
            lifecycle: published.lifecycle,
            direction: record.direction,
            entry: record.originalEntry,
            stop: record.stop,
            target: record.target,
            livePrice: price,
            now,
            delisted: false,
          });

      if (advanced.status !== record.lifecycleStatus || isTerminal(advanced.status)) {
        await persistReconcile(
          monitorCoinPayload(record, price, now, advanced, Boolean(filters.get(record.symbol)?.available), "Server monitor"),
          { ...published, lifecycle: advanced },
          record.lifecycleStatus,
        );
      } else {
        await store.updateLifecycle({
          id: record.id,
          status: record.lifecycleStatus,
          observedTrigger: record.observedTrigger || advanced.observedTrigger,
          lastPrice: price,
          lastPriceAt: now,
          note: "Price poll. Original entry unchanged.",
        });
      }
    }
    const all = await store.listSignals();
    return store.setHealth({
      lastSuccessAt: now,
      lastPriceAt: now,
      stale: false,
      error: null,
      monitoring: monitorIsRunning() ? "running" : "idle",
      availablePairs: [...filters.values()].filter((item) => item.available).length,
      totalPairs: listed.count,
      activeCount: activeCount(all),
      expiredCount: expiredCount(all),
      backend: "hybrid",
    });
  } catch (error) {
    return store.setHealth({
      stale: true,
      error: error instanceof Error ? error.message : "Price monitor failed",
      monitoring: "error",
    });
  }
}

export async function monitorScanTick() {
  const { runMonitoringCycle } = await import("./monitor-cycle");
  return runMonitoringCycle();
}

export function startSignalsMonitor() {
  if (g.__pippinwaySignalsMonitor) return g.__pippinwaySignalsMonitor;
  let inFlight = false;
  const cycleTimer = setInterval(() => {
    if (inFlight) return;
    inFlight = true;
    void import("./monitor-cycle")
      .then((mod) => mod.runMonitoringCycle())
      .finally(() => {
        inFlight = false;
      });
  }, CYCLE_MS);
  const handle = {
    startedAt: new Date().toISOString(),
    stop() {
      clearInterval(cycleTimer);
      delete g.__pippinwaySignalsMonitor;
    },
  };
  g.__pippinwaySignalsMonitor = handle;
  void getOfficialStore().setHealth({ monitoring: "running", workerStatus: "running" });
  void import("./monitor-cycle").then((mod) => mod.runMonitoringCycle());
  return handle;
}
