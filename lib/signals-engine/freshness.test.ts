import { describe, expect, it, beforeEach } from 'vitest';
import { resetCandleCache, setCachedCandles } from './candle-cache';
import { classifyCoin, freshnessCounts, prioritizeSymbols, symbolNeedsAnalysis } from './freshness';
import type { CoinScan } from './types';

function coin(partial: Partial<CoinScan>): CoinScan {
  return {
    symbol: 'BTCUSDT',
    available: true,
    price: 100,
    priceUpdatedAt: new Date().toISOString(),
    stale: false,
    trend: 'BULLISH',
    direction: 'WAIT',
    pattern: 'None',
    patternStatus: 'UNAVAILABLE',
    timeframes: [],
    setup: null,
    entryConditions: '',
    reason: '',
    nextStep: '',
    lastCandleCloseAt: null,
    analyzedAt: new Date().toISOString(),
    scanState: 'ready',
    ...partial,
  } as CoinScan;
}

describe('analysis freshness and queue priority', () => {
  beforeEach(() => resetCandleCache());

  it('classifies never scanned, stale, failed, and fresh coins', () => {
    expect(classifyCoin(undefined)).toBe('never_scanned');
    expect(classifyCoin(coin({ scanState: 'pending' }))).toBe('never_scanned');
    expect(classifyCoin(coin({ scanState: 'failed' }))).toBe('failed');
    expect(classifyCoin(coin({ stale: true }))).toBe('stale');
    expect(classifyCoin(coin({ analyzedAt: new Date().toISOString() }))).toBe('fresh');
    const counts = freshnessCounts([undefined, coin({ scanState: 'failed' })]);
    expect(counts.never_scanned).toBe(1);
    expect(counts.failed).toBe(1);
  });

  it('prioritizes active signals, never scanned, and stale over fresh coins', () => {
    const now = Date.now();
    const coins = new Map<string, CoinScan>([
      ['AAAUSDT', coin({ symbol: 'AAAUSDT', analyzedAt: new Date(now).toISOString() })],
      ['BBBUSDT', coin({ symbol: 'BBBUSDT', scanState: 'pending', analyzedAt: '' })],
      ['CCCUSDT', coin({ symbol: 'CCCUSDT', stale: true, analyzedAt: new Date(now - 20 * 60_000).toISOString() })],
    ]);
    const order = prioritizeSymbols({
      symbols: ['AAAUSDT', 'BBBUSDT', 'CCCUSDT'],
      coins,
      activeSymbols: ['AAAUSDT'],
      now,
    });
    expect(order[0]).toBe('AAAUSDT');
    expect(order.slice(1)).toEqual(['BBBUSDT', 'CCCUSDT']);
  });

  it('does not queue every coin just because a 1m candle closed', () => {
    const now = Date.now();
    for (const interval of ['15m', '1h', '4h'] as const) {
      const size = interval === '15m' ? 900_000 : interval === '1h' ? 3_600_000 : 14_400_000;
      setCachedCandles('BTCUSDT', interval, [{
        openTime: Math.floor(now / size) * size - size,
        open: 1, high: 1, low: 1, close: 1, volume: 1, closed: true,
      }]);
    }
    const ready = coin({ analyzedAt: new Date(now).toISOString(), stale: false });
    expect(symbolNeedsAnalysis('BTCUSDT', ready, false, now)).toBe(false);
  });

  it('requires analysis when a cached timeframe has a new closed candle due', () => {
    const now = 1_700_000_000_000;
    setCachedCandles('BTCUSDT', '15m', [{
      openTime: expectedOld15m(now),
      open: 1, high: 1, low: 1, close: 1, volume: 1, closed: true,
    }]);
    expect(symbolNeedsAnalysis('ETHUSDT', undefined, false, now)).toBe(true);
  });
});

function expectedOld15m(now: number) {
  const size = 900_000;
  return Math.floor(now / size) * size - size * 3;
}
