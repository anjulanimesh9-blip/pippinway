/**
 * Real Top 50 + cold-universe worker benchmark.
 * Run: npm run monitor:benchmark
 */
import { runFastMarketMonitor, runFullTop50Analysis } from "../lib/signals-engine/monitor-cycle";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";
import { weightSnapshot, lastBinanceFailure } from "../lib/signals-engine/rate-limit";
import {
  COLD_BATCH_SIZE,
  COLD_COVERAGE_TARGET_MS,
  COLD_FAST_BATCH_SIZE,
} from "../lib/signals-engine/cold-universe";
import { MIN_NET_RISK_REWARD } from "../lib/signals-engine/trading";

async function probe(url: string) {
  const started = Date.now();
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
  const text = await response.text();
  return { status: response.status, ms: Date.now() - started, bytes: text.length };
}

async function main() {
  const exchange = await probe("https://fapi.binance.com/fapi/v1/exchangeInfo");
  const ticker = await probe("https://fapi.binance.com/fapi/v1/ticker/24hr");

  const priceStarted = Date.now();
  const price = await runFastMarketMonitor();
  const priceMs = Date.now() - priceStarted;

  const analysisStarted = Date.now();
  const analysis = await runFullTop50Analysis();
  const analysisMs = Date.now() - analysisStarted;

  const published = await loadPublishedScanSnapshot();
  const weight = weightSnapshot();
  const failure = lastBinanceFailure();
  const coins = published?.response?.coins || [];
  const analyzed = coins.filter((c) => c.scanState && c.scanState !== "pending").length;
  const ready = coins.filter((c) => c.scanState === "ready").length;
  const failed = coins.filter((c) => c.scanState === "failed" || c.scanState === "timeout").length;
  const pending = coins.filter((c) => !c.scanState || c.scanState === "pending").length;
  const health = published?.response?.health;
  const cold = analysis.cold || price.cold;
  const coldSize = cold?.coldUniverseSize ?? Math.max(0, (analysis.eligible || 0) - (analysis.selected || 50));
  // Expected cadence: analysis (~3m) batch + two fast (~60s) micro-batches per analysis window.
  const symbolsPerApprox3Min = COLD_BATCH_SIZE + 2 * COLD_FAST_BATCH_SIZE;
  const expectedCoverageMin =
    coldSize > 0 ? Math.round((coldSize / Math.max(symbolsPerApprox3Min, 1)) * 3 * 10) / 10 : 0;

  const report = {
    exchangeInfoHttp: exchange.status,
    exchangeInfoMs: exchange.ms,
    tickerHttp: ticker.status,
    tickerMs: ticker.ms,
    eligibleContracts: analysis.eligible,
    selectedTop50: analysis.selected,
    analyzedCount: analysis.analyzedCount,
    readyCount: ready,
    freshCount: analysis.fresh,
    pendingCount: pending,
    failedCount: failed,
    long: analysis.long,
    short: analysis.short,
    wait: analysis.wait,
    priceRefreshMs: priceMs,
    priceUpdatedCount: price.priceUpdatedCount,
    fullAnalysisMs: analysis.analysisDurationMs ?? analysisMs,
    wallAnalysisMs: analysisMs,
    binanceWeight: weight.used,
    weightLimit: weight.limit,
    circuitOpen: weight.circuitOpen,
    lastBinanceFailure: failure
      ? { status: failure.status, kind: failure.kind, reason: failure.reason, path: failure.path }
      : null,
    snapshotPublishedAt: published?.publishedAt ?? null,
    snapshotCoinCount: coins.length,
    snapshotAnalyzed: analyzed,
    coverageNote: analysis.coverageNote,
    lastFullTop50PassAt: analysis.lastFullUniverseAt,
    workerHeartbeatAt: analysis.finishedAt,
    minNetRr: MIN_NET_RISK_REWARD,
    cold: {
      batchSizeAnalysis: COLD_BATCH_SIZE,
      batchSizeFast: COLD_FAST_BATCH_SIZE,
      coldAnalyzedThisCycle: analysis.coldAnalyzed?.length ?? 0,
      fastColdAnalyzedThisCycle: price.coldAnalyzed?.length ?? 0,
      eligibleUniverse: cold?.eligibleUniverse ?? health?.eligibleUniverse ?? null,
      hotUniverseAnalyzed: cold?.hotUniverseAnalyzed ?? health?.hotUniverseAnalyzed ?? null,
      coldUniverseSize: cold?.coldUniverseSize ?? health?.coldUniverseSize ?? null,
      coldUniverseAnalyzed: cold?.coldUniverseAnalyzed ?? health?.coldUniverseAnalyzed ?? null,
      fullUniverseCoverageCount: cold?.fullUniverseCoverageCount ?? health?.fullUniverseCoverageCount ?? null,
      fullUniverseCoveragePct: cold?.fullUniverseCoveragePct ?? health?.fullUniverseCoveragePct ?? null,
      currentColdBatch: cold?.currentColdBatch ?? health?.currentColdBatch ?? null,
      lastFullEligibleUniverseAt: cold?.lastFullEligibleUniverseAt ?? health?.lastFullEligibleUniverseAt ?? null,
      nextExpectedFullEligibleUniverseAt:
        cold?.nextExpectedFullEligibleUniverseAt ?? health?.nextExpectedFullEligibleUniverseAt ?? null,
      coverageTargetMinutes: Math.round(COLD_COVERAGE_TARGET_MS / 60_000),
      expectedFullCoverageMinutesApprox: expectedCoverageMin,
      expectedWeightPerColdSymbolApprox: "15-40 (incremental klines + ticker)",
      expectedPeakWeightPerMinuteApprox: "< 0.85 * 2400 with awaitBudget gating",
    },
    acceptance: {
      selected50: analysis.selected === 50,
      analyzed50: analysis.analyzedCount === 50,
      exchangeOk: exchange.status === 200,
      tickerOk: ticker.status === 200,
      snapshotOk: Boolean(published?.publishedAt && coins.length === 50),
      minNetRrUnchanged: MIN_NET_RISK_REWARD === 3,
      coldBatchBounded: COLD_BATCH_SIZE <= 80 && COLD_FAST_BATCH_SIZE <= 40,
      coverageEtaInWindow: expectedCoverageMin >= 15 && expectedCoverageMin <= 40,
    },
  };

  console.log("TOP50_BENCHMARK " + JSON.stringify(report));
  if (
    !report.acceptance.selected50
    || !report.acceptance.analyzed50
    || !report.acceptance.exchangeOk
    || !report.acceptance.minNetRrUnchanged
  ) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
