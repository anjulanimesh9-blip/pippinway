export type MonitorHealth = {
  lastCycleAt?: string | null;
  lastPriceAt?: string | null;
  lastScanAt?: string | null;
  lastSuccessAt?: string | null;
  monitoring?: string | null;
  workerStatus?: string | null;
};

const LIVE_MS = 3 * 60_000;

export function lastMonitorAt(health?: MonitorHealth | null) {
  const stamps = [health?.lastCycleAt, health?.lastSuccessAt, health?.lastPriceAt, health?.lastScanAt]
    .map((value) => Date.parse(value || ""))
    .filter((value) => Number.isFinite(value));
  return stamps.length ? Math.max(...stamps) : 0;
}

export function workerLooksOnline(health?: MonitorHealth | null) {
  const status = (health?.workerStatus || health?.monitoring || "").toLowerCase();
  return status === "running";
}

export function monitorIsLive(health?: MonitorHealth | null, now = Date.now()) {
  const last = lastMonitorAt(health);
  return workerLooksOnline(health) && last > 0 && now - last <= LIVE_MS;
}

export function monitorStatusLabel(health?: MonitorHealth | null, now = Date.now()) {
  if (monitorIsLive(health, now)) return "Live";
  const status = (health?.workerStatus || health?.monitoring || "").toLowerCase();
  if (status === "overlapping") return "Busy";
  if (status === "error") return "Error";
  if (lastMonitorAt(health) > 0) return "Delayed";
  return "Offline";
}

export function nextCycleLabel(health?: MonitorHealth | null, now = Date.now()) {
  const last = lastMonitorAt(health);
  if (!last) return "Waiting for the first cycle";
  const due = last + 60_000;
  if (due <= now) return "Due now";
  return `In ${Math.max(1, Math.round((due - now) / 1000))}s`;
}
