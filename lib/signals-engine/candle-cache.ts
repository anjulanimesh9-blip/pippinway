import type { AllowedInterval, Candle } from './types';
import { fetchKlines, intervalMs } from './binance';

const WARM_LIMIT = 250;
const INCREMENTAL_LIMIT = 6;

export type CandleCacheEntry = {
  candles: Candle[];
  lastClosedOpenTime: number | null;
  fetchedAt: number;
};

const cache = new Map<string, CandleCacheEntry>();

export function candleCacheKey(symbol: string, interval: string): string {
  return `${symbol}:${interval}`;
}

export function resetCandleCache() {
  cache.clear();
}

export function getCachedCandles(symbol: string, interval: string): Candle[] | null {
  return cache.get(candleCacheKey(symbol, interval))?.candles ?? null;
}

export function getCandleCacheEntry(symbol: string, interval: string): CandleCacheEntry | undefined {
  return cache.get(candleCacheKey(symbol, interval));
}

export function lastClosedOpenTime(candles: Candle[]): number | null {
  return candles.filter((item) => item.closed).at(-1)?.openTime ?? null;
}

export function expectedLastClosedOpenTime(interval: string, now = Date.now()): number {
  const size = intervalMs(interval);
  return Math.floor(now / size) * size - size;
}

export function needsTimeframeRefresh(symbol: string, interval: string, now = Date.now()): boolean {
  const hit = cache.get(candleCacheKey(symbol, interval));
  if (!hit || !hit.candles.length || hit.lastClosedOpenTime == null) return true;
  return hit.lastClosedOpenTime < expectedLastClosedOpenTime(interval, now);
}

export function mergeCandles(existing: Candle[], incoming: Candle[], limit = WARM_LIMIT): Candle[] {
  const byOpen = new Map<number, Candle>();
  for (const candle of existing) {
    if (Number.isFinite(candle.openTime)) byOpen.set(candle.openTime, candle);
  }
  for (const candle of incoming) {
    if (Number.isFinite(candle.openTime)) byOpen.set(candle.openTime, candle);
  }
  return [...byOpen.values()]
    .sort((a, b) => a.openTime - b.openTime)
    .slice(-limit);
}

export function setCachedCandles(symbol: string, interval: string, candles: Candle[], now = Date.now()): CandleCacheEntry {
  const merged = mergeCandles([], candles, WARM_LIMIT);
  const entry: CandleCacheEntry = {
    candles: merged,
    lastClosedOpenTime: lastClosedOpenTime(merged),
    fetchedAt: now,
  };
  cache.set(candleCacheKey(symbol, interval), entry);
  return entry;
}

export async function getCandlesIncremental(
  symbol: string,
  interval: AllowedInterval | string,
  limit = WARM_LIMIT,
): Promise<Candle[]> {
  const key = candleCacheKey(symbol, interval);
  const hit = cache.get(key);
  if (!hit || hit.candles.length < Math.min(40, limit)) {
    const fresh = await fetchKlines(symbol, interval, { limit });
    setCachedCandles(symbol, interval, fresh);
    return getCachedCandles(symbol, interval) || fresh;
  }

  if (!needsTimeframeRefresh(symbol, interval) && hit.candles.length) {
    const forming = hit.candles.at(-1);
    if (forming && !forming.closed) {
      const tip = await fetchKlines(symbol, interval, { limit: 2 });
      const merged = mergeCandles(hit.candles, tip, limit);
      setCachedCandles(symbol, interval, merged);
      return merged;
    }
    return hit.candles;
  }

  const startTime = hit.lastClosedOpenTime ?? hit.candles[0]?.openTime;
  const incoming = await fetchKlines(symbol, interval, {
    limit: INCREMENTAL_LIMIT,
    startTime: startTime ?? undefined,
  });
  const merged = mergeCandles(hit.candles, incoming, limit);
  setCachedCandles(symbol, interval, merged);
  return merged;
}

export function restoreCandleCloses(closes: Record<string, number>) {
  for (const [key, openTime] of Object.entries(closes)) {
    if (!Number.isFinite(openTime)) continue;
    const existing = cache.get(key);
    if (existing) {
      existing.lastClosedOpenTime = openTime;
      continue;
    }
    cache.set(key, { candles: [], lastClosedOpenTime: openTime, fetchedAt: 0 });
  }
}

export function serializeCandleCloses(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, entry] of cache) {
    if (entry.lastClosedOpenTime != null) out[key] = entry.lastClosedOpenTime;
  }
  return out;
}
