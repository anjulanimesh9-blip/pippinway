/**
 * Persistent Pippinway Signals engine worker (TypeScript entry).
 * Invoked by: npm run monitor:worker
 *
 * Runs Binance + Signals engine on this host and publishes to Firestore via Firebase Admin.
 */
import { runMonitoringCycle } from "../lib/signals-engine/monitor-cycle";

const INTERVAL_MS = Number(process.env.SIGNALS_MONITOR_INTERVAL_MS || 60_000);
let inFlight = false;

async function tick() {
  if (inFlight) {
    console.log(JSON.stringify({ event: "skip_overlap", at: new Date().toISOString() }));
    return;
  }
  inFlight = true;
  const started = Date.now();
  try {
    const cycle = await runMonitoringCycle();
    console.log(JSON.stringify({
      event: "cycle",
      mode: "engine",
      ok: cycle.ok,
      ms: Date.now() - started,
      overlapped: cycle.overlapped,
      analyzed: cycle.analyzed?.length ?? 0,
      backlog: cycle.backlog ?? null,
      weightUsed: cycle.weightUsed ?? null,
      durationMs: cycle.durationMs ?? null,
      eligible: cycle.eligible ?? null,
      selected: cycle.selected ?? null,
      long: cycle.long ?? null,
      short: cycle.short ?? null,
      wait: cycle.wait ?? null,
      note: cycle.coverageNote || cycle.error || null,
    }));
  } catch (error) {
    console.error(JSON.stringify({
      event: "cycle_error",
      ms: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    }));
  } finally {
    inFlight = false;
  }
}

async function loop() {
  const started = Date.now();
  await tick();
  const wait = Math.max(0, INTERVAL_MS - (Date.now() - started));
  setTimeout(() => {
    void loop();
  }, wait);
}

console.log(JSON.stringify({
  event: "worker_start",
  mode: "engine",
  intervalMs: INTERVAL_MS,
  binanceHost: "local-engine",
  at: new Date().toISOString(),
}));

void loop();
