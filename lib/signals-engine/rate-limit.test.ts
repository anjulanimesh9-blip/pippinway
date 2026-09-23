import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  circuitOpen,
  circuitOpenMessage,
  lastBinanceFailure,
  noteFailure,
  resetRateLimiter,
  sanitizeBinanceReason,
  weightSnapshot,
} from './rate-limit';

describe('Binance weight and circuit breaker', () => {
  beforeEach(() => {
    resetRateLimiter();
    vi.restoreAllMocks();
  });

  it('opens the circuit after repeated failures and records the sanitized cause', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    for (let i = 0; i < 4; i += 1) noteFailure(429, { path: '/fapi/v1/klines', kind: 'http' });
    expect(circuitOpen()).toBe(false);
    noteFailure(429, { path: '/fapi/v1/klines', kind: 'http' });
    expect(circuitOpen()).toBe(true);
    expect(lastBinanceFailure()?.status).toBe(429);
    expect(lastBinanceFailure()?.reason).toContain('429');
    expect(circuitOpenMessage('/fapi/v1/exchangeInfo')).toContain('HTTP 429');
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0]?.[0])).toContain('binance_circuit_open');
    expect(weightSnapshot().lastFailure?.path).toBe('/fapi/v1/klines');
  });

  it('opens immediately on 451/418 without waiting for five failures', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    noteFailure(451, { path: '/fapi/v1/exchangeInfo', kind: 'http' });
    expect(circuitOpen()).toBe(true);
    expect(sanitizeBinanceReason(451)).toContain('451');
    expect(circuitOpenMessage('/fapi/v1/ticker/price')).toContain('451');
    expect(warn).toHaveBeenCalled();
  });
});
