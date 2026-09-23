/**
 * Persistent Pippinway Signals monitor.
 *
 * Vercel Cron only pings /api/signals/monitor once a minute and then exits.
 * This process keeps a 60-second cadence, waits for each cycle to finish,
 * and never starts a second cycle while one is in flight.
 *
 *   SIGNALS_MONITOR_URL=https://your-app.vercel.app
 *   SIGNALS_MONITOR_SECRET=...
 *   npm run monitor:worker
 */
const BASE = (process.env.SIGNALS_MONITOR_URL || "http://127.0.0.1:3012").replace(/\/$/, "");
const SECRET = process.env.SIGNALS_MONITOR_SECRET || "";
const INTERVAL_MS = Number(process.env.SIGNALS_MONITOR_INTERVAL_MS || 60_000);

let inFlight = false;

async function tick() {
  if (inFlight) {
    console.log(JSON.stringify({ event: "skip_overlap", at: new Date().toISOString() }));
    return { overlapped: true };
  }
  inFlight = true;
  const started = Date.now();
  try {
    const response = await fetch(`${BASE}/api/signals/monitor`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "x-signals-monitor-secret": SECRET,
      },
    });
    const body = await response.json().catch(() => ({}));
    console.log(JSON.stringify({
      event: "cycle",
      status: response.status,
      ms: Date.now() - started,
      overlapped: Boolean(body.overlapped),
      analyzed: body.cycle?.analyzed?.length ?? null,
      backlog: body.cycle?.backlog ?? null,
      weightUsed: body.cycle?.weightUsed ?? null,
      durationMs: body.cycle?.durationMs ?? null,
      fullUniverseMs: body.cycle?.lastFullUniverseDurationMs ?? null,
      note: body.note || body.cycle?.coverageNote || null,
    }));
    return body;
  } catch (error) {
    console.error(JSON.stringify({
      event: "cycle_error",
      ms: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    }));
    return { ok: false };
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
  url: `${BASE}/api/signals/monitor`,
  intervalMs: INTERVAL_MS,
  at: new Date().toISOString(),
}));
void loop();
