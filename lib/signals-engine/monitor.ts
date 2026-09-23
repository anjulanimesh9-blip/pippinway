import { getTickers, getExchangeFilters } from "./binance";
import { advanceLifecycle, isTerminal } from "./lifecycle";
import { activeScanSymbols } from "./scanner";
import { listEligiblePerpetuals } from "./universe";
import { getOfficialStore, persistReconcile, publishedFromOfficial } from "@/lib/signals/official-store";
import { activeCount, expiredCount } from "@/lib/signals/performance";

const CYCLE_MS = 60_000;
const g = globalThis as typeof globalThis & {
  __pippinwaySignalsMonitor?: { stop: () => void; startedAt: string };
};

export function monitorIsRunning() {
  return Boolean(g.__pippinwaySignalsMonitor);
}

export async function monitorPriceTick() {
  const store = getOfficialStore();
  const now = new Date().toISOString();
  try {
    const symbols = activeScanSymbols();
    const [prices, filters, listed] = await Promise.all([
      getTickers(symbols),
      getExchangeFilters(symbols),
      listEligiblePerpetuals().catch(() => ({ count: symbols.length })),
    ]);
    const active = await store.listActive();
    for (const record of active) {
      const listedFilters = filters.get(record.symbol);
      if (listedFilters && !listedFilters.available) {
        await persistReconcile(
          {
            symbol: record.symbol,
            available: false,
            price: prices.get(record.symbol) ?? record.lastPrice,
            priceUpdatedAt: now,
            stale: true,
            trend: "MIXED",
            direction: record.direction,
            pattern: record.pattern,
            patternStatus: record.patternStatus as never,
            timeframes: [],
            setup: null,
            entryConditions: record.entryConditions,
            reason: listedFilters.reason || "Symbol is no longer an eligible USDT-M perpetual.",
            nextStep: "Delisted or invalid contracts are not current trading opportunities.",
            lastCandleCloseAt: record.lastCandleCloseAt,
            analyzedAt: record.openedAt,
            originalEntry: record.originalEntry,
            lifecycle: {
              ...publishedFromOfficial(record).lifecycle,
              status: "INVALIDATED",
              nextStep: "Contract is not TRADING on Binance USDT-M.",
            },
          },
          { ...publishedFromOfficial(record), lifecycle: { ...publishedFromOfficial(record).lifecycle, status: "INVALIDATED" } },
          record.lifecycleStatus,
        );
        continue;
      }
      const price = prices.get(record.symbol);
      if (price == null) continue;
      const published = publishedFromOfficial(record);
      const advanced = advanceLifecycle({
        lifecycle: published.lifecycle,
        direction: record.direction,
        entry: record.originalEntry,
        stop: record.stop,
        target: record.target,
        livePrice: price,
        now,
        conditionsHold: true,
      });
      if (advanced.status !== record.lifecycleStatus || isTerminal(advanced.status)) {
        await persistReconcile(
          {
            symbol: record.symbol,
            available: Boolean(filters.get(record.symbol)?.available),
            price,
            priceUpdatedAt: now,
            stale: false,
            trend: "MIXED",
            direction: record.direction,
            pattern: record.pattern,
            patternStatus: record.patternStatus as never,
            timeframes: [],
            setup: {
              direction: record.direction,
              executable: false,
              executableReason: "Monitor tick",
              validationReasons: [],
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
              liquidationRisk: "UNAVAILABLE",
              liquidationNote: "Monitor tick does not invent liquidation.",
            },
            entryConditions: record.entryConditions,
            reason: "Server monitor",
            nextStep: advanced.nextStep,
            lastCandleCloseAt: record.lastCandleCloseAt,
            analyzedAt: record.openedAt,
            originalEntry: record.originalEntry,
            lifecycle: advanced,
          },
          { ...published, lifecycle: advanced },
          record.lifecycleStatus,
        );
      } else {
        await store.updateLifecycle({
          id: record.id,
          status: record.lifecycleStatus,
          observedTrigger: record.observedTrigger,
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
