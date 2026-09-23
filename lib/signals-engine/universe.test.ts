import { describe, expect, it } from 'vitest';
import {
  allowedScanMode,
  clampWatchlist,
  eligibleSymbolsFromExchange,
  isEligiblePerpetual,
  markAnalysisStale,
  parseScanMode,
  rankByQuoteVolume,
  scannerCounts,
  selectUniverse,
} from './universe';
import { retryDelayMs } from './binance';
import { mapPool } from './binance';

const rows = [
  { symbol: 'BTCUSDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
  { symbol: 'ETHUSDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
  { symbol: 'SOLUSDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
  { symbol: 'ADAUSDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
  { symbol: 'XRPUSDT', status: 'BREAK', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
  { symbol: 'BTCUSD_PERP', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USD' },
  { symbol: 'BTCUSDT_250925', status: 'TRADING', contractType: 'CURRENT_QUARTER', quoteAsset: 'USDT' },
  { symbol: 'FAKEUSDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
];

describe('dynamic USDT-M universe', () => {
  it('keeps only TRADING USDT perpetual contracts', () => {
    const eligible = eligibleSymbolsFromExchange(rows);
    expect(eligible).toEqual(['ADAUSDT', 'BTCUSDT', 'ETHUSDT', 'FAKEUSDT', 'SOLUSDT']);
    expect(isEligiblePerpetual(rows[4])).toBe(false);
    expect(isEligiblePerpetual(rows[5])).toBe(false);
    expect(isEligiblePerpetual(rows[6])).toBe(false);
    expect(eligibleSymbolsFromExchange([
      ...rows,
      { symbol: '龙虾USDT', status: 'TRADING', contractType: 'PERPETUAL', quoteAsset: 'USDT' },
    ])).toEqual(['ADAUSDT', 'BTCUSDT', 'ETHUSDT', 'FAKEUSDT', 'SOLUSDT']);
  });

  it('ranks 50/100 lists deterministically by quote volume then symbol', () => {
    const volume = { SOLUSDT: 90_000_000, BTCUSDT: 90_000_000, ETHUSDT: 40_000_000, ADAUSDT: 10_000_000, FAKEUSDT: 0 };
    const eligible = ['ADAUSDT', 'BTCUSDT', 'ETHUSDT', 'FAKEUSDT', 'SOLUSDT'];
    expect(rankByQuoteVolume(eligible, volume)).toEqual(['BTCUSDT', 'SOLUSDT', 'ETHUSDT', 'ADAUSDT', 'FAKEUSDT']);
    const top = selectUniverse({ mode: '50', eligible, quoteVolume: volume });
    expect(top.symbols).toEqual(['BTCUSDT', 'SOLUSDT', 'ETHUSDT', 'ADAUSDT']);
    expect(top.eligible).toBe(5);
    expect(selectUniverse({ mode: '50', eligible, quoteVolume: volume }).symbols).toEqual(top.symbols);
  });

  it('includes newly listed liquid perpetuals in All Coins and drops them when delisted', () => {
    const listed = selectUniverse({
      mode: 'all',
      eligible: ['BTCUSDT', 'NEWUSDT'],
      quoteVolume: { BTCUSDT: 10_000_000, NEWUSDT: 8_000_000 },
    });
    expect(listed.symbols).toEqual(['BTCUSDT', 'NEWUSDT']);
    const afterDelist = selectUniverse({
      mode: 'all',
      eligible: ['BTCUSDT'],
      quoteVolume: { BTCUSDT: 10_000_000, NEWUSDT: 8_000_000 },
    });
    expect(afterDelist.symbols).toEqual(['BTCUSDT']);
    expect(afterDelist.symbols).not.toContain('NEWUSDT');
  });

  it('drops delisted core watchlist names from the 15-coin mode', () => {
    const selected = selectUniverse({ mode: '15', eligible: ['ETHUSDT', 'BTCUSDT'], quoteVolume: {} });
    expect(selected.symbols).toEqual(['BTCUSDT', 'ETHUSDT']);
    expect(selected.eligible).toBe(2);
  });

  it('drops zero-volume names from 50/100/all and accepts a custom watchlist', () => {
    const eligible = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const all = selectUniverse({ mode: 'all', eligible, quoteVolume: { BTCUSDT: 1_000_000, ETHUSDT: 0 } });
    expect(all.symbols).toEqual(['BTCUSDT']);
    const custom = selectUniverse({ mode: 'custom', eligible, quoteVolume: {}, custom: ['ethusdt', 'NOTREAL', 'SOLUSDT'] });
    expect(custom.symbols).toEqual(['ETHUSDT', 'SOLUSDT']);
    expect(selectUniverse({ mode: 'custom', eligible: ['ETHUSDT'], quoteVolume: {}, custom: ['SOLUSDT', 'ETHUSDT'] }).symbols).toEqual(['ETHUSDT']);
  });

  it('clamps Free users to the 15-coin mode', () => {
    expect(parseScanMode('100')).toBe('100');
    expect(allowedScanMode('free', 'all')).toEqual({
      mode: '15',
      warning: '50, 100 and All Coins scanners are Pro features. Free accounts keep the BTC, ETH and BNB overview.',
    });
    expect(allowedScanMode('pro', '100').mode).toBe('100');
    expect(clampWatchlist(['btcusdt', 'BTCUSDT', 'nope', 'ETHUSDT'])).toEqual(['BTCUSDT', 'ETHUSDT']);
  });

  it('marks restored analysis stale and not executable', () => {
    const stale = markAnalysisStale({
      symbol: 'BTCUSDT',
      available: true,
      price: 100,
      priceUpdatedAt: new Date().toISOString(),
      stale: false,
      trend: 'BULLISH',
      direction: 'LONG',
      pattern: 'Flag',
      patternStatus: 'CONFIRMED',
      timeframes: [],
      setup: {
        executable: true,
        executableReason: 'ok',
        validationReasons: [],
      },
      scanState: 'ready',
    } as never);
    expect(stale.stale).toBe(true);
    expect(stale.setup?.executable).toBe(false);
    expect(stale.setup?.executableReason).toContain('stale');
  });

  it('does not count pending placeholders as WAIT setups', () => {
    const counts = scannerCounts([
      { direction: 'WAIT', scanState: 'pending', available: true } as never,
      { direction: 'WAIT', scanState: 'ready', available: true } as never,
      { direction: 'LONG', scanState: 'ready', available: true } as never,
      { direction: 'SHORT', scanState: 'failed', available: false } as never,
    ]);
    expect(counts.pending).toBe(1);
    expect(counts.wait).toBe(1);
    expect(counts.long).toBe(1);
    expect(counts.invalid).toBe(1);
  });
});

describe('rate-limit and concurrency helpers', () => {
  it('retries 429/418 with Retry-After or exponential backoff and jitter', () => {
    expect(retryDelayMs(200, '1', 0)).toBeNull();
    expect(retryDelayMs(451, '2', 0)).toBeNull();
    const after = retryDelayMs(429, '2', 0);
    expect(after).toBeGreaterThanOrEqual(1600);
    expect(after).toBeLessThanOrEqual(2400);
    const banned = retryDelayMs(418, null, 3);
    expect(banned).toBeGreaterThanOrEqual(6400);
    expect(banned).toBeLessThanOrEqual(9600);
  });

  it('bounds concurrent workers', async () => {
    let current = 0;
    let max = 0;
    await mapPool([1, 2, 3, 4, 5], 2, async (item) => {
      current += 1;
      max = Math.max(max, current);
      await new Promise((resolve) => setTimeout(resolve, 15));
      current -= 1;
      return item;
    });
    expect(max).toBeLessThanOrEqual(2);
  });
});
