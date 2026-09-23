import { describe, expect, it, beforeEach } from 'vitest';
import {
  BINANCE_WEIGHT_LIMIT_1M,
  canSpend,
  circuitOpen,
  klineWeight,
  noteFailure,
  recordUsedWeight,
  resetRateLimiter,
  weightSnapshot,
} from './rate-limit';

describe('Binance weight and circuit breaker', () => {
  beforeEach(() => resetRateLimiter());

  it('uses lower weight for incremental klines than a 250-bar warm fetch', () => {
    expect(klineWeight(6)).toBe(1);
    expect(klineWeight(250)).toBe(2);
  });

  it('blocks spend near the 1-minute safety ceiling', () => {
    recordUsedWeight('2200', 0);
    expect(canSpend(2)).toBe(false);
    expect(weightSnapshot().limit).toBe(BINANCE_WEIGHT_LIMIT_1M);
  });

  it('opens the circuit after repeated failures', () => {
    for (let i = 0; i < 5; i += 1) noteFailure(429);
    expect(circuitOpen()).toBe(true);
  });
});
