import { describe, expect, it } from 'vitest';
import { restoreCandleCloses, serializeCandleCloses, resetCandleCache, setCachedCandles } from './candle-cache';
import { PROCESS_ID, restoreCoins, type PersistedScanJob } from './scan-job-persist';
import type { CoinScan } from './types';

function coin(): CoinScan {
  return {
    symbol: 'BTCUSDT',
    available: true,
    price: 100,
    priceUpdatedAt: '2026-09-22T00:00:00.000Z',
    stale: false,
    trend: 'BULLISH',
    direction: 'LONG',
    pattern: 'None',
    patternStatus: 'CONFIRMED',
    timeframes: [],
    setup: {
      executable: true,
      executableReason: 'ok',
      validationReasons: [],
    } as unknown as CoinScan['setup'],
    entryConditions: '',
    reason: '',
    nextStep: '',
    lastCandleCloseAt: '2026-09-22T00:00:00.000Z',
    analyzedAt: '2026-09-22T00:00:00.000Z',
    scanState: 'ready',
  };
}

describe('persistent scan checkpoints', () => {
  it('marks restored coins stale after a worker restart from another process', () => {
    const snapshot: PersistedScanJob = {
      processId: 'other-process',
      mode: '15',
      symbols: ['BTCUSDT'],
      eligible: 500,
      listedAt: '2026-09-22T00:00:00.000Z',
      cursor: 12,
      generation: 4,
      coins: [coin()],
      savedAt: '2026-09-22T00:01:00.000Z',
      lastCycleDurationMs: 1400,
      lastFullUniverseDurationMs: 180000,
      queueBacklog: 80,
    };
    const coins = restoreCoins(snapshot);
    expect(PROCESS_ID).not.toBe('other-process');
    expect(coins.get('BTCUSDT')?.stale).toBe(true);
    expect(coins.get('BTCUSDT')?.setup?.executable).toBe(false);
  });

  it('restores last closed candle checkpoints so incremental fetches can resume', () => {
    resetCandleCache();
    setCachedCandles('ETHUSDT', '1h', [{
      openTime: 1_700_000_000_000,
      open: 1, high: 1, low: 1, close: 1, volume: 1, closed: true,
    }]);
    const serialized = serializeCandleCloses();
    resetCandleCache();
    restoreCandleCloses(serialized);
    expect(serialized['ETHUSDT:1h']).toBe(1_700_000_000_000);
  });
});
