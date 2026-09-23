/**
 * Real Top 50 benchmark for the permanent worker architecture.
 * Run: node --use-system-ca ./node_modules/tsx/dist/cli.mjs scripts/signals-top50-benchmark.ts
 */
import { runFastMarketMonitor, runFullTop50Analysis } from "../lib/signals-engine/monitor-cycle";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";
import { weightSnapshot, lastBinanceFailure } from "../lib/signals-engine/rate-limit";

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
    acceptance: {
      selected50: analysis.selected === 50,
      analyzed50: analysis.analyzedCount === 50,
      exchangeOk: exchange.status === 200,
      tickerOk: ticker.status === 200,
      snapshotOk: Boolean(published?.publishedAt && coins.length === 50),
    },
  };

  console.log("TOP50_BENCHMARK " + JSON.stringify(report));
  if (!report.acceptance.selected50 || !report.acceptance.analyzed50 || !report.acceptance.exchangeOk) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
