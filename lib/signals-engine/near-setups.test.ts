import { describe, expect, it } from 'vitest';
import {
  buildNearSetup,
  nearSetupScore,
  nearSetupsAreInformationalOnly,
  selectNearSetups,
} from './near-setups';
import type { CoinScan } from './types';

function waitCoin(overrides: Partial<CoinScan> = {}): CoinScan {
  return {
    symbol: 'BTCUSDT',
    available: true,
    price: 100,
    changePct: 1.2,
    priceUpdatedAt: '2026-09-23T00:00:00.000Z',
    stale: false,
    trend: 'BULLISH',
    direction: 'WAIT',
    pattern: 'Double Bottom',
    patternStatus: 'FORMING',
    timeframes: [],
    setup: null,
    entryConditions: '',
    reason: 'A LONG idea is developing. Missing confirmation close.',
    nextStep: 'Wait for confirmation.',
    lastCandleCloseAt: '2026-09-23T00:00:00.000Z',
    analyzedAt: '2026-09-23T00:00:00.000Z',
    scanState: 'ready',
    quality: {
      label: 'DEVELOPING SETUP',
      engineVersion: 'test',
      supporting: ['possible LONG structure'],
      contradictory: [],
      timeframeVotes: [
        { interval: '15m', vote: 'SUPPORT', note: 'aligned' },
        { interval: '1h', vote: 'SUPPORT', note: 'aligned' },
      ],
      patternConfirmation: 'FORMING',
      entryConditions: '',
      invalidationConditions: '',
      dataFreshness: 'FRESH',
      executionEligible: false,
    },
    ...overrides,
  };
}

describe('near setups ranking', () => {
  it('excludes plain WAIT coins with no directional evidence', () => {
    const coin = waitCoin({
      pattern: 'None',
      patternStatus: 'UNCONFIRMED',
      reason: 'No actionable setup.',
      quality: {
        label: 'INSUFFICIENT DATA',
        engineVersion: 'test',
        supporting: [],
        contradictory: [],
        timeframeVotes: [],
        patternConfirmation: 'UNAVAILABLE',
        entryConditions: '',
        invalidationConditions: '',
        dataFreshness: 'FRESH',
        executionEligible: false,
      },
    });
    expect(nearSetupScore(coin)).toBe(0);
    expect(buildNearSetup(coin)).toBeNull();
  });

  it('ranks R/R-gate rejects above forming patterns, closer to 1:3 higher', () => {
    const closer = waitCoin({
      symbol: 'ASTERUSDT',
      patternStatus: 'CONFIRMED',
      reason:
        'Setup does not support a defensible 1:3 net risk/reward. Net risk/reward is 1:1.04 (gross 1:1.20).',
      quality: {
        label: 'DEVELOPING SETUP',
        engineVersion: 'test',
        supporting: ['Stage A saw a possible LONG'],
        contradictory: [],
        timeframeVotes: [
          { interval: '15m', vote: 'SUPPORT', note: 'ok' },
          { interval: '1h', vote: 'SUPPORT', note: 'ok' },
          { interval: '4h', vote: 'SUPPORT', note: 'ok' },
        ],
        patternConfirmation: 'CONFIRMED',
        entryConditions: '',
        invalidationConditions: '',
        dataFreshness: 'FRESH',
        executionEligible: false,
      },
    });
    const farther = waitCoin({
      symbol: 'ZECUSDT',
      patternStatus: 'CONFIRMED',
      reason:
        'Setup does not support a defensible 1:3 net risk/reward. Net risk/reward is 1:0.03 (gross 1:0.10).',
      quality: {
        label: 'DEVELOPING SETUP',
        engineVersion: 'test',
        supporting: ['Stage A saw a possible LONG'],
        contradictory: [],
        timeframeVotes: [
          { interval: '15m', vote: 'SUPPORT', note: 'ok' },
          { interval: '1h', vote: 'SUPPORT', note: 'ok' },
          { interval: '4h', vote: 'SUPPORT', note: 'ok' },
        ],
        patternConfirmation: 'CONFIRMED',
        entryConditions: '',
        invalidationConditions: '',
        dataFreshness: 'FRESH',
        executionEligible: false,
      },
    });
    const forming = waitCoin({ symbol: 'ETHUSDT' });

    expect(nearSetupScore(closer)).toBeGreaterThan(nearSetupScore(farther));
    expect(nearSetupScore(closer)).toBeGreaterThan(nearSetupScore(forming));

    const selected = selectNearSetups([forming, farther, closer, waitCoin({
      symbol: 'RNDUSDT',
      pattern: 'None',
      patternStatus: 'UNCONFIRMED',
      reason: 'No setup.',
      quality: undefined,
    })]);
    expect(selected[0]?.symbol).toBe('ASTERUSDT');
    expect(selected.every((item) => item.informationalOnly)).toBe(true);
    expect(selected.find((item) => item.symbol === 'ASTERUSDT')?.category).toBe('rr_gate');
  });

  it('never promotes a Near Setup into an official direction', () => {
    const near = buildNearSetup(waitCoin({
      reason:
        'Setup does not support a defensible 1:3 net risk/reward. Net risk/reward is 1:2.50 (gross 1:2.80).',
    }));
    expect(near).not.toBeNull();
    expect(nearSetupsAreInformationalOnly('WAIT', near)).toBe(true);
    expect(nearSetupsAreInformationalOnly('LONG', near)).toBe(false);
  });
});
