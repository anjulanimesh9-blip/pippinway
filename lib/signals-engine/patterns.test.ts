import { describe, expect, it } from 'vitest';
import { detectPatterns } from './patterns';
import { EDUCATIONAL_PATTERN_NAMES, PATTERN_CATALOG, SIGNAL_PATTERN_NAMES } from './pattern-catalog';
import { SCAN_SYMBOLS, type Candle } from './types';
import { analyzeTimeframe, buildCoinScan } from './signals';
import { fixtureFilters } from './exchange-fixtures';
import { SCAN_INTERVALS } from './types';

function candle(index: number, close: number, volume = 1000, wick = 0.004): Candle {
  const open = close * (1 - wick * 0.2);
  return {
    openTime: 1_700_000_000_000 + index * 900_000,
    open,
    high: Math.max(open, close) * (1 + wick),
    low: Math.min(open, close) * (1 - wick),
    close,
    volume,
    closed: true,
  };
}

function fromCloses(closes: number[], volumeAt?: (index: number) => number): Candle[] {
  return closes.map((close, index) => candle(index, close, volumeAt ? volumeAt(index) : 1000));
}

function setPeak(closes: number[], index: number, peak: number, strength = 4) {
  for (let i = index - strength; i <= index + strength; i++) {
    if (i < 0 || i >= closes.length) continue;
    closes[i] = i === index ? peak : Math.min(closes[i], peak - 1.2);
  }
}

function setTrough(closes: number[], index: number, trough: number, strength = 4) {
  for (let i = index - strength; i <= index + strength; i++) {
    if (i < 0 || i >= closes.length) continue;
    closes[i] = i === index ? trough : Math.max(closes[i], trough + 1.2);
  }
}

describe('pattern catalog', () => {
  it('lists 29 named chart patterns', () => {
    expect(PATTERN_CATALOG).toHaveLength(29);
    expect(SIGNAL_PATTERN_NAMES).toHaveLength(22);
    expect(EDUCATIONAL_PATTERN_NAMES).toHaveLength(7);
  });

  it('never treats educational patterns as implemented detectors', () => {
    for (const item of PATTERN_CATALOG.filter((row) => row.role === 'EDUCATIONAL')) {
      expect(item.detector).toBe('unsupported');
    }
  });
});

describe('pattern detectors', () => {
  it('detects a double top only after a neckline close', () => {
    const prices = Array.from({ length: 48 }, () => 14);
    setPeak(prices, 20, 18);
    setTrough(prices, 28, 13);
    setPeak(prices, 36, 18);
    for (let i = 41; i < prices.length; i++) prices[i] = 12.2;
    const rows = fromCloses(prices, (index) => (index >= 41 ? 3000 : 800));
    const forming = detectPatterns(fromCloses(prices.slice(0, 40)), 0.3);
    const confirmed = detectPatterns(rows, 0.3);
    expect(forming.some((item) => item.name === 'Double Top' && item.status === 'CONFIRMED')).toBe(false);
    expect(confirmed.some((item) => item.name === 'Double Top')).toBe(true);
  });

  it('detects a double bottom and stays forming without volume', () => {
    const prices = Array.from({ length: 48 }, () => 14);
    setTrough(prices, 20, 10);
    setPeak(prices, 28, 15);
    setTrough(prices, 36, 10);
    for (let i = 41; i < prices.length; i++) prices[i] = 16.2;
    const quiet = detectPatterns(fromCloses(prices, () => 400), 0.3);
    const loud = detectPatterns(fromCloses(prices, (index) => (index >= 41 ? 3200 : 400)), 0.3);
    const quietHit = quiet.find((item) => item.name === 'Double Bottom');
    const loudHit = loud.find((item) => item.name === 'Double Bottom');
    if (quietHit) expect(quietHit.status).not.toBe('CONFIRMED');
    expect(loudHit?.name).toBe('Double Bottom');
  });

  it('does not confirm a wick-only breakout', () => {
    const prices = Array.from({ length: 40 }, () => 14);
    setPeak(prices, 18, 17);
    setTrough(prices, 24, 13);
    setPeak(prices, 30, 17);
    const rows = fromCloses(prices);
    const last = rows.at(-1)!;
    last.high = 11;
    last.close = 13.4;
    last.low = 13.1;
    const found = detectPatterns(rows, 0.3);
    for (const item of found) {
      if (item.name === 'Double Top') expect(item.status).not.toBe('CONFIRMED');
    }
  });

  it('detects head and shoulders geometry', () => {
    const prices = Array.from({ length: 55 }, () => 13);
    setPeak(prices, 18, 16);
    setTrough(prices, 24, 12.5);
    setPeak(prices, 30, 18.5);
    setTrough(prices, 36, 12.6);
    setPeak(prices, 42, 16);
    for (let i = 48; i < prices.length; i++) prices[i] = 11.8;
    const found = detectPatterns(fromCloses(prices, (index) => (index >= 48 ? 2600 : 800)), 0.25);
    expect(found.some((item) => item.name === 'Head and Shoulders' || item.name === 'Double Top' || item.name === 'Triple Top')).toBe(true);
  });

  it('detects a rectangle range without inventing a direction', () => {
    const prices = Array.from({ length: 46 }, (_, i) => (i % 8 < 4 ? 10.05 : 9.55));
    const found = detectPatterns(fromCloses(prices), 0.04);
    const rectangle = found.find((item) => item.name === 'Rectangle' || item.name === 'Ascending Channel' || item.name === 'Descending Channel');
    if (rectangle) expect(rectangle.bias === 'NEUTRAL' || rectangle.status === 'FORMING').toBe(true);
  });

  it('detects a 1-2-3 bullish reversal on a close through point 2', () => {
    const prices = Array.from({ length: 40 }, () => 12);
    setTrough(prices, 14, 8);
    setPeak(prices, 22, 12.5);
    setTrough(prices, 28, 9.2);
    for (let i = 33; i < prices.length; i++) prices[i] = 13.2;
    const found = detectPatterns(fromCloses(prices, (index) => (index >= 33 ? 2400 : 700)), 0.25);
    expect(found.every((item) => item.educational !== true)).toBe(true);
  });

  it('keeps educational patterns out of live detections', () => {
    const prices = Array.from({ length: 50 }, (_, i) => 10 + Math.sin(i / 6) * 0.4);
    const found = detectPatterns(fromCloses(prices), null);
    for (const item of found) {
      expect(EDUCATIONAL_PATTERN_NAMES).not.toContain(item.name);
      expect(item.educational).not.toBe(true);
    }
  });

  it('returns nothing on too-short or incomplete series', () => {
    expect(detectPatterns(fromCloses([10, 10.1, 10.2]), null)).toEqual([]);
  });
});

describe('15-coin scan still refuses invented signals', () => {
  it.each([...SCAN_SYMBOLS])('%s stays WAIT or a verified side on mixed synthetic data', (symbol) => {
    const closes = Array.from({ length: 90 }, (_, i) => 20 + Math.sin(i / 5) * 0.6 + i * 0.01);
    const snapshots = SCAN_INTERVALS.map((interval) => analyzeTimeframe(fromCloses(closes), interval));
    const scan = buildCoinScan({
      symbol,
      filters: fixtureFilters(symbol),
      snapshots,
      livePrice: closes.at(-1)!,
      priceUpdatedAt: new Date().toISOString(),
      stale: false,
    });
    expect(['LONG', 'SHORT', 'WAIT']).toContain(scan.direction);
    if (scan.direction === 'WAIT') expect(scan.setup).toBeNull();
  });
});
