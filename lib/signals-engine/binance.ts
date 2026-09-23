import {
  ALL_INTERVALS,
  SCAN_SYMBOLS,
  type AllowedInterval,
  type Candle,
  type SymbolFilters,
} from './types';
import {
  awaitBudget,
  circuitOpen,
  circuitOpenMessage,
  classifyBinanceError,
  endpointWeight,
  klineWeight,
  noteFailure,
  noteSuccess,
  recordUsedWeight,
  sanitizeBinanceReason,
} from './rate-limit';

const BASE = 'https://fapi.binance.com';
/** Soft TTL: refresh exchangeInfo infrequently; it does not need every scanner cycle. */
const EXCHANGE_TTL_MS = 30 * 60 * 1000;
/** Keep serving the last successful exchangeInfo during temporary Binance outages. */
const EXCHANGE_STALE_MAX_MS = 6 * 60 * 60 * 1000;
const TICKER_TTL_MS = 4000;
const MAX_TRANSIENT_ATTEMPTS = 3;

type CacheEntry<T> = { value: T; expires: number; fetchedAt: number };

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function intervalMs(interval: string): number {
  switch (interval) {
    case '1m':
      return 60_000;
    case '5m':
      return 300_000;
    case '15m':
      return 900_000;
    case '1h':
      return 3_600_000;
    case '4h':
      return 14_400_000;
    case '1d':
      return 86_400_000;
    default:
      return 60_000;
  }
}

function klineTtlMs(interval: string): number {
  const size = intervalMs(interval);
  const now = Date.now();
  const nextClose = Math.ceil((now + 1) / size) * size;
  return Math.max(2500, nextClose - now + 1200);
}

async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  options?: { allowStaleOnError?: boolean; maxStaleMs?: number },
): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const task = load()
    .then((value) => {
      const now = Date.now();
      cache.set(key, { value, expires: now + ttlMs, fetchedAt: now });
      return value;
    })
    .catch((error) => {
      if (
        options?.allowStaleOnError
        && hit
        && Date.now() - hit.fetchedAt <= (options.maxStaleMs ?? EXCHANGE_STALE_MAX_MS)
      ) {
        console.warn(JSON.stringify({
          event: 'binance_cache_stale_reuse',
          key,
          ageMs: Date.now() - hit.fetchedAt,
          reason: error instanceof Error ? error.message.slice(0, 180) : 'unknown',
        }));
        return hit.value;
      }
      throw error;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, task);
  return task;
}

function causeMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown network error';
  const cause = 'cause' in error && error.cause instanceof Error ? error.cause : error;
  if ('code' in cause && cause.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return 'TLS certificate verification failed. Start the app with npm run dev or npm start so Node uses the system certificate store.';
  }
  return cause.message || error.message;
}

function withJitter(ms: number): number {
  const base = Math.max(0, ms);
  const jitter = base * (0.15 * Math.random());
  return Math.min(30_000, Math.round(base + jitter));
}

/** Only 429/418 are retried. 451 and other client/legal failures are not retried. */
export function retryDelayMs(status: number, retryAfterHeader: string | null, attempt: number): number | null {
  if (status !== 429 && status !== 418) return null;
  const header = retryAfterHeader ? Number(retryAfterHeader) : NaN;
  if (Number.isFinite(header) && header >= 0) return withJitter(Math.min(30_000, header * 1000));
  return withJitter(Math.min(30_000, 1000 * 2 ** attempt));
}

export function isNonRetryableBinanceStatus(status: number): boolean {
  return status === 400 || status === 401 || status === 403 || status === 404 || status === 451;
}

function klineLimitFromPath(path: string): number {
  const match = path.match(/[?&]limit=(\d+)/);
  return match ? Number(match[1]) : 250;
}

async function binanceGet<T>(path: string, timeoutMs = 12000): Promise<T> {
  const estimated = endpointWeight(path, klineLimitFromPath(path));
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_TRANSIENT_ATTEMPTS; attempt++) {
    if (circuitOpen()) {
      throw Error(circuitOpenMessage(path));
    }
    await awaitBudget(estimated);
    try {
      const response = await fetch(`${BASE}${path}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: 'application/json' },
      });
      recordUsedWeight(response.headers.get('X-MBX-USED-WEIGHT-1M'), estimated);
      if (!response.ok) {
        const reason = sanitizeBinanceReason(response.status, 'http');
        noteFailure(response.status, { path, kind: 'http', reason });
        const delay = retryDelayMs(response.status, response.headers.get('Retry-After'), attempt);
        lastError = Error(`Binance request failed (${response.status}) for ${path}`);
        // Never aggressively retry legal/client failures such as 451.
        if (delay == null || isNonRetryableBinanceStatus(response.status) || attempt >= MAX_TRANSIENT_ATTEMPTS - 1) {
          throw lastError;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      noteSuccess();
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Binance request failed')) throw error;
      if (error instanceof Error && error.message.startsWith('Binance circuit open')) throw error;
      const classified = classifyBinanceError(error);
      const networkReason = classified.kind === 'unknown'
        ? sanitizeBinanceReason(null, 'network', causeMessage(error))
        : classified.reason;
      lastError = Error(`Binance request failed: ${causeMessage(error)}`);
      noteFailure(classified.status ?? undefined, {
        path,
        kind: classified.kind === 'unknown' ? 'network' : classified.kind,
        reason: networkReason,
      });
      if (attempt >= MAX_TRANSIENT_ATTEMPTS - 1) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, withJitter(300 * 2 ** attempt)));
    }
  }
  throw lastError || Error(`Binance request failed for ${path}`);
}

export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export type RawExchangeSymbol = {
  symbol: string;
  status: string;
  contractType?: string;
  quoteAsset?: string;
  pricePrecision?: number;
  filters?: Array<Record<string, string>>;
};

function readFilterNumber(filters: Array<Record<string, string>> | undefined, type: string, key: string, fallback: number) {
  const match = filters?.find((item) => item.filterType === type);
  const value = match?.[key];
  const parsed = value == null ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function filtersFromRaw(raw: RawExchangeSymbol): SymbolFilters {
  const quote = raw.quoteAsset || (raw.symbol.endsWith('USDT') ? 'USDT' : '');
  const trading = raw.status === 'TRADING' && raw.contractType === 'PERPETUAL' && quote === 'USDT';
  return {
    symbol: raw.symbol,
    status: raw.status,
    contractType: raw.contractType || 'UNKNOWN',
    tickSize: readFilterNumber(raw.filters, 'PRICE_FILTER', 'tickSize', 0.01),
    stepSize: readFilterNumber(raw.filters, 'LOT_SIZE', 'stepSize', 0.001),
    minQty: readFilterNumber(raw.filters, 'LOT_SIZE', 'minQty', 0),
    minNotional: readFilterNumber(raw.filters, 'MIN_NOTIONAL', 'notional', 5),
    pricePrecision: Number.isFinite(raw.pricePrecision) ? raw.pricePrecision : undefined,
    available: trading,
    reason: trading ? undefined : `Binance status ${raw.status}${raw.contractType ? ` (${raw.contractType})` : ''}`,
  };
}

export function invalidateExchangeInfo() {
  cache.delete('exchangeInfo:raw');
}

export async function getRawExchangeInfo(force = false): Promise<RawExchangeSymbol[]> {
  if (force) invalidateExchangeInfo();
  return cached(
    'exchangeInfo:raw',
    EXCHANGE_TTL_MS,
    async () => {
      const info = await binanceGet<{ symbols?: RawExchangeSymbol[] }>('/fapi/v1/exchangeInfo', 20000);
      return info.symbols || [];
    },
    { allowStaleOnError: true, maxStaleMs: EXCHANGE_STALE_MAX_MS },
  );
}

export async function getExchangeFilters(symbols: readonly string[] = SCAN_SYMBOLS): Promise<Map<string, SymbolFilters>> {
  const listed = new Map((await getRawExchangeInfo()).map((item) => [item.symbol, item]));
  const result = new Map<string, SymbolFilters>();
  for (const symbol of symbols) {
    const raw = listed.get(symbol);
    if (!raw) {
      result.set(symbol, {
        symbol,
        status: 'NOT_LISTED',
        contractType: '',
        tickSize: 0,
        stepSize: 0,
        minQty: 0,
        minNotional: 0,
        available: false,
        reason: 'Not listed on Binance USDT-M Futures',
      });
      continue;
    }
    result.set(symbol, filtersFromRaw(raw));
  }
  return result;
}

function pickMap<V>(all: Map<string, V>, symbols?: readonly string[]): Map<string, V> {
  if (!symbols) return all;
  const wanted = new Set(symbols);
  const result = new Map<string, V>();
  for (const [symbol, value] of all) {
    if (wanted.has(symbol)) result.set(symbol, value);
  }
  return result;
}

export async function getTickers(symbols?: readonly string[]): Promise<Map<string, number>> {
  const all = await cached('tickers:all', TICKER_TTL_MS, async () => {
    const rows = await binanceGet<Array<{ symbol: string; price: string }>>('/fapi/v1/ticker/price');
    const prices = new Map<string, number>();
    for (const row of rows) {
      const price = Number(row.price);
      if (Number.isFinite(price) && price > 0) prices.set(row.symbol, price);
    }
    return prices;
  });
  return pickMap(all, symbols);
}

export type Ticker24hrRow = { changePct: number; quoteVolume: number };

export async function getTicker24hrAll(): Promise<Map<string, Ticker24hrRow>> {
  return cached('ticker24hr:all', 15_000, async () => {
    const rows = await binanceGet<Array<{ symbol: string; priceChangePercent: string; quoteVolume?: string }>>('/fapi/v1/ticker/24hr');
    const result = new Map<string, Ticker24hrRow>();
    for (const row of rows) {
      const changePct = Number(row.priceChangePercent);
      const quoteVolume = Number(row.quoteVolume);
      result.set(row.symbol, {
        changePct: Number.isFinite(changePct) ? changePct : 0,
        quoteVolume: Number.isFinite(quoteVolume) ? quoteVolume : 0,
      });
    }
    return result;
  });
}

export async function getTicker24hr(symbols: readonly string[] = SCAN_SYMBOLS): Promise<Map<string, number>> {
  const all = await getTicker24hrAll();
  const changes = new Map<string, number>();
  for (const symbol of symbols) {
    const row = all.get(symbol);
    if (row) changes.set(symbol, row.changePct);
  }
  return changes;
}

export async function getSparklines(symbols: readonly string[] = SCAN_SYMBOLS): Promise<Map<string, number[]>> {
  const rows = await mapPool([...symbols], 4, async (symbol) => {
    try {
      const candles = await cached(`sparkline1h:${symbol}`, 60_000, async () => {
        const candles = await getCandles(symbol, '1h', 24);
        return candles.filter((item) => Number.isFinite(item.close) && item.close > 0).map((item) => item.close);
      });
      return { symbol, closes: candles };
    } catch {
      return { symbol, closes: [] as number[] };
    }
  });
  return new Map(rows.map((row) => [row.symbol, row.closes]));
}

export function isAllowedInterval(interval: string): interval is AllowedInterval {
  return (ALL_INTERVALS as readonly string[]).includes(interval);
}

export function parseKlines(raw: unknown[][], now = Date.now()): Candle[] {
  return raw.map((row) => ({
    openTime: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closed: Number(row[6]) < now,
  }));
}

export async function fetchKlines(
  symbol: string,
  interval: string,
  options: { limit?: number; startTime?: number } = {},
): Promise<Candle[]> {
  if (!/^[A-Z0-9]{5,20}$/.test(symbol) || !isAllowedInterval(interval)) {
    throw Error('Invalid market selection');
  }
  const limit = options.limit ?? 250;
  const start = options.startTime != null ? `&startTime=${options.startTime}` : '';
  const raw = await binanceGet<unknown[][]>(
    `/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}${start}`,
  );
  if (!Array.isArray(raw)) throw Error('Unexpected Binance kline response');
  return parseKlines(raw);
}

export async function getCandles(symbol: string, interval: string, limit = 250): Promise<Candle[]> {
  const key = `klines:${symbol}:${interval}:${limit}`;
  return cached(key, klineTtlMs(interval), () => fetchKlines(symbol, interval, { limit }));
}

export { klineWeight };

export function candlesAreStale(candles: Candle[], interval: string): boolean {
  const last = candles.filter((item) => item.closed).at(-1);
  if (!last) return true;
  return Date.now() - (last.openTime + intervalMs(interval)) > intervalMs(interval) * 2;
}

export type PremiumRow = {
  lastFundingRate: number | null;
  markPrice: number | null;
};

export async function getPremiumIndex(symbols?: readonly string[]): Promise<Map<string, PremiumRow>> {
  const all = await cached('premiumIndex:all', 30_000, async () => {
    const rows = await binanceGet<Array<{ symbol: string; lastFundingRate?: string; markPrice?: string }>>('/fapi/v1/premiumIndex');
    const result = new Map<string, PremiumRow>();
    for (const row of rows) {
      const funding = row.lastFundingRate == null ? null : Number(row.lastFundingRate);
      const mark = row.markPrice == null ? null : Number(row.markPrice);
      result.set(row.symbol, {
        lastFundingRate: Number.isFinite(funding) ? funding : null,
        markPrice: Number.isFinite(mark) && mark! > 0 ? mark : null,
      });
    }
    return result;
  });
  return pickMap(all, symbols);
}

export async function getOpenInterest(symbol: string): Promise<number | null> {
  if (!/^[A-Z0-9]{5,20}$/.test(symbol)) return null;
  try {
    return await cached(`oi:${symbol}`, 60_000, async () => {
      const row = await binanceGet<{ openInterest?: string }>(`/fapi/v1/openInterest?symbol=${symbol}`);
      const value = row.openInterest == null ? NaN : Number(row.openInterest);
      return Number.isFinite(value) ? value : null;
    });
  } catch {
    return null;
  }
}
