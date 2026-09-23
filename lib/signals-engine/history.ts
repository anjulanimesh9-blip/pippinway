import { promises as fs } from 'fs';
import path from 'path';
import { getCandles } from './binance';
import { fixtureFilters } from './exchange-fixtures';
import { analyzeTimeframe } from './signals';
import { buildSetup, outcomeFromPath, realizedPnlUSDT } from './trading';
import {
  DEFAULT_SETTINGS,
  SCAN_SYMBOLS,
  type AccuracyStats,
  type CoinScan,
  type HistoryResponse,
  type SignalRecord,
  type TradeSetup,
} from './types';

const HISTORY_PATH = path.join(process.cwd(), 'data', 'signal-history.json');

type Store = {
  live: SignalRecord[];
  backtest: SignalRecord[];
  backtestAt?: string;
};

let memory: Store | null = null;
let writeQueue: Promise<void> = Promise.resolve();

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

function statsFrom(records: SignalRecord[], label: string): AccuracyStats {
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
  for (const item of [...records].sort((a, b) => (a.closedAt || a.openedAt).localeCompare(b.closedAt || b.openedAt))) {
    equity += item.pnlUSDT || 0;
    peak = Math.max(peak, equity);
    maxDrawdownUSDT = Math.max(maxDrawdownUSDT, peak - equity);
  }
  const sampleNote =
    closed.length < 20
      ? `${label}: ${closed.length} closed trades is too small to advertise an accuracy rate.`
      : `${label}: statistics use closed WIN/LOSS outcomes only. Ambiguous same-candle stop/target paths are excluded. Look-ahead is blocked by evaluating each bar from past candles only.`;
  return {
    sampleSize: records.length,
    closedSample: closed.length,
    wins: wins.length,
    losses: losses.length,
    expired: expired.length,
    open: open.length,
    winRate: closed.length ? wins.length / closed.length : null,
    profitFactor: closed.length ? (grossLoss === 0 ? (grossProfit > 0 ? Number.POSITIVE_INFINITY : null) : grossProfit / grossLoss) : null,
    maxDrawdownUSDT: closed.length ? maxDrawdownUSDT : null,
    netPnlUSDT,
    note: sampleNote,
  };
}

async function loadStore(): Promise<Store> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(HISTORY_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Store;
    memory = { live: parsed.live || [], backtest: parsed.backtest || [], backtestAt: parsed.backtestAt };
  } catch {
    memory = { live: [], backtest: [] };
  }
  return memory;
}

async function saveStore(store: Store) {
  memory = store;
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
    await fs.writeFile(HISTORY_PATH, JSON.stringify(store, null, 2));
  });
  await writeQueue;
}

function signalId(symbol: string, direction: string, interval: string, entry: number, openedAt: string) {
  return `${symbol}-${interval}-${direction}-${entry.toPrecision(8)}-${openedAt.slice(0, 16)}`;
}

function snapshotFromSetup(setup: TradeSetup): Pick<
  SignalRecord,
  | 'marginUSDT'
  | 'leverage'
  | 'marginMode'
  | 'quantity'
  | 'notionalUSDT'
  | 'requiredMarginUSDT'
  | 'totalFeesUSDT'
  | 'stepSize'
  | 'tickSize'
  | 'pricePrecision'
  | 'executable'
  | 'netProfitUSDT'
  | 'netLossUSDT'
  | 'snapshotPreserved'
> {
  return {
    marginUSDT: setup.allocatedMarginUSDT,
    leverage: setup.leverage,
    marginMode: setup.marginMode,
    quantity: setup.quantity,
    notionalUSDT: setup.notionalUSDT,
    requiredMarginUSDT: setup.requiredMarginUSDT,
    totalFeesUSDT: setup.totalFeesUSDT,
    stepSize: setup.stepSize,
    tickSize: setup.tickSize,
    pricePrecision: setup.pricePrecision,
    executable: setup.executable,
    netProfitUSDT: setup.netProfitUSDT,
    netLossUSDT: setup.netLossUSDT,
    snapshotPreserved: true,
  };
}

export function pnlForRecord(record: SignalRecord, exitPrice: number, outcome: 'WIN' | 'LOSS' | 'EXPIRED' | 'AMBIGUOUS'): number {
  if (record.quantity != null && record.totalFeesUSDT != null) {
    return realizedPnlUSDT({
      direction: record.direction,
      entry: record.entry,
      exitPrice,
      quantity: record.quantity,
      totalFeesUSDT: record.totalFeesUSDT,
      outcome,
    });
  }
  const filters = fixtureFilters(record.symbol);
  const setup = buildSetup({
    direction: record.direction,
    entry: record.entry,
    stop: record.stop,
    target: record.target,
    filters,
    marginUSDT: record.marginUSDT ?? DEFAULT_SETTINGS.marginUSDT,
    leverage: record.leverage ?? DEFAULT_SETTINGS.leverage,
    marginMode: record.marginMode ?? DEFAULT_SETTINGS.marginMode,
  });
  const quantity = setup?.quantity ?? 0;
  const fees = setup?.totalFeesUSDT ?? 0;
  return realizedPnlUSDT({
    direction: record.direction,
    entry: record.entry,
    exitPrice,
    quantity,
    totalFeesUSDT: fees,
    outcome,
  });
}

export async function recordLiveSignals(coins: CoinScan[]) {
  const store = await loadStore();
  const now = Date.now();
  const updated = store.live.map((item) => {
    if (item.outcome !== 'OPEN') return item;
    const coin = coins.find((row) => row.symbol === item.symbol);
    if (!coin?.price) return item;
    const hitStop = item.direction === 'LONG' ? coin.price <= item.stop : coin.price >= item.stop;
    const hitTarget = item.direction === 'LONG' ? coin.price >= item.target : coin.price <= item.target;
    if (hitStop || hitTarget) {
      const outcome: SignalRecord['outcome'] = hitStop ? 'LOSS' : 'WIN';
      const exitPrice = hitStop ? item.stop : item.target;
      return {
        ...item,
        outcome,
        exitPrice,
        closedAt: new Date().toISOString(),
        pnlUSDT: pnlForRecord(item, exitPrice, outcome),
      };
    }
    if (now - Date.parse(item.openedAt) > 4 * 60 * 60 * 1000) {
      return {
        ...item,
        outcome: 'EXPIRED' as const,
        exitPrice: coin.price,
        closedAt: new Date().toISOString(),
        pnlUSDT: pnlForRecord(item, coin.price, 'EXPIRED'),
      };
    }
    if (coin.direction !== 'WAIT' && coin.direction !== item.direction) {
      return {
        ...item,
        outcome: 'EXPIRED' as const,
        exitPrice: coin.price,
        closedAt: new Date().toISOString(),
        pnlUSDT: pnlForRecord(item, coin.price, 'EXPIRED'),
      };
    }
    return item;
  });

  const additions: SignalRecord[] = [];
  for (const coin of coins) {
    if (coin.direction === 'WAIT' || !coin.setup) continue;
    if (coin.lifecycle && ['MISSED_ENTRY', 'EXPIRED', 'INVALIDATED', 'TARGET_HIT', 'STOP_HIT'].includes(coin.lifecycle.status)) {
      continue;
    }
    if (!coin.setup.executable && coin.lifecycle?.status !== 'WAITING_FOR_ENTRY' && coin.lifecycle?.status !== 'TRIGGERED') continue;
    const duplicate = updated.some(
      (item) =>
        item.symbol === coin.symbol &&
        item.direction === coin.direction &&
        item.outcome === 'OPEN' &&
        Math.abs(item.entry - coin.setup!.entry) / coin.setup!.entry < 0.0015,
    );
    if (duplicate) continue;
    const openedAt = coin.analyzedAt;
    additions.push({
      id: signalId(coin.symbol, coin.direction, '15m', coin.setup.entry, openedAt),
      symbol: coin.symbol,
      direction: coin.direction,
      pattern: coin.pattern,
      patternStatus: coin.patternStatus,
      interval: '15m',
      entry: coin.setup.entry,
      stop: coin.setup.stop,
      target: coin.setup.target,
      entryConditions: coin.entryConditions,
      openedAt,
      source: 'live',
      outcome: 'OPEN',
      closedAt: null,
      exitPrice: null,
      pnlUSDT: null,
      ...snapshotFromSetup(coin.setup),
      lifecycleStatus: coin.lifecycle?.status,
      fillConfirmed: false,
      originalEntry: coin.originalEntry ?? coin.setup.entry,
    });
  }

  store.live = [...additions, ...updated].slice(0, 400);
  await saveStore(store);
}

async function runBacktest(): Promise<SignalRecord[]> {
  const records: SignalRecord[] = [];
  for (const symbol of SCAN_SYMBOLS) {
    try {
      const candles = (await getCandles(symbol, '1h', 220)).filter((item) => item.closed);
      if (candles.length < 90) continue;
      for (let index = 70; index < candles.length - 8; index++) {
        const window = candles.slice(0, index + 1);
        const snapshot = analyzeTimeframe(window, '1h');
        const confirmed = snapshot.patterns.find((item) => item.status === 'CONFIRMED');
        const direction =
          confirmed?.bias === 'BULLISH' || snapshot.breakout === 'UP'
            ? 'LONG'
            : confirmed?.bias === 'BEARISH' || snapshot.breakout === 'DOWN'
              ? 'SHORT'
              : 'WAIT';
        if (direction === 'WAIT') continue;
        if (snapshot.trend === 'BEARISH' && direction === 'LONG') continue;
        if (snapshot.trend === 'BULLISH' && direction === 'SHORT') continue;
        const last = window[window.length - 1];
        const volatility = snapshot.atr || last.close * 0.004;
        const entry = last.close;
        const stop = direction === 'LONG' ? entry - volatility * 1.2 : entry + volatility * 1.2;
        const target = direction === 'LONG' ? entry + Math.abs(entry - stop) * 2 : entry - Math.abs(entry - stop) * 2;
        const setup = buildSetup({
          direction,
          entry,
          stop,
          target,
          filters: fixtureFilters(symbol),
        });
        if (!setup?.executable) continue;
        const future = candles.slice(index + 1, index + 13);
        const resolved = outcomeFromPath(direction, setup.entry, setup.stop, setup.target, future);
        const outcome = resolved?.outcome || 'EXPIRED';
        const exitPrice = resolved?.exitPrice ?? future.at(-1)?.close ?? setup.entry;
        const openedAt = new Date(last.openTime).toISOString();
        const record: SignalRecord = {
          id: signalId(symbol, direction, '1h', setup.entry, openedAt),
          symbol,
          direction,
          pattern: confirmed?.name || snapshot.breakout,
          patternStatus: confirmed?.status || 'UNCONFIRMED',
          interval: '1h',
          entry: setup.entry,
          stop: setup.stop,
          target: setup.target,
          entryConditions: 'Walk-forward 1h closed-candle test using only bars up to the signal bar.',
          openedAt,
          source: 'backtest',
          outcome,
          closedAt: new Date(resolved?.closedAt || future.at(-1)?.openTime || last.openTime).toISOString(),
          exitPrice,
          pnlUSDT: null,
          ...snapshotFromSetup(setup),
        };
        record.pnlUSDT = pnlForRecord(record, exitPrice, outcome);
        records.push(record);
        index += 3;
      }
    } catch {
      // Skip pairs Binance will not serve historically.
    }
  }
  return records;
}

export async function getHistory(): Promise<HistoryResponse> {
  const store = await loadStore();
  const staleBacktest = !store.backtestAt || Date.now() - Date.parse(store.backtestAt) > 60 * 60 * 1000;
  if (staleBacktest || store.backtest.length === 0) {
    try {
      store.backtest = await runBacktest();
      store.backtestAt = new Date().toISOString();
      await saveStore(store);
    } catch {
      // Keep any previous backtest sample rather than inventing results.
    }
  }
  return {
    live: store.live.slice(0, 80),
    liveStats: store.live.length ? statsFrom(store.live, 'Forward test (live session history)') : emptyStats('No live-observed signals yet.'),
    backtestStats: store.backtest.length ? statsFrom(store.backtest, 'Walk-forward 1h backtest') : emptyStats('Backtest sample is not ready.'),
    backtestSampleNote:
      'Backtest evaluates each 1h bar using only past candles, then checks later bars for stop or target. Same-bar stop and target is counted as a loss. Historical rows keep the original margin, leverage, quantity and fee snapshot. This is not a 95% accuracy claim.',
    updatedAt: new Date().toISOString(),
  };
}
