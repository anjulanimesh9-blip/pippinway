export const BINANCE_WEIGHT_LIMIT_1M = 2400;
export const WEIGHT_SAFETY_RATIO = 0.85;
export const CIRCUIT_FAILURES = 5;
export const CIRCUIT_OPEN_MS = 30_000;

export function klineWeight(limit: number): number {
  if (limit <= 99) return 1;
  if (limit <= 499) return 2;
  if (limit <= 1000) return 5;
  return 10;
}

export function endpointWeight(path: string, klineLimit = 250): number {
  if (path.includes('/klines')) return klineWeight(klineLimit);
  if (path.includes('/ticker/24hr')) return 40;
  if (path.includes('/ticker/price')) return 2;
  if (path.includes('/premiumIndex')) return 10;
  if (path.includes('/exchangeInfo')) return 1;
  if (path.includes('/openInterest')) return 1;
  return 1;
}

export type WeightSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  windowStartedAt: number;
  circuitOpen: boolean;
  circuitOpenUntil: number;
  consecutiveFailures: number;
  lastRequestAt: number | null;
};

type State = {
  used: number;
  limit: number;
  windowStartedAt: number;
  consecutiveFailures: number;
  circuitOpenUntil: number;
  lastRequestAt: number | null;
};

function nowMs() {
  return Date.now();
}

function freshState(): State {
  return {
    used: 0,
    limit: BINANCE_WEIGHT_LIMIT_1M,
    windowStartedAt: nowMs(),
    consecutiveFailures: 0,
    circuitOpenUntil: 0,
    lastRequestAt: null,
  };
}

let state = freshState();

function rollWindow(at = nowMs()) {
  if (at - state.windowStartedAt >= 60_000) {
    state.used = 0;
    state.windowStartedAt = at;
  }
}

export function resetRateLimiter() {
  state = freshState();
}

export function recordUsedWeight(headerValue: string | null, estimated: number) {
  rollWindow();
  const parsed = headerValue == null ? NaN : Number(headerValue);
  state.used = Number.isFinite(parsed) ? parsed : state.used + Math.max(0, estimated);
  state.lastRequestAt = nowMs();
}

export function noteSuccess() {
  state.consecutiveFailures = 0;
}

export function noteFailure(status?: number) {
  state.consecutiveFailures += 1;
  if (status === 418 || state.consecutiveFailures >= CIRCUIT_FAILURES) {
    state.circuitOpenUntil = nowMs() + CIRCUIT_OPEN_MS;
  }
}

export function circuitOpen(at = nowMs()): boolean {
  return state.circuitOpenUntil > at;
}

export function weightSnapshot(at = nowMs()): WeightSnapshot {
  rollWindow(at);
  return {
    used: state.used,
    limit: state.limit,
    remaining: Math.max(0, state.limit - state.used),
    windowStartedAt: state.windowStartedAt,
    circuitOpen: circuitOpen(at),
    circuitOpenUntil: state.circuitOpenUntil,
    consecutiveFailures: state.consecutiveFailures,
    lastRequestAt: state.lastRequestAt,
  };
}

export function canSpend(needed: number, at = nowMs()): boolean {
  if (circuitOpen(at)) return false;
  rollWindow(at);
  return state.used + needed <= state.limit * WEIGHT_SAFETY_RATIO;
}

export async function awaitBudget(needed: number): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const at = nowMs();
    if (circuitOpen(at)) {
      await sleep(Math.min(CIRCUIT_OPEN_MS, state.circuitOpenUntil - at + 25));
      continue;
    }
    rollWindow(at);
    if (canSpend(needed, at)) return;
    const wait = Math.min(15_000, Math.max(250, 60_000 - (at - state.windowStartedAt) + 50));
    await sleep(wait);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
