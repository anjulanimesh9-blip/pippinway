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

export type BinanceFailureKind =
  | 'http'
  | 'timeout'
  | 'dns'
  | 'network'
  | 'tls'
  | 'unknown';

export type BinanceFailureRecord = {
  at: string;
  path: string | null;
  status: number | null;
  kind: BinanceFailureKind;
  reason: string;
  openedCircuit: boolean;
};

export type WeightSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  windowStartedAt: number;
  circuitOpen: boolean;
  circuitOpenUntil: number;
  consecutiveFailures: number;
  lastRequestAt: number | null;
  lastFailure: BinanceFailureRecord | null;
};

type State = {
  used: number;
  limit: number;
  windowStartedAt: number;
  consecutiveFailures: number;
  circuitOpenUntil: number;
  lastRequestAt: number | null;
  lastFailure: BinanceFailureRecord | null;
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
    lastFailure: null,
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

export function sanitizeBinanceReason(status?: number | null, kind: BinanceFailureKind = 'http', detail?: string): string {
  if (status === 429) return 'HTTP 429 Too Many Requests';
  if (status === 418) return 'HTTP 418 IP ban / rate-limit ban';
  if (status === 451) return 'HTTP 451 Unavailable For Legal Reasons (egress/geo restriction)';
  if (status === 403) return 'HTTP 403 Forbidden';
  if (status === 401) return 'HTTP 401 Unauthorized';
  if (status != null && status >= 500) return `HTTP ${status} upstream server error`;
  if (status != null) return `HTTP ${status}`;
  if (kind === 'timeout') return 'timeout';
  if (kind === 'dns') return 'DNS/network name resolution failure';
  if (kind === 'tls') return 'TLS/certificate failure';
  if (kind === 'network') return 'network error';
  if (detail) {
    const trimmed = detail.replace(/\s+/g, ' ').trim().slice(0, 160);
    return trimmed || 'unknown failure';
  }
  return 'unknown failure';
}

export function classifyBinanceError(error: unknown): { kind: BinanceFailureKind; reason: string; status: number | null } {
  if (!(error instanceof Error)) {
    return { kind: 'unknown', reason: sanitizeBinanceReason(null, 'unknown'), status: null };
  }
  const message = error.message || '';
  const http = message.match(/Binance request failed \((\d{3})\)/);
  if (http) {
    const status = Number(http[1]);
    return { kind: 'http', status, reason: sanitizeBinanceReason(status, 'http') };
  }
  const cause = 'cause' in error && error.cause instanceof Error ? error.cause : error;
  const code = 'code' in cause ? String((cause as { code?: string }).code || '') : '';
  const text = `${code} ${cause.message || message}`.toLowerCase();
  if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || text.includes('certificate')) {
    return { kind: 'tls', status: null, reason: sanitizeBinanceReason(null, 'tls') };
  }
  if (text.includes('abort') || text.includes('timeout') || code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT') {
    return { kind: 'timeout', status: null, reason: sanitizeBinanceReason(null, 'timeout') };
  }
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || text.includes('getaddrinfo')) {
    return { kind: 'dns', status: null, reason: sanitizeBinanceReason(null, 'dns') };
  }
  if (code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'EHOSTUNREACH' || text.includes('fetch failed')) {
    return { kind: 'network', status: null, reason: sanitizeBinanceReason(null, 'network', message) };
  }
  return { kind: 'unknown', status: null, reason: sanitizeBinanceReason(null, 'unknown', message) };
}

export function noteSuccess() {
  state.consecutiveFailures = 0;
}

export function noteFailure(
  status?: number,
  detail?: { path?: string; kind?: BinanceFailureKind; reason?: string },
) {
  state.consecutiveFailures += 1;
  const kind = detail?.kind || (status != null ? 'http' : 'unknown');
  const reason = detail?.reason || sanitizeBinanceReason(status, kind);
  const shouldOpen = status === 418 || status === 451 || state.consecutiveFailures >= CIRCUIT_FAILURES;
  const wasOpen = circuitOpen();
  if (shouldOpen) {
    state.circuitOpenUntil = nowMs() + CIRCUIT_OPEN_MS;
  }
  const openedCircuit = shouldOpen && !wasOpen;
  state.lastFailure = {
    at: new Date().toISOString(),
    path: detail?.path || null,
    status: status ?? null,
    kind,
    reason,
    openedCircuit,
  };
  if (openedCircuit) {
    console.warn(JSON.stringify({
      event: 'binance_circuit_open',
      status: status ?? null,
      kind,
      reason,
      path: detail?.path || null,
      consecutiveFailures: state.consecutiveFailures,
      openForMs: CIRCUIT_OPEN_MS,
    }));
  }
}

export function circuitOpen(at = nowMs()): boolean {
  return state.circuitOpenUntil > at;
}

export function lastBinanceFailure(): BinanceFailureRecord | null {
  return state.lastFailure;
}

export function circuitOpenMessage(path: string): string {
  const last = state.lastFailure;
  if (!last) return `Binance circuit open for ${path}`;
  const statusPart = last.status != null ? `HTTP ${last.status}` : last.kind;
  return `Binance circuit open for ${path} (opened after ${statusPart}: ${last.reason})`;
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
    lastFailure: state.lastFailure,
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
