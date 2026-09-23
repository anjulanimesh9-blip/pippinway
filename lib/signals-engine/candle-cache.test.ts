import { describe, expect, it, beforeEach } from 'vitest';
import {
  expectedLastClosedOpenTime,
  lastClosedOpenTime,
  mergeCandles,
  needsTimeframeRefresh,
  resetCandleCache,
  setCachedCandles,
} from './candle-cache';
import type { Candle } from './types';

function candle(openTime: number, closed = true): Candle {
  return { openTime, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10, closed };
}

describe('incremental candle cache', () => {
  beforeEach(() => resetCandleCache());

  it('merges by openTime and keeps the newest forming candle', () => {
    const first = [candle(0), candle(60_000), candle(120_000, false)];
    const next = [candle(120_000, true), candle(180_000, false)];
    const merged = mergeCandles(first, next, 10);
    expect(merged.map((item) => [item.openTime, item.closed])).toEqual([
      [0, true],
      [60_000, true],
      [120_000, true],
      [180_000, false],
    ]);
    expect(lastClosedOpenTime(merged)).toBe(120_000);
  });

  it('requests a refresh only after a new closed candle is due', () => {
    const now = 1_700_000_000_000;
    const size = 900_000;
    const lastClosed = Math.floor(now / size) * size - size;
    setCachedCandles('BTCUSDT', '15m', [candle(lastClosed)]);
    expect(needsTimeframeRefresh('BTCUSDT', '15m', now)).toBe(false);
    expect(needsTimeframeRefresh('BTCUSDT', '15m', now + size + 1)).toBe(true);
    expect(expectedLastClosedOpenTime('15m', now)).toBe(lastClosed);
  });

  it('treats an empty cache as needing a warm fetch', () => {
    expect(needsTimeframeRefresh('ETHUSDT', '1h')).toBe(true);
  });
});
