import { afterEach, describe, expect, it } from 'vitest';
import { fixtureFilters } from './exchange-fixtures';
import { levelsForSetup } from './signals';
import {
  buildSetup,
  MIN_NET_RISK_REWARD,
  outcomeFromPath,
  passesPublicationRr,
  requirePublicationNetRr,
} from './trading';
import type { TimeframeSnapshot } from './types';

function tf(interval: string, extras: Partial<TimeframeSnapshot> = {}): TimeframeSnapshot {
  return {
    interval,
    lastClosedAt: '2026-09-23T00:00:00.000Z',
    price: extras.price ?? 100,
    trend: 'BULLISH',
    structure: 'Higher highs and higher lows',
    ema9: 101,
    ema21: 100,
    ema50: 99,
    ema200: 90,
    rsi: 55,
    macd: { macd: 1, signal: 0.5, histogram: 0.2 },
    atr: extras.atr ?? 2,
    volumeRatio: 1.4,
    volumeAnomaly: false,
    rsiDivergence: 'NONE',
    candleConfirm: 'BULLISH',
    retest: 'NONE',
    support: extras.support ?? 96,
    resistance: extras.resistance ?? 104,
    breakout: 'NONE',
    patterns: [],
    ...extras,
  };
}

describe('legacy pattern risk×2 targets', () => {
  it('places take-profit at entry ± risk×2 (restored working pattern engine)', () => {
    const levels = levelsForSetup('LONG', [tf('15m', { price: 100, support: 96, resistance: 103, atr: 2 })], 100, 0.01);
    expect(levels).not.toBeNull();
    expect(levels!.source).toBe('risk-multiple');
    expect(levels!.target).toBeCloseTo(levels!.entry + (levels!.entry - levels!.stop) * 2, 5);
  });

  it('places SHORT take-profit at entry − risk×2', () => {
    const levels = levelsForSetup('SHORT', [tf('15m', { price: 100, support: 96, resistance: 104, atr: 2 })], 100, 0.01);
    expect(levels).not.toBeNull();
    expect(levels!.target).toBeCloseTo(levels!.entry - (levels!.stop - levels!.entry) * 2, 5);
  });

  it('keeps the MIN_NET_RISK_REWARD helper at 3 for optional opt-in floor', () => {
    const setup = buildSetup({
      direction: 'LONG',
      entry: 349.2,
      stop: 329.96,
      target: 387.68,
      filters: fixtureFilters('BCHUSDT'),
    });
    expect(setup!.grossRiskReward).toBeCloseTo(2, 1);
    expect(setup!.netRiskReward).toBeLessThan(MIN_NET_RISK_REWARD);
    expect(passesPublicationRr(setup!.netRiskReward)).toBe(false);
    expect(requirePublicationNetRr()).toBe(false);
  });

  it('rejects a SHORT with invalid price order', () => {
    const setup = buildSetup({
      direction: 'SHORT',
      entry: 100,
      stop: 99,
      target: 110,
      filters: fixtureFilters('BTCUSDT'),
    });
    expect(setup?.executable).toBe(false);
    expect(setup?.validationReasons.some((item) => item.includes('SHORT'))).toBe(true);
  });

  it('marks same-candle stop and target as AMBIGUOUS instead of inventing a win', () => {
    const result = outcomeFromPath('LONG', 100, 98, 104, [
      { high: 105, low: 97, close: 101, openTime: 1 },
    ]);
    expect(result?.outcome).toBe('AMBIGUOUS');
  });
});

describe('frozen BCH and ZEC snapshots', () => {
  it('recalculates the original BCHUSDT 00:15 publication without rewriting it', () => {
    const setup = buildSetup({
      direction: 'LONG',
      entry: 349.2,
      stop: 329.96,
      target: 387.68,
      filters: fixtureFilters('BCHUSDT'),
    });
    expect(setup!.entry).toBe(349.2);
    expect(setup!.stop).toBe(329.96);
    expect(setup!.target).toBe(387.68);
    expect(setup!.grossRiskReward).toBeCloseTo((387.68 - 349.2) / (349.2 - 329.96), 3);
    expect(setup!.netRiskReward).toBeCloseTo(1.95, 1);
    expect(passesPublicationRr(setup!.netRiskReward)).toBe(false);
  });

  it('recalculates the original ZECUSDT 00:15 publication without rewriting it', () => {
    const setup = buildSetup({
      direction: 'LONG',
      entry: 1619,
      stop: 1493.97,
      target: 1869.06,
      filters: fixtureFilters('ZECUSDT'),
    });
    expect(setup!.grossRiskReward).toBeCloseTo((1869.06 - 1619) / (1619 - 1493.97), 3);
    expect(setup!.netRiskReward).toBeCloseTo(2.0, 1);
    expect(passesPublicationRr(setup!.netRiskReward)).toBe(false);
  });
});

describe('optional net R/R floor', () => {
  const prev = process.env.SIGNALS_REQUIRE_NET_RR;
  afterEach(() => {
    if (prev == null) delete process.env.SIGNALS_REQUIRE_NET_RR;
    else process.env.SIGNALS_REQUIRE_NET_RR = prev;
  });

  it('requirePublicationNetRr is opt-in via SIGNALS_REQUIRE_NET_RR=1', () => {
    delete process.env.SIGNALS_REQUIRE_NET_RR;
    expect(requirePublicationNetRr()).toBe(false);
    process.env.SIGNALS_REQUIRE_NET_RR = '1';
    expect(requirePublicationNetRr()).toBe(true);
  });
});
