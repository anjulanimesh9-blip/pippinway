import { describe, expect, it } from 'vitest';
import { FIXTURE_PRICES, fixtureFilters } from '../signals-engine/exchange-fixtures';
import { reconcilePublishedSignal, SIGNAL_TTL_MS } from '../signals-engine/lifecycle';
import { selectNearSetups } from '../signals-engine/near-setups';
import { buildSetup, MIN_NET_RISK_REWARD, passesPublicationRr } from '../signals-engine/trading';
import { DEFAULT_SETTINGS, type CoinScan, type ScannerResponse } from '../signals-engine/types';
import type { OfficialSignal } from './official-types';
import { CALCULATION_VERSION } from './official-types';
import {
  classifyOfficialLiveRecord,
  mergeOfficialLiveIntoResponse,
  selectDisplayableOfficialLive,
  setupFromOfficialRecord,
} from './official-live';
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

function passingSetup(symbol: string, direction: 'LONG' | 'SHORT') {
  const entry = FIXTURE_PRICES[symbol];
  const stop = direction === 'LONG' ? entry * 0.99 : entry * 1.01;
  const target = direction === 'LONG' ? entry * 1.045 : entry * 0.955;
  const setup = buildSetup({
    direction,
    entry,
    stop,
    target,
    filters: fixtureFilters(symbol),
    marginUSDT: 100,
    leverage: 20,
  });
  expect(setup).not.toBeNull();
  expect(passesPublicationRr(setup!.netRiskReward)).toBe(true);
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

function baseOfficial(partial: Partial<OfficialSignal> & Pick<OfficialSignal, 'id' | 'symbol' | 'direction' | 'originalEntry' | 'stop' | 'target'>): OfficialSignal {
  const openedAt = partial.openedAt || '2026-09-23T12:00:00.000Z';
  return {
    interval: '15m',
    pattern: 'Double Bottom',
    patternStatus: 'CONFIRMED',
    openedAt,
    expiresAt: partial.expiresAt || new Date(Date.parse(openedAt) + SIGNAL_TTL_MS).toISOString(),
    lastCandleCloseAt: openedAt,
    entryConditions: 'Wait for entry.',
    quantity: 1,
    marginUSDT: 100,
    leverage: 20,
    marginMode: 'ISOLATED',
    totalFeesUSDT: 0.2,
    notionalUSDT: 2000,
    requiredMarginUSDT: 100,
    calculationVersion: CALCULATION_VERSION,
    lifecycleStatus: 'WAITING_FOR_ENTRY',
    fillConfirmed: false,
    brokerageVerified: false,
    observedTrigger: false,
    snapshotFrozen: true,
    lastPrice: partial.originalEntry,
    lastPriceAt: openedAt,
    closedAt: null,
    createdAt: openedAt,
    updatedAt: openedAt,
    ...partial,
  };
}

describe('official live display gating', () => {
  it('1. WAIT-only Top 50 scan does not fabricate an official signal', () => {
    const board = emptyBoard([waitBoardCoin('BTCUSDT'), waitBoardCoin('ETHUSDT')]);
    const merged = mergeOfficialLiveIntoResponse(board, []);
    expect(merged.officialLive).toEqual([]);
    expect(merged.counts?.long).toBe(0);
    expect(merged.counts?.short).toBe(0);
    expect(merged.counts?.wait).toBe(2);
    expect((merged.counts?.long || 0) + (merged.counts?.short || 0) + (merged.counts?.wait || 0)).toBe(2);
  });

  it('2. genuine LONG with net R/R >= 3 publishes and displays', () => {
    const setup = passingSetup('ETHUSDT', 'LONG');
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
    const official = officialFromPublished(first.coin, first.published!);
    const now = Date.parse('2026-09-23T12:30:00.000Z');
    const merged = mergeOfficialLiveIntoResponse(emptyBoard([waitBoardCoin('ETHUSDT')]), [official], now);
    expect(merged.officialLive).toHaveLength(1);
    expect(merged.officialLive![0].direction).toBe('LONG');
    expect(merged.officialLive![0].setup?.entry).toBe(setup.entry);
    expect(merged.officialLive![0].setup?.stop).toBe(setup.stop);
    expect(merged.officialLive![0].setup?.target).toBe(setup.target);
    expect(merged.officialLive![0].setup!.netRiskReward).toBeGreaterThanOrEqual(MIN_NET_RISK_REWARD);
  });

  it('3. genuine SHORT with net R/R >= 3 publishes and displays', () => {
    const setup = passingSetup('BTCUSDT', 'SHORT');
    const first = reconcilePublishedSignal({
      ...waitBoardCoin('BTCUSDT'),
      direction: 'SHORT',
      pattern: 'Double Top',
      patternStatus: 'CONFIRMED',
      setup,
      entryConditions: 'Enter near original entry.',
      reason: 'Stage B confirmed.',
      nextStep: 'Wait for entry zone.',
    }, null, '2026-09-23T12:00:00.000Z');
    const official = officialFromPublished(first.coin, first.published!);
    const now = Date.parse('2026-09-23T12:30:00.000Z');
    const merged = mergeOfficialLiveIntoResponse(emptyBoard([waitBoardCoin('BTCUSDT')]), [official], now);
    expect(merged.officialLive).toHaveLength(1);
    expect(merged.officialLive![0].direction).toBe('SHORT');
    expect(merged.officialLive![0].setup!.netRiskReward).toBeGreaterThanOrEqual(MIN_NET_RISK_REWARD);
  });

  it('4. malformed Entry=SL=TP legacy record is excluded', () => {
    const bad = baseOfficial({
      id: 'bad-shib',
      symbol: '1000SHIBUSDT',
      direction: 'LONG',
      originalEntry: 0.01,
      stop: 0.01,
      target: 0.01,
      lifecycleStatus: 'WAITING_FOR_ENTRY',
    });
    const verdict = classifyOfficialLiveRecord(bad, Date.parse('2026-09-23T12:30:00.000Z'));
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reasons.join(' ')).toMatch(/geometry|gross/i);
    const merged = mergeOfficialLiveIntoResponse(emptyBoard([waitBoardCoin('BTCUSDT')]), [bad], Date.parse('2026-09-23T12:30:00.000Z'));
    expect(merged.officialLive).toHaveLength(0);
    expect(merged.officialLiveExcluded?.some((item) => item.id === 'bad-shib')).toBe(true);
  });

  it('5. legacy gross-1:2 pattern record displays when net≥3 floor is not required', () => {
    // Historical BCH-style ~gross 1:2 levels (restored pattern-engine publication).
    const legacy = baseOfficial({
      id: 'legacy-bch',
      symbol: 'BCHUSDT',
      direction: 'LONG',
      originalEntry: 349.2,
      stop: 329.96,
      target: 387.68,
      lifecycleStatus: 'WAITING_FOR_ENTRY',
    });
    const setup = setupFromOfficialRecord(legacy);
    expect(setup).not.toBeNull();
    expect(setup!.netRiskReward).toBeLessThan(MIN_NET_RISK_REWARD);
    expect(passesPublicationRr(setup!.netRiskReward)).toBe(false);
    const verdict = classifyOfficialLiveRecord(legacy, Date.parse('2026-09-23T12:30:00.000Z'));
    expect(verdict.ok).toBe(true);
    const merged = mergeOfficialLiveIntoResponse(emptyBoard([waitBoardCoin('BCHUSDT')]), [legacy], Date.parse('2026-09-23T12:30:00.000Z'));
    expect(merged.officialLive).toHaveLength(1);
    expect(merged.officialLive![0].symbol).toBe('BCHUSDT');
  });

  it('6. duplicate same-symbol records keep only one lifecycle card', () => {
    const setup = passingSetup('ETHUSDT', 'LONG');
    const older = baseOfficial({
      id: 'eth-old',
      symbol: 'ETHUSDT',
      direction: 'LONG',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      openedAt: '2026-09-23T10:00:00.000Z',
      lifecycleStatus: 'WAITING_FOR_ENTRY',
    });
    const newer = baseOfficial({
      id: 'eth-new',
      symbol: 'ETHUSDT',
      direction: 'LONG',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      openedAt: '2026-09-23T11:00:00.000Z',
      lifecycleStatus: 'ACTIVE',
    });
    const { selected, excluded } = selectDisplayableOfficialLive(
      [older, newer],
      [],
      Date.parse('2026-09-23T12:00:00.000Z'),
    );
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('eth-new');
    expect(excluded.some((item) => item.id === 'eth-old')).toBe(true);
  });

  it('7. valid active official survives subsequent WAIT scan without corrupting Top 50 counts', () => {
    const setup = passingSetup('ETHUSDT', 'LONG');
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
    const later = reconcilePublishedSignal({
      ...waitBoardCoin('ETHUSDT'),
      direction: 'WAIT',
      setup: null,
      reason: 'Net risk/reward is 1:1.90. Structure does not support a defensible 1:3 target after fees.',
    }, first.published, '2026-09-23T12:03:00.000Z');
    expect(later.coin.direction).toBe('LONG');
    expect(later.published).not.toBeNull();

    const official = officialFromPublished(later.coin, later.published!);
    const board = emptyBoard([waitBoardCoin('BTCUSDT'), waitBoardCoin('ETHUSDT')]);
    expect(board.coins.every((c) => c.direction === 'WAIT')).toBe(true);
    const merged = mergeOfficialLiveIntoResponse(board, [official], Date.parse('2026-09-23T12:30:00.000Z'));
    expect(merged.counts?.wait).toBe(2);
    expect(merged.counts?.long).toBe(0);
    expect(merged.officialLive).toHaveLength(1);
    expect(merged.coins.find((c) => c.symbol === 'ETHUSDT')?.direction).toBe('WAIT');
  });

  it('8. expired/invalidated signals leave Official Live', () => {
    const setup = passingSetup('ETHUSDT', 'LONG');
    const expired = baseOfficial({
      id: 'eth-expired',
      symbol: 'ETHUSDT',
      direction: 'LONG',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      openedAt: '2026-09-22T00:00:00.000Z',
      expiresAt: '2026-09-22T04:00:00.000Z',
      lifecycleStatus: 'WAITING_FOR_ENTRY',
    });
    const invalidated = baseOfficial({
      id: 'eth-invalid',
      symbol: 'ETHUSDT',
      direction: 'LONG',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      lifecycleStatus: 'INVALIDATED',
    });
    const now = Date.parse('2026-09-23T12:00:00.000Z');
    expect(classifyOfficialLiveRecord(expired, now).ok).toBe(false);
    expect(classifyOfficialLiveRecord(invalidated, now).ok).toBe(false);
  });

  it('9. Near Setups remain separate from official live', () => {
    const setup = passingSetup('ETHUSDT', 'LONG');
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
    const merged = mergeOfficialLiveIntoResponse(
      emptyBoard([nearCandidate, waitBoardCoin('ETHUSDT')]),
      [official],
      Date.parse('2026-09-23T12:30:00.000Z'),
    );
    expect(merged.officialLive?.every((c) => c.direction === 'LONG' || c.direction === 'SHORT')).toBe(true);
    expect(merged.nearSetups?.every((n) => n.informationalOnly)).toBe(true);
    expect(merged.nearSetups?.some((n) => n.symbol === 'BTCUSDT')).toBe(true);
    expect(merged.nearSetups?.some((n) => n.symbol === 'ETHUSDT')).toBe(false);
  });

  it('10. Top 50 scan counts stay internally consistent after official merge', () => {
    const coins = [
      { ...waitBoardCoin('BTCUSDT'), direction: 'LONG' as const, setup: passingSetup('BTCUSDT', 'LONG'), scanState: 'ready' as const },
      waitBoardCoin('ETHUSDT'),
      waitBoardCoin('BNBUSDT'),
    ];
    // BTC LONG on board is a current scan result — counts reflect scan only.
    const board = emptyBoard(coins);
    board.counts = { long: 1, short: 0, wait: 2, invalid: 0, expired: 0, pending: 0 };
    const setup = passingSetup('ETHUSDT', 'LONG');
    const official = baseOfficial({
      id: 'eth-ok',
      symbol: 'ETHUSDT',
      direction: 'LONG',
      originalEntry: setup.entry,
      stop: setup.stop,
      target: setup.target,
    });
    const merged = mergeOfficialLiveIntoResponse(board, [official], Date.parse('2026-09-23T12:30:00.000Z'));
    expect(merged.counts?.long).toBe(1);
    expect(merged.counts?.wait).toBe(2);
    expect((merged.counts!.long) + (merged.counts!.short) + (merged.counts!.wait)).toBe(3);
    expect(merged.officialLive).toHaveLength(1);
    expect(merged.coins).toHaveLength(3);
  });
});
