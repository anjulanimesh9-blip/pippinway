import { describe, expect, it } from 'vitest';
import { FIXTURE_PRICES, fixtureFilters } from '../signals-engine/exchange-fixtures';
import { reconcilePublishedSignal } from '../signals-engine/lifecycle';
import { selectNearSetups } from '../signals-engine/near-setups';
import { buildSetup, MIN_NET_RISK_REWARD, passesPublicationRr } from '../signals-engine/trading';
import { DEFAULT_SETTINGS, type CoinScan, type ScannerResponse } from '../signals-engine/types';
import type { OfficialSignal } from './official-types';
import { CALCULATION_VERSION } from './official-types';
import { mergeOfficialLiveIntoResponse, coinScanFromOfficial } from './official-live';
import { officialFromPublished } from './official-store';

function waitBoardCoin(symbol: string): CoinScan {
  return {
    symbol,
    available: true,
    price: FIXTURE_PRICES[symbol] ?? 100,
    changePct: 0,
    priceUpdatedAt: '2026-09-23T12:00:00.000Z',
    stale: false,
    trend: 'MIXED',
    direction: 'WAIT',
    pattern: 'None',
    patternStatus: 'UNCONFIRMED',
    timeframes: [],
    filters: fixtureFilters(symbol),
    setup: null,
    entryConditions: '',
    reason: 'No actionable setup.',
    nextStep: 'Wait.',
    lastCandleCloseAt: '2026-09-23T12:00:00.000Z',
    analyzedAt: '2026-09-23T12:00:00.000Z',
    scanState: 'ready',
  };
}

/** Fixture levels that clear net 1:3 after fees (wide structure target). */
function passingLongSetup(symbol = 'ETHUSDT') {
  const entry = FIXTURE_PRICES[symbol];
  const stop = entry * 0.99;
  const target = entry * 1.045; // gross ~4.5 before fees → net still >= 3
  const setup = buildSetup({
    direction: 'LONG',
    entry,
    stop,
    target,
    filters: fixtureFilters(symbol),
    marginUSDT: 100,
    leverage: 20,
  });
  expect(setup).not.toBeNull();
  expect(passesPublicationRr(setup!.netRiskReward)).toBe(true);
  expect(setup!.netRiskReward).toBeGreaterThanOrEqual(MIN_NET_RISK_REWARD);
  return setup!;
}

function emptyBoard(coins: CoinScan[]): ScannerResponse {
  return {
    settings: DEFAULT_SETTINGS,
    fetchedAt: '2026-09-23T12:00:00.000Z',
    pricesUpdatedAt: '2026-09-23T12:00:00.000Z',
    stale: false,
    warnings: [],
    coins,
    counts: { long: 0, short: 0, wait: coins.length, invalid: 0, expired: 0, pending: 0 },
    nearSetups: selectNearSetups(coins),
  };
}

describe('live official signal pipeline', () => {
  it('does not fabricate an official signal from a WAIT-only scan', () => {
    const board = emptyBoard([waitBoardCoin('BTCUSDT'), waitBoardCoin('ETHUSDT')]);
    const merged = mergeOfficialLiveIntoResponse(board, []);
    expect(merged.officialLive).toEqual([]);
    expect(merged.coins.every((coin) => coin.direction === 'WAIT')).toBe(true);
    expect(merged.coins.every((coin) => coin.setup == null)).toBe(true);
  });

  it('publishes a fixture that passes all validation gates with Entry/SL/TP', () => {
    const setup = passingLongSetup('ETHUSDT');
    const fresh: CoinScan = {
      ...waitBoardCoin('ETHUSDT'),
      direction: 'LONG',
      pattern: 'Double Bottom',
      patternStatus: 'CONFIRMED',
      setup,
      entryConditions: 'Enter near original entry.',
      reason: 'Stage B confirmed.',
      nextStep: 'Wait for entry zone.',
    };
    const result = reconcilePublishedSignal(fresh, null, '2026-09-23T12:00:00.000Z');
    expect(result.published).not.toBeNull();
    expect(result.coin.direction).toBe('LONG');
    expect(result.coin.setup?.entry).toBe(setup.entry);
    expect(result.coin.setup?.stop).toBe(setup.stop);
    expect(result.coin.setup?.target).toBe(setup.target);
    expect(result.coin.lifecycle?.status).toBe('WAITING_FOR_ENTRY');

    const official = officialFromPublished(result.coin, result.published!);
    expect(official.originalEntry).toBe(setup.entry);
    expect(official.stop).toBe(setup.stop);
    expect(official.target).toBe(setup.target);
    expect(official.direction).toBe('LONG');
  });

  it('keeps an active official signal visible after a subsequent WAIT scan', () => {
    const setup = passingLongSetup('ETHUSDT');
    const first = reconcilePublishedSignal({
      ...waitBoardCoin('ETHUSDT'),
      direction: 'LONG',
      pattern: 'Double Bottom',
      patternStatus: 'CONFIRMED',
      setup,
      entryConditions: 'Enter near original entry.',
      reason: 'Stage B confirmed.',
      nextStep: 'Wait for entry zone.',
    }, null, '2026-09-23T12:00:00.000Z');
    expect(first.published).not.toBeNull();

    const waitPass = reconcilePublishedSignal({
      ...waitBoardCoin('ETHUSDT'),
      direction: 'WAIT',
      setup: null,
      reason: 'Net risk/reward is 1:1.90. Structure does not support a defensible 1:3 target after fees. Targets were not stretched to manufacture the ratio.',
    }, first.published, '2026-09-23T12:03:00.000Z');

    expect(waitPass.published).not.toBeNull();
    expect(waitPass.coin.direction).toBe('LONG');
    expect(waitPass.coin.setup?.entry).toBe(setup.entry);
    expect(waitPass.coin.setup?.stop).toBe(setup.stop);
    expect(waitPass.coin.setup?.target).toBe(setup.target);
    expect(waitPass.coin.lifecycle?.status).not.toBe('INVALIDATED');

    const official = officialFromPublished(waitPass.coin, waitPass.published!);
    const board = emptyBoard([
      waitBoardCoin('BTCUSDT'),
      {
        ...waitBoardCoin('ETHUSDT'),
        direction: 'WAIT',
        setup: null,
        reason: 'Net risk/reward is 1:1.90. Structure does not support a defensible 1:3 target after fees.',
      },
    ]);
    const merged = mergeOfficialLiveIntoResponse(board, [official]);
    const eth = merged.coins.find((coin) => coin.symbol === 'ETHUSDT');
    expect(eth?.direction).toBe('LONG');
    expect(eth?.setup?.entry).toBe(setup.entry);
    expect(eth?.setup?.stop).toBe(setup.stop);
    expect(eth?.setup?.target).toBe(setup.target);
    expect(merged.officialLive?.some((coin) => coin.symbol === 'ETHUSDT' && coin.direction === 'LONG')).toBe(true);
    expect(merged.counts?.long).toBeGreaterThanOrEqual(1);
  });

  it('keeps Near Setups separate from official live signals', () => {
    const setup = passingLongSetup('ETHUSDT');
    const first = reconcilePublishedSignal({
      ...waitBoardCoin('ETHUSDT'),
      direction: 'LONG',
      pattern: 'Double Bottom',
      patternStatus: 'CONFIRMED',
      setup,
      entryConditions: 'x',
      reason: 'confirmed',
      nextStep: 'x',
    }, null, '2026-09-23T12:00:00.000Z');
    const official = officialFromPublished(first.coin, first.published!);

    const nearCandidate: CoinScan = {
      ...waitBoardCoin('BTCUSDT'),
      pattern: 'Bull Flag',
      patternStatus: 'FORMING',
      reason: 'A LONG idea is developing. Missing confirmation close.',
      quality: {
        label: 'DEVELOPING SETUP',
        engineVersion: 'test',
        supporting: ['possible LONG'],
        contradictory: [],
        timeframeVotes: [{ interval: '15m', vote: 'SUPPORT', note: 'ok' }],
        patternConfirmation: 'FORMING',
        entryConditions: '',
        invalidationConditions: '',
        dataFreshness: 'FRESH',
        executionEligible: false,
      },
    };

    const board = emptyBoard([nearCandidate, waitBoardCoin('ETHUSDT')]);
    const merged = mergeOfficialLiveIntoResponse(board, [official]);

    expect(merged.officialLive?.every((coin) => coin.direction === 'LONG' || coin.direction === 'SHORT')).toBe(true);
    expect(merged.nearSetups?.every((item) => item.informationalOnly && item.symbol !== 'ETHUSDT')).toBe(true);
    expect(merged.nearSetups?.some((item) => item.symbol === 'BTCUSDT')).toBe(true);
  });

  it('materializes Entry/SL/TP for /signals display from official storage', () => {
    const setup = passingLongSetup('BTCUSDT');
    const record: OfficialSignal = {
      id: 'test-btc',
      symbol: 'BTCUSDT',
      direction: 'LONG',
      interval: '15m',
      pattern: 'Ascending Triangle',
      patternStatus: 'CONFIRMED',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      openedAt: '2026-09-23T12:00:00.000Z',
      expiresAt: '2026-09-23T16:00:00.000Z',
      lastCandleCloseAt: '2026-09-23T12:00:00.000Z',
      entryConditions: 'Wait for entry.',
      quantity: setup.quantity,
      marginUSDT: setup.marginUSDT,
      leverage: setup.leverage,
      marginMode: setup.marginMode,
      totalFeesUSDT: setup.totalFeesUSDT,
      notionalUSDT: setup.notionalUSDT,
      requiredMarginUSDT: setup.requiredMarginUSDT,
      calculationVersion: CALCULATION_VERSION,
      lifecycleStatus: 'WAITING_FOR_ENTRY',
      fillConfirmed: false,
      brokerageVerified: false,
      observedTrigger: false,
      snapshotFrozen: true,
      lastPrice: FIXTURE_PRICES.BTCUSDT,
      lastPriceAt: '2026-09-23T12:00:00.000Z',
      closedAt: null,
      createdAt: '2026-09-23T12:00:00.000Z',
      updatedAt: '2026-09-23T12:00:00.000Z',
    };
    const coin = coinScanFromOfficial(record);
    expect(coin.direction).toBe('LONG');
    expect(coin.setup?.entry).toBe(setup.entry);
    expect(coin.setup?.stop).toBe(setup.stop);
    expect(coin.setup?.target).toBe(setup.target);
    expect(coin.lifecycle?.status).toBe('WAITING_FOR_ENTRY');
  });
});
