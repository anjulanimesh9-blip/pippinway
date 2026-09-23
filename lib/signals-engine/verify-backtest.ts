import { fixtureFilters } from './exchange-fixtures';
import { analyzeTimeframe } from './signals';
import { buildSetup, outcomeFromPath, realizedPnlUSDT } from './trading';
import { decideDirectionV1, verifySignal } from './verify';
import {
  DEFAULT_SETTINGS,
  type AccuracyStats,
  type Candle,
  type SignalRecord,
} from './types';

export const BACKTEST_ENGINE = 'pw-verify-v2';

function emptyStats(note: string): AccuracyStats {
  return {
    sampleSize: 0,
    closedSample: 0,
    wins: 0,
    losses: 0,
    expired: 0,
    open: 0,
    winRate: null,
    profitFactor: null,
    maxDrawdownUSDT: null,
    netPnlUSDT: 0,
    note,
  };
}

export function statsFrom(records: SignalRecord[], label: string): AccuracyStats {
  const wins = records.filter((item) => item.outcome === 'WIN');
  const losses = records.filter((item) => item.outcome === 'LOSS');
  const expired = records.filter((item) => item.outcome === 'EXPIRED');
  const open = records.filter((item) => item.outcome === 'OPEN');
  const closed = [...wins, ...losses];
  const grossProfit = wins.reduce((sum, item) => sum + (item.pnlUSDT || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, item) => sum + (item.pnlUSDT || 0), 0));
  const netPnlUSDT = records.reduce((sum, item) => sum + (item.pnlUSDT || 0), 0);
  let peak = 0;
  let equity = 0;
  let maxDrawdownUSDT = 0;
  for (const item of [...records].sort((a, b) => (a.closedAt || a.openedAt).localeCompare(b.closedAt || a.openedAt))) {
    equity += item.pnlUSDT || 0;
    peak = Math.max(peak, equity);
    maxDrawdownUSDT = Math.max(maxDrawdownUSDT, peak - equity);
  }
  return {
    sampleSize: records.length,
    closedSample: closed.length,
    wins: wins.length,
    losses: losses.length,
    expired: expired.length,
    open: open.length,
    winRate: closed.length ? wins.length / closed.length : null,
    profitFactor: closed.length ? (grossLoss === 0 ? (grossProfit > 0 ? Number.POSITIVE_INFINITY : null) : grossProfit / grossLoss) : null,
    maxDrawdownUSDT: closed.length ? Number(maxDrawdownUSDT.toFixed(4)) : null,
    netPnlUSDT: Number(netPnlUSDT.toFixed(4)),
    note:
      closed.length < 20
        ? `${label}: ${closed.length} closed trades is too small to advertise an accuracy rate. Backtests do not guarantee future results.`
        : `${label}: closed WIN/LOSS only. Look-ahead is blocked. Backtests do not guarantee future results.`,
  };
}

export function splitPeriods<T>(items: T[]): { train: T[]; validation: T[]; oos: T[] } {
  const trainEnd = Math.floor(items.length * 0.4);
  const valEnd = Math.floor(items.length * 0.7);
  return {
    train: items.slice(0, trainEnd),
    validation: items.slice(trainEnd, valEnd),
    oos: items.slice(valEnd),
  };
}

export function walkForwardSignals(input: {
  symbol: string;
  interval: string;
  candles: Candle[];
  engine: 'v1' | 'v2';
}): SignalRecord[] {
  const closed = input.candles.filter((item) => item.closed);
  const records: SignalRecord[] = [];
  if (closed.length < 80) return records;
  const filters = fixtureFilters(input.symbol);
  for (let index = 60; index < closed.length - 8; index++) {
    const window = closed.slice(0, index + 1);
    const snapshot = analyzeTimeframe(window, input.interval);
    const decision = input.engine === 'v1'
      ? decideDirectionV1([snapshot])
      : verifySignal({ snapshots: [snapshot], stale: false, symbol: input.symbol });
    if (decision.direction === 'WAIT') continue;
    const last = window[window.length - 1];
    const volatility = snapshot.atr || last.close * 0.004;
    const entry = last.close;
    const stop = decision.direction === 'LONG' ? entry - volatility * 1.2 : entry + volatility * 1.2;
    const target = decision.direction === 'LONG' ? entry + Math.abs(entry - stop) * 2 : entry - Math.abs(entry - stop) * 2;
    const setup = buildSetup({
      direction: decision.direction,
      entry,
      stop,
      target,
      filters,
      marginUSDT: DEFAULT_SETTINGS.marginUSDT,
      leverage: DEFAULT_SETTINGS.leverage,
    });
    if (!setup?.executable) continue;
    const slip = Math.max(filters.tickSize, entry * 0.0002);
    const future = closed.slice(index + 1, index + 13);
    const resolved = outcomeFromPath(decision.direction, setup.entry, setup.stop, setup.target, future);
    const outcome = resolved?.outcome || 'EXPIRED';
    const exitPrice = resolved?.exitPrice ?? future.at(-1)?.close ?? setup.entry;
    const openedAt = new Date(last.openTime).toISOString();
    const pnl = realizedPnlUSDT({
      direction: decision.direction,
      entry: setup.entry,
      exitPrice,
      quantity: setup.quantity,
      totalFeesUSDT: setup.totalFeesUSDT + setup.quantity * slip,
      outcome,
    });
    records.push({
      id: `${input.symbol}-${input.interval}-${decision.direction}-${entry.toPrecision(8)}-${openedAt.slice(0, 16)}-${input.engine}`,
      symbol: input.symbol,
      direction: decision.direction,
      pattern: decision.patternName,
      patternStatus: decision.patternStatus,
      interval: input.interval,
      entry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      entryConditions: decision.entryConditions,
      openedAt,
      source: 'backtest',
      outcome,
      closedAt: new Date(resolved?.closedAt || future.at(-1)?.openTime || last.openTime).toISOString(),
      exitPrice,
      pnlUSDT: pnl,
      marginUSDT: setup.allocatedMarginUSDT,
      leverage: setup.leverage,
      marginMode: setup.marginMode,
      quantity: setup.quantity,
      notionalUSDT: setup.notionalUSDT,
      requiredMarginUSDT: setup.requiredMarginUSDT,
      totalFeesUSDT: setup.totalFeesUSDT,
      stepSize: setup.stepSize,
      tickSize: setup.tickSize,
      executable: setup.executable,
      netProfitUSDT: setup.netProfitUSDT,
      netLossUSDT: setup.netLossUSDT,
      snapshotPreserved: true,
      fillConfirmed: false,
      originalEntry: setup.entry,
    });
    index += 3;
  }
  return records;
}

export function compareEngines(previous: SignalRecord[], upgraded: SignalRecord[]) {
  const prevClosed = previous.filter((item) => item.outcome === 'WIN' || item.outcome === 'LOSS');
  const nextClosed = upgraded.filter((item) => item.outcome === 'WIN' || item.outcome === 'LOSS');
  const previousLosses = previous.filter((item) => item.outcome === 'LOSS').length;
  const upgradedLosses = upgraded.filter((item) => item.outcome === 'LOSS').length;
  const previousWinRate = prevClosed.length ? previous.filter((item) => item.outcome === 'WIN').length / prevClosed.length : null;
  const upgradedWinRate = nextClosed.length ? upgraded.filter((item) => item.outcome === 'WIN').length / nextClosed.length : null;
  const falseSignalsDecreased = previous.length === 0 && upgraded.length === 0
    ? null
    : upgradedLosses < previousLosses && upgraded.length <= previous.length;
  return {
    previousSignals: previous.length,
    upgradedSignals: upgraded.length,
    previousLosses,
    upgradedLosses,
    previousWinRate,
    upgradedWinRate,
    falseSignalsDecreased,
    note: falseSignalsDecreased
      ? 'On this same out-of-sample path the upgraded verifier published fewer losing signals without dropping losing trades from the report. This does not guarantee future performance.'
      : 'The upgraded verifier did not show a clear reduction in losing signals on this sample. No improved-accuracy claim is made. All wins and losses remain listed. This does not guarantee future performance.',
  };
}
