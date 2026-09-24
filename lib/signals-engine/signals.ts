import { atr, candleConfirmation, detectRetest, lastEma, macd, rangeLevels, rsi, rsiDivergence, trendFromEmas } from './indicators';
import { detectPatterns, structureSnapshot } from './patterns';
import { fixtureFilters } from './exchange-fixtures';
import { buildSetup, passesPublicationRr, requirePublicationNetRr, roundToTick } from './trading';
import { verifySignal } from './verify';
import type {
  Candle,
  CoinScan,
  Direction,
  MarketContext,
  PatternStatus,
  SymbolFilters,
  TimeframeSnapshot,
  TradeSetup,
  Trend,
} from './types';
import { DEFAULT_SETTINGS } from './types';

export function analyzeTimeframe(candles: Candle[], interval: string): TimeframeSnapshot {
  const closed = candles.filter((item) => item.closed);
  if (closed.length < 40) throw Error(`Not enough closed ${interval} candles`);
  const last = closed[closed.length - 1];
  const closes = closed.map((item) => item.close);
  const ema9 = lastEma(closes, 9);
  const ema21 = lastEma(closes, 21);
  const ema50 = lastEma(closes, 50);
  const ema200 = lastEma(closes, 200);
  if (ema9 == null || ema21 == null) throw Error('Unable to compute EMA 9/21');
  const volatility = atr(closed);
  const levels = rangeLevels(closed, 20);
  const previous = closed.slice(-21, -1);
  const averageVolume = previous.length ? previous.reduce((sum, item) => sum + item.volume, 0) / previous.length : last.volume;
  const volumeRatio = averageVolume > 0 ? last.volume / averageVolume : 1;
  const buffer = (volatility || last.close * 0.002) * 0.12;
  let breakout: TimeframeSnapshot['breakout'] = 'NONE';
  if (last.close > levels.resistance + buffer && volumeRatio > 1.2) breakout = 'UP';
  if (last.close < levels.support - buffer && volumeRatio > 1.2) breakout = 'DOWN';
  const structure = structureSnapshot(closed);
  if (breakout === 'NONE') breakout = structure.breakout;
  return {
    interval,
    lastClosedAt: new Date(last.openTime).toISOString(),
    price: last.close,
    trend: trendFromEmas(last.close, ema9, ema21, ema50),
    structure: structure.label,
    ema9,
    ema21,
    ema50,
    ema200,
    rsi: rsi(closes),
    macd: macd(closes),
    atr: volatility,
    volumeRatio,
    volumeAnomaly: volumeRatio >= 2,
    rsiDivergence: rsiDivergence(closed),
    candleConfirm: candleConfirmation(last),
    retest: detectRetest(closed, levels, breakout, volatility),
    support: levels.support,
    resistance: levels.resistance,
    breakout,
    patterns: detectPatterns(closed, volatility),
  };
}

function primaryPattern(snapshots: TimeframeSnapshot[], bias?: 'BULLISH' | 'BEARISH') {
  const rank = ['4h', '1h', '15m'];
  const preferred = [...snapshots].sort((a, b) => rank.indexOf(a.interval) - rank.indexOf(b.interval));
  const matches = (item: TimeframeSnapshot['patterns'][number]) => (!bias || item.bias === bias || item.bias === 'NEUTRAL') && item.educational !== true;
  for (const snapshot of preferred) {
    const confirmed = snapshot.patterns.find((item) => item.status === 'CONFIRMED' && matches(item));
    if (confirmed) return { snapshot, pattern: confirmed };
  }
  for (const snapshot of preferred) {
    const forming = snapshot.patterns.find((item) => item.status === 'FORMING' && matches(item));
    if (forming) return { snapshot, pattern: forming };
  }
  return null;
}

function hasConfirmed(snapshot: TimeframeSnapshot | undefined, bias: 'BULLISH' | 'BEARISH') {
  return Boolean(snapshot?.patterns.some((item) => item.status === 'CONFIRMED' && item.bias === bias && item.educational !== true));
}

function macdSupports(snapshot: TimeframeSnapshot | undefined, direction: 'LONG' | 'SHORT'): boolean {
  if (!snapshot?.macd) return false;
  return direction === 'LONG' ? snapshot.macd.histogram >= 0 : snapshot.macd.histogram <= 0;
}

function decideDirection(snapshots: TimeframeSnapshot[]): {
  direction: Direction;
  reason: string;
  nextStep: string;
  entryConditions: string;
  patternName: string;
  patternStatus: PatternStatus;
  trend: Trend;
} {
  const hourly = snapshots.find((item) => item.interval === '1h');
  const mid = snapshots.find((item) => item.interval === '15m') || hourly || snapshots[0];
  const higher = hourly || (snapshots.length === 1 ? snapshots[0] : undefined);
  const fast = snapshots.find((item) => item.interval === '5m');
  const trend: Trend = higher?.trend || mid?.trend || 'MIXED';
  const rsiLongOk = mid?.rsi != null && mid.rsi < 72;
  const rsiShortOk = mid?.rsi != null && mid.rsi > 28;
  const volumeBreak = (snapshot: TimeframeSnapshot | undefined, side: 'UP' | 'DOWN') =>
    Boolean(snapshot && snapshot.breakout === side && snapshot.volumeRatio > 1.2);

  const longReady =
    higher?.trend === 'BULLISH' &&
    mid?.trend === 'BULLISH' &&
    (hasConfirmed(higher, 'BULLISH') || hasConfirmed(mid, 'BULLISH') || volumeBreak(mid, 'UP')) &&
    !hasConfirmed(higher, 'BEARISH') &&
    rsiLongOk &&
    macdSupports(mid, 'LONG');
  const shortReady =
    higher?.trend === 'BEARISH' &&
    mid?.trend === 'BEARISH' &&
    (hasConfirmed(higher, 'BEARISH') || hasConfirmed(mid, 'BEARISH') || volumeBreak(mid, 'DOWN')) &&
    !hasConfirmed(higher, 'BULLISH') &&
    rsiShortOk &&
    macdSupports(mid, 'SHORT');

  if (longReady && !shortReady) {
    const picked = primaryPattern(snapshots, 'BULLISH');
    const level = mid?.resistance;
    return {
      direction: 'LONG',
      trend,
      patternName: picked?.pattern.name || 'None',
      patternStatus: picked?.pattern.status || 'UNCONFIRMED',
      reason: picked?.pattern.status === 'CONFIRMED'
        ? `${picked.pattern.name} is confirmed on ${picked.snapshot.interval}, and both 15m and 1H trends are bullish.`
        : '15m closed-candle breakout with volume, plus bullish 15m and 1H EMA trends. No confirmed opposing 1H pattern.',
      entryConditions: `Manual long only if price holds above ${level?.toPrecision(6) ?? 'the broken 15m level'} and the next 15m close stays bullish.`,
      nextStep: `Watch ${mid?.interval || '15m'} and ${fast?.interval || '5m'} closes. Stay long only while price holds above the stop. This is not a guaranteed outcome.`,
    };
  }

  if (shortReady && !longReady) {
    const picked = primaryPattern(snapshots, 'BEARISH');
    const level = mid?.support;
    return {
      direction: 'SHORT',
      trend,
      patternName: picked?.pattern.name || 'None',
      patternStatus: picked?.pattern.status || 'UNCONFIRMED',
      reason: picked?.pattern.status === 'CONFIRMED'
        ? `${picked.pattern.name} is confirmed on ${picked.snapshot.interval}, and both 15m and 1H trends are bearish.`
        : '15m closed-candle breakdown with volume, plus bearish 15m and 1H EMA trends. No confirmed opposing 1H pattern.',
      entryConditions: `Manual short only if price holds below ${level?.toPrecision(6) ?? 'the broken 15m level'} and the next 15m close stays bearish.`,
      nextStep: `Watch ${mid?.interval || '15m'} and ${fast?.interval || '5m'} closes. Stay short only while price holds below the stop. This is not a guaranteed outcome.`,
    };
  }

  const forming = primaryPattern(snapshots);
  return {
    direction: 'WAIT',
    trend,
    patternName: forming?.pattern.name || 'None',
    patternStatus: forming?.pattern.status || 'UNCONFIRMED',
    reason: forming?.pattern.status === 'FORMING'
      ? `${forming.pattern.name} is forming on ${forming.snapshot.interval}. ${forming.pattern.evidence.at(-1) || 'Need a confirming close.'} 15m and 1H are not aligned enough for a trade.`
      : 'No confirmed 15m/1H geometric pattern and no closed-candle breakout with both 15m and 1H trend agreement.',
    entryConditions: 'Do not enter. Wait for a confirming closed candle and aligned 15m plus 1H trends.',
    nextStep: forming?.pattern.invalidation
      ? `Stay flat. ${forming.pattern.invalidation}`
      : 'Stay flat until a confirmed close provides direction. Unclear conditions default to WAIT.',
  };
}

const STRUCTURE_INTERVALS = new Set(['15m', '1h', '4h']);

export function levelsForSetup(direction: Direction, snapshots: TimeframeSnapshot[], livePrice: number, tickSize = 0) {
  const mid = snapshots.find((item) => item.interval === '15m') || snapshots.find((item) => STRUCTURE_INTERVALS.has(item.interval)) || snapshots.at(-1);
  if (!mid || direction === 'WAIT') return null;
  const volatility = mid.atr || mid.price * 0.004 || livePrice * 0.004;
  const entry = tickSize > 0 ? roundToTick(mid.price, tickSize) : mid.price;
  const tick = (value: number) => (tickSize > 0 ? roundToTick(value, tickSize) : value);

  // Restored legacy pattern-engine geometry: ATR/support-based stop, risk×2 take-profit
  // (previous working 15-coin / pattern scanner behavior).
  if (direction === 'LONG') {
    const stopRaw = Math.min(mid.support - volatility * 0.1, entry - volatility * 1.2);
    const stop = tick(stopRaw);
    const risk = entry - stop;
    if (!(risk > 0)) return null;
    return { entry, stop, target: tick(entry + risk * 2), source: 'risk-multiple' as const };
  }
  const stopRaw = Math.max(mid.resistance + volatility * 0.1, entry + volatility * 1.2);
  const stop = tick(stopRaw);
  const risk = stop - entry;
  if (!(risk > 0)) return null;
  return { entry, stop, target: tick(entry - risk * 2), source: 'risk-multiple' as const };
}

export function buildCoinScan(input: {
  symbol: string;
  filters: SymbolFilters;
  snapshots: TimeframeSnapshot[];
  livePrice: number | null;
  priceUpdatedAt: string | null;
  stale: boolean;
  error?: string;
  context?: MarketContext | null;
}): CoinScan {
  const analyzedAt = new Date().toISOString();
  if (!input.filters.available) {
    return {
      symbol: input.symbol,
      available: false,
      unavailableReason: input.filters.reason || 'Unavailable on Binance USDT-M Futures',
      price: null,
      priceUpdatedAt: input.priceUpdatedAt,
      stale: false,
      trend: 'MIXED',
      direction: 'WAIT',
      pattern: 'None',
      patternStatus: 'UNAVAILABLE',
      timeframes: [],
      filters: input.filters,
      setup: null,
      entryConditions: 'Pair is not available; no signal is generated.',
      reason: input.filters.reason || 'Unavailable on Binance USDT-M Futures',
      nextStep: 'Leave this pair unmarked. No synthetic market data is shown.',
      lastCandleCloseAt: null,
      analyzedAt,
    };
  }
  if (input.error || !input.snapshots.length || input.livePrice == null) {
    return {
      symbol: input.symbol,
      available: true,
      price: input.livePrice,
      priceUpdatedAt: input.priceUpdatedAt,
      stale: true,
      error: input.error || 'Insufficient live market data',
      trend: 'MIXED',
      direction: 'WAIT',
      pattern: 'None',
      patternStatus: 'UNCONFIRMED',
      timeframes: input.snapshots,
      filters: input.filters,
      setup: null,
      entryConditions: 'No trade while market data is incomplete.',
      reason: input.error || 'Live candles or ticker were not available.',
      nextStep: 'Retry after Binance data is reachable. Do not use placeholder prices.',
      lastCandleCloseAt: input.snapshots.at(-1)?.lastClosedAt ?? null,
      analyzedAt,
    };
  }

  const decision = verifySignal({
    snapshots: input.snapshots,
    stale: input.stale,
    error: input.error,
    context: input.context,
    symbol: input.symbol,
    tickSize: input.filters.tickSize,
    pricePrecision: input.filters.pricePrecision,
  });
  const levels = levelsForSetup(decision.direction, input.snapshots, input.livePrice, input.filters.tickSize);
  let setup: TradeSetup | null = null;
  if (decision.direction !== 'WAIT' && levels) {
    setup = buildSetup({
      direction: decision.direction,
      entry: levels.entry,
      stop: levels.stop,
      target: levels.target,
      filters: input.filters,
      marginUSDT: DEFAULT_SETTINGS.marginUSDT,
      leverage: DEFAULT_SETTINGS.leverage,
      feeRate: DEFAULT_SETTINGS.takerFeeRate,
      marginMode: DEFAULT_SETTINGS.marginMode,
    });
  }
  if (setup && requirePublicationNetRr() && !passesPublicationRr(setup.netRiskReward)) {
    const net = setup.netRiskReward.toFixed(2);
    const gross = setup.grossRiskReward.toFixed(2);
    return {
      symbol: input.symbol,
      available: true,
      price: input.livePrice,
      priceUpdatedAt: input.priceUpdatedAt,
      stale: input.stale,
      trend: decision.trend,
      direction: 'WAIT',
      pattern: decision.patternName,
      patternStatus: decision.patternStatus,
      timeframes: input.snapshots,
      filters: input.filters,
      setup: null,
      entryConditions: 'Do not enter. The structure-based target does not support a defensible 1:3 net risk/reward.',
      reason: `Net risk/reward is 1:${net} (gross 1:${gross}). Structure does not support a defensible 1:3 target after fees. Targets were not stretched to manufacture the ratio.`,
      nextStep: 'Stay flat. WAIT is the valid result until market structure offers a larger, realistic target.',
      lastCandleCloseAt: input.snapshots.find((item) => item.interval === '15m')?.lastClosedAt || input.snapshots.at(-1)?.lastClosedAt || null,
      analyzedAt,
      quality: {
        ...decision.quality,
        label: 'DEVELOPING SETUP',
        executionEligible: false,
        entryConditions: 'Do not enter. Publication requires net R/R of at least 1:3 without stretching the target.',
      },
      context: input.context || decision.quality.context || null,
    };
  }
  if (setup) {
    decision.quality.executionEligible = setup.executable;
  }

  return {
    symbol: input.symbol,
    available: true,
    price: input.livePrice,
    priceUpdatedAt: input.priceUpdatedAt,
    stale: input.stale,
    trend: decision.trend,
    direction: decision.direction,
    pattern: decision.patternName,
    patternStatus: decision.patternStatus,
    timeframes: input.snapshots,
    filters: input.filters,
    setup,
    entryConditions: decision.entryConditions,
    reason: decision.reason,
    nextStep: setup && !setup.executable
      ? `${decision.nextStep} A confirmed pattern is not automatically an executable trade.`
      : decision.nextStep,
    lastCandleCloseAt: input.snapshots.find((item) => item.interval === '15m')?.lastClosedAt || input.snapshots.at(-1)?.lastClosedAt || null,
    analyzedAt,
    originalEntry: setup?.entry,
    quality: decision.quality,
    context: input.context || decision.quality.context || null,
  };
}

export function analyzeSingleMarket(candles: Candle[], symbol: string, interval: string, filters?: SymbolFilters) {
  const snapshot = analyzeTimeframe(candles, interval);
  const fallbackFilters: SymbolFilters = filters || fixtureFilters(symbol);
  const scan = buildCoinScan({
    symbol,
    filters: fallbackFilters,
    snapshots: [snapshot],
    livePrice: snapshot.price,
    priceUpdatedAt: snapshot.lastClosedAt,
    stale: false,
  });
  const setup = scan.setup;
  return {
    symbol,
    timeframe: interval,
    asOf: snapshot.lastClosedAt,
    price: snapshot.price,
    latestMarketPrice: snapshot.price,
    trend: scan.trend,
    direction: scan.direction,
    pattern: scan.pattern === 'None' ? 'No confirmed geometric pattern' : scan.pattern,
    patternStatus: scan.patternStatus,
    resistance: snapshot.resistance,
    support: snapshot.support,
    ema9: snapshot.ema9,
    ema21: snapshot.ema21,
    ema50: snapshot.ema50,
    ema200: snapshot.ema200,
    rsi: snapshot.rsi,
    macd: snapshot.macd,
    atr: snapshot.atr,
    volumeRatio: snapshot.volumeRatio,
    entry: setup?.entry ?? null,
    stop: setup?.stop ?? null,
    target: setup?.target ?? null,
    estimatedStopLossUSDT: setup?.estimatedLossUSDT ?? null,
    estimatedProfitUSDT: setup?.estimatedProfitUSDT ?? null,
    estimatedFeesUSDT: setup?.estimatedFeesUSDT ?? null,
    riskReward: setup?.riskReward ?? null,
    executable: setup?.executable ?? false,
    executableReason: setup?.executableReason ?? scan.entryConditions,
    marginUSDT: DEFAULT_SETTINGS.marginUSDT,
    leverage: DEFAULT_SETTINGS.leverage,
    reason: scan.reason,
    nextStep: scan.nextStep,
    note: 'Signals use completed candles only. Vision output, if present, is descriptive and not independently confirmed.',
    timeframes: [snapshot],
    setup,
  };
}
