export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Never enable inline monitoring on Vercel — Binance Production egress returns HTTP 451.
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return;
  if (process.env.SIGNALS_MONITOR_INLINE === "1") {
    const { startSignalsMonitor } = await import("./lib/signals-engine/monitor");
    startSignalsMonitor();
  }
}
