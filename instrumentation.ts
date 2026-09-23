export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SIGNALS_MONITOR_INLINE === "1") {
    const { startSignalsMonitor } = await import("./lib/signals-engine/monitor");
    startSignalsMonitor();
  }
}
