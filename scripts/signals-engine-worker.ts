/**
 * Persistent Pippinway Signals engine worker (TypeScript entry).
 * Invoked by: npm run monitor:worker
 *
 * Dual cadence:
 * - Fast market monitor (~60s): prices, 24h stats, lifecycle, heartbeat
 * - Full Top 50 analysis: complete technical pass for all selected symbols (cache-aware)
 *
 * Binance requests run on THIS host. Vercel only reads Firestore snapshots.
 */
import { runFastMarketMonitor, runFullTop50Analysis } from "../lib/signals-engine/monitor-cycle";

const PRICE_INTERVAL_MS = Number(process.env.SIGNALS_PRICE_INTERVAL_MS || process.env.SIGNALS_MONITOR_INTERVAL_MS || 60_000);
const ANALYSIS_INTERVAL_MS = Number(process.env.SIGNALS_ANALYSIS_INTERVAL_MS || 180_000);

let priceInFlight = false;
let analysisInFlight = false;
let shuttingDown = false;
let lastAnalysisAt = 0;

function log(event: string, payload: Record<string, unknown>) {
  console.log(JSON.stringify({ event, at: new Date().toISOString(), ...payload }));
}

async function priceTick() {
  if (shuttingDown || priceInFlight || analysisInFlight) {
    log("skip_price", { reason: priceInFlight ? "price_inflight" : analysisInFlight ? "analysis_inflight" : "shutdown" });
    return;
  }
  priceInFlight = true;
  const started = Date.now();
  try {
    const cycle = await runFastMarketMonitor();
    log("price_cycle", {
      ok: cycle.ok,
      ms: Date.now() - started,
      overlapped: cycle.overlapped,
      priceUpdatedCount: cycle.priceUpdatedCount,
      selected: cycle.selected,
      analyzedCount: cycle.analyzedCount,
      long: cycle.long,
      short: cycle.short,
      wait: cycle.wait,
      weightUsed: cycle.weightUsed,
      note: cycle.coverageNote || cycle.error || null,
    });
  } catch (error) {
    log("price_cycle_error", {
      ms: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    priceInFlight = false;
  }
}

async function analysisTick(force = false) {
  if (shuttingDown || analysisInFlight) {
    log("skip_analysis", { reason: shuttingDown ? "shutdown" : "analysis_inflight" });
    return;
  }
  const due = force || Date.now() - lastAnalysisAt >= ANALYSIS_INTERVAL_MS;
  if (!due) return;
  // Wait briefly if a price tick is running so we don't fight the lease.
  if (priceInFlight) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (priceInFlight) {
      log("skip_analysis", { reason: "price_inflight" });
      return;
    }
  }
  analysisInFlight = true;
  const started = Date.now();
  try {
    const cycle = await runFullTop50Analysis();
    lastAnalysisAt = Date.now();
    log("analysis_cycle", {
      ok: cycle.ok,
      ms: Date.now() - started,
      overlapped: cycle.overlapped,
      selected: cycle.selected,
      analyzed: cycle.analyzed?.length ?? 0,
      analyzedCount: cycle.analyzedCount,
      fresh: cycle.fresh,
      pending: cycle.pending,
      failed: cycle.failed,
      long: cycle.long,
      short: cycle.short,
      wait: cycle.wait,
      analysisDurationMs: cycle.analysisDurationMs,
      lastFullUniverseAt: cycle.lastFullUniverseAt,
      weightUsed: cycle.weightUsed,
      note: cycle.coverageNote || cycle.error || null,
    });
  } catch (error) {
    log("analysis_cycle_error", {
      ms: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    analysisInFlight = false;
  }
}

async function priceLoop() {
  while (!shuttingDown) {
    const started = Date.now();
    await priceTick();
    const wait = Math.max(1_000, PRICE_INTERVAL_MS - (Date.now() - started));
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

async function analysisLoop() {
  // First analysis soon after start so the board fills without waiting a full interval.
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  await analysisTick(true);
  while (!shuttingDown) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(5_000, Math.min(30_000, ANALYSIS_INTERVAL_MS / 6))));
    await analysisTick(false);
  }
}

function onSignal(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("worker_shutdown", { signal });
  // Allow in-flight work a moment, then exit.
  setTimeout(() => process.exit(0), 5_000).unref?.();
}

process.on("SIGINT", () => onSignal("SIGINT"));
process.on("SIGTERM", () => onSignal("SIGTERM"));

log("worker_start", {
  mode: "engine-dual",
  priceIntervalMs: PRICE_INTERVAL_MS,
  analysisIntervalMs: ANALYSIS_INTERVAL_MS,
  binanceHost: "local-engine",
});

void priceLoop();
void analysisLoop();
