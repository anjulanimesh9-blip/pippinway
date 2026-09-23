/**
 * Persistent Pippinway Signals monitor entry.
 *
 * Default (SIGNALS_WORKER_MODE=engine|unset): run Binance + engine on THIS host via tsx.
 * Legacy (SIGNALS_WORKER_MODE=http): POST to SIGNALS_MONITOR_URL (Binance still runs on that host).
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=...
 *   npm run monitor:worker
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODE = (process.env.SIGNALS_WORKER_MODE || "engine").toLowerCase();

if (MODE === "http") {
  const BASE = (process.env.SIGNALS_MONITOR_URL || "http://127.0.0.1:3012").replace(/\/$/, "");
  const SECRET = process.env.SIGNALS_MONITOR_SECRET || "";
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
      const response = await fetch(`${BASE}/api/signals/monitor`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-signals-monitor-secret": SECRET,
        },
      });
      const body = await response.json().catch(() => ({}));
      console.log(JSON.stringify({
        event: "cycle_http",
        status: response.status,
        ms: Date.now() - started,
        overlapped: Boolean(body.overlapped),
        analyzed: body.cycle?.analyzed?.length ?? null,
        note: body.note || body.cycle?.coverageNote || null,
        warning: "SIGNALS_WORKER_MODE=http still executes Binance inside the target URL host",
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
    mode: "http",
    url: `${BASE}/api/signals/monitor`,
    intervalMs: INTERVAL_MS,
    at: new Date().toISOString(),
  }));
  void loop();
} else {
  const tsxCli = path.join(ROOT, "node_modules", "tsx", "dist", "cli.mjs");
  const worker = path.join(ROOT, "scripts", "signals-engine-worker.ts");
  const child = spawn(
    process.execPath,
    ["--use-system-ca", tsxCli, worker],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    },
  );
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}
