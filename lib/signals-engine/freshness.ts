import type { CoinScan } from './types';
import { needsTimeframeRefresh } from './candle-cache';

const QUEUE_INTERVALS = ['15m', '1h', '4h'] as const;

export type Freshness = 'fresh' | 'updating' | 'stale' | 'failed' | 'never_scanned';

const FRESH_MS = 3 * 60_000;
const STALE_MS = 15 * 60_000;

export function classifyCoin(coin: CoinScan | undefined, now = Date.now()): Freshness {
  if (!coin || !coin.scanState || coin.scanState === 'pending') return 'never_scanned';
  if (coin.scanState === 'failed' || coin.scanState === 'timeout') return 'failed';
  if (coin.scanState === 'skipped' || !coin.available) return 'failed';
  const analyzed = Date.parse(coin.analyzedAt || '') || 0;
  if (!analyzed) return 'never_scanned';
  if (coin.stale || now - analyzed > STALE_MS) return 'stale';
  if (coin.scanState === 'ready' && now - analyzed <= FRESH_MS) return 'fresh';
  return 'updating';
}

export function freshnessCounts(coins: Array<CoinScan | undefined>, now = Date.now()) {
  const counts = { fresh: 0, updating: 0, stale: 0, failed: 0, never_scanned: 0 };
  for (const coin of coins) counts[classifyCoin(coin, now)] += 1;
  return counts;
}

export function symbolNeedsAnalysis(symbol: string, coin: CoinScan | undefined, force = false, now = Date.now()): boolean {
  if (force) return true;
  const freshness = classifyCoin(coin, now);
  if (freshness === 'never_scanned' || freshness === 'failed' || freshness === 'stale') return true;
  return QUEUE_INTERVALS.some((interval) => needsTimeframeRefresh(symbol, interval, now));
}

export function prioritizeSymbols(input: {
  symbols: string[];
  coins: Map<string, CoinScan>;
  activeSymbols?: Iterable<string>;
  force?: boolean;
  now?: number;
}): string[] {
  const now = input.now ?? Date.now();
  const active = new Set(input.activeSymbols || []);
  const scored = input.symbols.map((symbol, index) => {
    const coin = input.coins.get(symbol);
    const freshness = classifyCoin(coin, now);
    let score = 0;
    if (active.has(symbol)) score += 1000;
    if (freshness === 'never_scanned') score += 400;
    if (freshness === 'failed') score += 300;
    if (freshness === 'stale') score += 200;
    if (symbolNeedsAnalysis(symbol, coin, input.force, now)) score += 50;
    if (freshness === 'fresh' && !active.has(symbol) && !input.force) score -= 500;
    return { symbol, score, index };
  });
  return scored
    .filter((row) => row.score > 0 || input.force)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((row) => row.symbol);
}
