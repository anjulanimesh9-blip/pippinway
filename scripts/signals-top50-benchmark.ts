/**
 * Real Top 100 pattern-engine worker benchmark.
 * Run: npm run monitor:benchmark
 */
import { runFastMarketMonitor, runFullTop50Analysis } from "../lib/signals-engine/monitor-cycle";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";
import { weightSnapshot, lastBinanceFailure } from "../lib/signals-engine/rate-limit";
import { MIN_NET_RISK_REWARD, requirePublicationNetRr } from "../lib/signals-engine/trading";
import { DEFAULT_LIVE_SCAN_MODE } from "../lib/signals-engine/universe";

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
  const signals = coins
    .filter((c) => c.direction === "LONG" || c.direction === "SHORT")
    .map((c) => ({
      symbol: c.symbol,
      direction: c.direction,
      pattern: c.pattern,
      entry: c.setup?.entry ?? null,
      stop: c.setup?.stop ?? null,
      target: c.setup?.target ?? null,
      grossRr: c.setup?.grossRiskReward ?? null,
      netRr: c.setup?.netRiskReward ?? null,
      lifecycle: c.lifecycle?.status ?? null,
    }));
  const officialLive = published?.response?.officialLive || [];
  const nearSetups = published?.response?.nearSetups || [];

  const report = {
    exchangeInfoHttp: exchange.status,
    exchangeInfoMs: exchange.ms,
    tickerHttp: ticker.status,
    tickerMs: ticker.ms,
    defaultLiveMode: DEFAULT_LIVE_SCAN_MODE,
    requireNetRrFloor: requirePublicationNetRr(),
    minNetRrConstant: MIN_NET_RISK_REWARD,
    eligibleContracts: analysis.eligible,
    selectedTop100: analysis.selected,
    analyzedCount: analysis.analyzedCount,
    readyCount: ready,
    freshCount: analysis.fresh,
    pendingCount: pending,
    failedCount: failed,
    long: analysis.long,
    short: analysis.short,
    wait: analysis.wait,
    signals,
    officialLiveCount: officialLive.length,
    nearSetupsCount: nearSetups.length,
    priceRefreshMs: priceMs,
    priceUpdatedCount: price.priceUpdatedCount,
    fullAnalysisMs: analysis.analysisDurationMs ?? analysisMs,
    wallAnalysisMs: analysisMs,
    binanceWeight: analysis.weightUsed ?? weight.used,
    weightLimit: analysis.weightLimit ?? weight.limit,
    weightAfterCycle: weight.used,
    circuitOpen: weight.circuitOpen,
    lastBinanceFailure: failure
      ? { status: failure.status, kind: failure.kind, reason: failure.reason, path: failure.path }
      : null,
    snapshotPublishedAt: published?.publishedAt ?? null,
    snapshotCoinCount: coins.length,
    snapshotAnalyzed: analyzed,
    coverageNote: analysis.coverageNote,
    lastFullTop100PassAt: analysis.lastFullUniverseAt,
    workerHeartbeatAt: analysis.finishedAt,
    nextAnalysisCadenceMs: Number(process.env.SIGNALS_ANALYSIS_INTERVAL_MS || 300_000),
    acceptance: {
      selected100: analysis.selected === 100,
      analyzed100: analysis.analyzedCount === 100,
      exchangeOk: exchange.status === 200,
      tickerOk: ticker.status === 200,
      snapshotOk: Boolean(published?.publishedAt && coins.length === 100),
      legacyNetRrFloorOff: requirePublicationNetRr() === false,
      liveMode100: DEFAULT_LIVE_SCAN_MODE === "100",
    },
  };

  console.log("TOP100_BENCHMARK " + JSON.stringify(report));
  if (
    !report.acceptance.selected100
    || !report.acceptance.analyzed100
    || !report.acceptance.exchangeOk
    || !report.acceptance.liveMode100
  ) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
