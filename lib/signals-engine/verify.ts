import { formatPriceByTick } from './trading';
import type {
  Direction,
  MarketContext,
  PatternStatus,
  QualityLabel,
  SignalQuality,
  TimeframeSnapshot,
  TimeframeVote,
  Trend,
} from './types';

export const VERIFY_ENGINE_VERSION = 'pw-verify-v2';

export type VerificationResult = {
  direction: Direction;
  reason: string;
  nextStep: string;
  entryConditions: string;
  patternName: string;
  patternStatus: PatternStatus;
  trend: Trend;
  quality: SignalQuality;
};

function snapshot(snapshots: TimeframeSnapshot[], interval: string) {
  return snapshots.find((item) => item.interval === interval);
}

function hasConfirmed(item: TimeframeSnapshot | undefined, bias: 'BULLISH' | 'BEARISH') {
  return Boolean(item?.patterns.some((pattern) => pattern.status === 'CONFIRMED' && pattern.bias === bias && pattern.educational !== true));
}

function macdSupports(item: TimeframeSnapshot | undefined, direction: 'LONG' | 'SHORT') {
  if (!item?.macd) return false;
  return direction === 'LONG' ? item.macd.histogram >= 0 : item.macd.histogram <= 0;
}

function volumeBreak(item: TimeframeSnapshot | undefined, side: 'UP' | 'DOWN') {
  return Boolean(item && item.breakout === side && item.volumeRatio > 1.2);
}

function primaryPattern(snapshots: TimeframeSnapshot[], bias?: 'BULLISH' | 'BEARISH') {
  const rank = ['4h', '1h', '15m'];
  const preferred = [...snapshots].sort((a, b) => rank.indexOf(a.interval) - rank.indexOf(b.interval));
  const matches = (item: TimeframeSnapshot['patterns'][number]) => !bias || item.bias === bias || item.bias === 'NEUTRAL';
  for (const row of preferred) {
    const confirmed = row.patterns.find((item) => item.status === 'CONFIRMED' && matches(item));
    if (confirmed) return { snapshot: row, pattern: confirmed };
  }
  for (const row of preferred) {
    const forming = row.patterns.find((item) => item.status === 'FORMING' && matches(item));
    if (forming) return { snapshot: row, pattern: forming };
  }
  return null;
}

function voteFor(item: TimeframeSnapshot | undefined, bias: 'BULLISH' | 'BEARISH'): { vote: TimeframeVote; note: string } {
  if (!item) return { vote: 'UNAVAILABLE', note: 'Timeframe not present in this scan.' };
  if (item.trend === bias) return { vote: 'SUPPORT', note: `${item.interval} EMA trend is ${item.trend}.` };
  if (item.trend === 'MIXED') return { vote: 'NEUTRAL', note: `${item.interval} EMA trend is mixed.` };
  return { vote: 'CONTRADICT', note: `${item.interval} EMA trend is ${item.trend}.` };
}

export function decideDirectionV1(snapshots: TimeframeSnapshot[]): Omit<VerificationResult, 'quality'> {
  const hourly = snapshot(snapshots, '1h');
  const mid = snapshot(snapshots, '15m') || hourly || snapshots[0];
  const higher = hourly || (snapshots.length === 1 ? snapshots[0] : undefined);
  const fast = snapshot(snapshots, '5m');
  const trend: Trend = higher?.trend || mid?.trend || 'MIXED';
  const rsiLongOk = mid?.rsi != null && mid.rsi < 72;
  const rsiShortOk = mid?.rsi != null && mid.rsi > 28;

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

function detectPotential(mid: TimeframeSnapshot | undefined, higher: TimeframeSnapshot | undefined): 'LONG' | 'SHORT' | 'NONE' {
  if (!mid) return 'NONE';
  const longHint =
    mid.trend === 'BULLISH' ||
    hasConfirmed(mid, 'BULLISH') ||
    hasConfirmed(higher, 'BULLISH') ||
    volumeBreak(mid, 'UP') ||
    mid.rsiDivergence === 'BULLISH';
  const shortHint =
    mid.trend === 'BEARISH' ||
    hasConfirmed(mid, 'BEARISH') ||
    hasConfirmed(higher, 'BEARISH') ||
    volumeBreak(mid, 'DOWN') ||
    mid.rsiDivergence === 'BEARISH';
  if (longHint && !shortHint) return 'LONG';
  if (shortHint && !longHint) return 'SHORT';
  return 'NONE';
}

function fmtLevel(value: number | undefined, tickSize?: number, pricePrecision?: number) {
  if (value == null) return null;
  if (tickSize && tickSize > 0) return formatPriceByTick(value, tickSize, pricePrecision);
  return value.toPrecision(6);
}

export function verifySignal(input: {
  snapshots: TimeframeSnapshot[];
  stale?: boolean;
  error?: string;
  context?: MarketContext | null;
  symbol?: string;
  tickSize?: number;
  pricePrecision?: number;
}): VerificationResult {
  const snapshots = input.snapshots;
  const fourHour = snapshot(snapshots, '4h');
  const hourly = snapshot(snapshots, '1h');
  const mid = snapshot(snapshots, '15m') || hourly || snapshots[0];
  const higher = fourHour || hourly || (snapshots.length === 1 ? snapshots[0] : undefined);
  const fast = snapshot(snapshots, '5m');
  const minute = snapshot(snapshots, '1m');
  const trend: Trend = higher?.trend || mid?.trend || 'MIXED';
  const picked = primaryPattern(snapshots);
  const context = input.context;

  const supporting: string[] = [];
  const contradictory: string[] = [];
  const votes = (['1m', '5m', '15m', '1h', '4h'] as const).map((interval) => {
    const row = snapshot(snapshots, interval);
    const bias = mid?.trend === 'BEARISH' ? 'BEARISH' : 'BULLISH';
    const voted = voteFor(row, bias);
    return { interval, vote: voted.vote, note: voted.note };
  });

  const freshness: SignalQuality['dataFreshness'] = input.error || !mid ? 'MISSING' : input.stale ? 'STALE' : 'FRESH';
  const baseQuality = (label: QualityLabel, direction: Direction, extra: Partial<VerificationResult> = {}): VerificationResult => {
    const invalidation = picked?.pattern.invalidation
      || (direction === 'LONG' ? 'Invalid if the next 15m close loses the broken level or 1H/4H turns bearish.' : direction === 'SHORT' ? 'Invalid if the next 15m close reclaims the broken level or 1H/4H turns bullish.' : 'No trade to invalidate.');
    return {
      direction,
      trend,
      patternName: extra.patternName || picked?.pattern.name || 'None',
      patternStatus: extra.patternStatus || picked?.pattern.status || 'UNCONFIRMED',
      reason: extra.reason || 'WAIT is the valid result until independent confirmation exists.',
      entryConditions: extra.entryConditions || 'Do not enter. WAIT is not an error.',
      nextStep: extra.nextStep || 'Stay flat. A detected pattern is not automatically a trade.',
      quality: {
        label,
        engineVersion: VERIFY_ENGINE_VERSION,
        supporting,
        contradictory,
        timeframeVotes: votes,
        patternConfirmation: extra.patternStatus || picked?.pattern.status || 'UNCONFIRMED',
        entryConditions: extra.entryConditions || 'Do not enter.',
        invalidationConditions: invalidation,
        dataFreshness: freshness,
        executionEligible: false,
        context: context || undefined,
      },
    };
  };

  if (freshness === 'MISSING') {
    contradictory.push(input.error || 'Essential candles or ticker data are missing.');
    return baseQuality('INSUFFICIENT DATA', 'WAIT', {
      reason: input.error || 'Essential market data is missing. No signal is manufactured.',
      entryConditions: 'Do not enter while candles or prices are unavailable.',
      nextStep: 'Retry after Binance data is reachable. Missing data defaults to WAIT.',
    });
  }
  if (freshness === 'STALE') {
    contradictory.push('One or more timeframes look stale relative to the candle clock.');
    return baseQuality('INSUFFICIENT DATA', 'WAIT', {
      reason: 'Stale or incomplete candles. The verifier rejects a trade rather than guessing.',
      entryConditions: 'Do not enter on stale data.',
      nextStep: 'Wait for the next successful closed-candle refresh.',
    });
  }

  const potential = detectPotential(mid, higher);
  if (mid?.structure) supporting.push(`15m structure: ${mid.structure}`);
  if (higher?.structure) supporting.push(`${higher.interval} structure: ${higher.structure}`);
  if (mid?.ema200 != null) supporting.push(`EMA 9/21/50/200 on ${mid.interval}: ${mid.ema9.toPrecision(6)} / ${mid.ema21.toPrecision(6)} / ${mid.ema50?.toPrecision(6) ?? 'n/a'} / ${mid.ema200.toPrecision(6)}`);
  if (mid?.rsi != null) supporting.push(`${mid.interval} RSI ${mid.rsi.toFixed(1)}`);
  if (mid?.macd) supporting.push(`${mid.interval} MACD histogram ${mid.macd.histogram.toPrecision(4)}`);
  if (mid?.volumeAnomaly) supporting.push(`${mid.interval} volume is abnormally high versus the recent average.`);
  if (mid?.rsiDivergence && mid.rsiDivergence !== 'NONE') supporting.push(`${mid.interval} RSI divergence: ${mid.rsiDivergence}`);
  if (mid?.candleConfirm && mid.candleConfirm !== 'NONE') supporting.push(`${mid.interval} closed candle confirmation: ${mid.candleConfirm}`);
  if (mid?.retest && mid.retest !== 'NONE') supporting.push(`${mid.interval} retest ${mid.retest.toLowerCase()}.`);
  if (picked) supporting.push(`${picked.pattern.name} is ${picked.pattern.status} on ${picked.snapshot.interval}. A pattern is not automatically a signal.`);

  if (fourHour && hourly && fourHour.trend !== 'MIXED' && hourly.trend !== 'MIXED' && fourHour.trend !== hourly.trend) {
    contradictory.push(`4H trend ${fourHour.trend} conflicts with 1H trend ${hourly.trend}. Not all timeframes agree.`);
  }
  if (hourly && mid && hourly.trend !== 'MIXED' && mid.trend !== 'MIXED' && hourly.trend !== mid.trend) {
    contradictory.push(`1H trend ${hourly.trend} conflicts with 15m trend ${mid.trend}.`);
  }
  if (fast && mid && fast.trend !== 'MIXED' && mid.trend !== 'MIXED' && fast.trend !== mid.trend) {
    contradictory.push(`5m momentum ${fast.trend} conflicts with 15m trend ${mid.trend}.`);
  }
  if (context?.btcAvailable && context.btcTrend && context.btcTrend !== 'MIXED' && input.symbol !== 'BTCUSDT') {
    const note = `BTC 1H/4H context is ${context.btcTrend}.`;
    if (context.correlationToBtc != null && context.correlationToBtc >= 0.65) supporting.push(`${note} Correlation to BTC is ${context.correlationToBtc.toFixed(2)}.`);
    else supporting.push(`${note} Correlation is ${context.correlationToBtc == null ? 'unavailable' : context.correlationToBtc.toFixed(2)}.`);
  }
  if (context?.fundingRate != null) supporting.push(`Last funding rate ${context.fundingRate}.`);
  else supporting.push('Funding rate was not available and was not invented.');
  if (context?.openInterest != null) supporting.push(`Open interest ${context.openInterest}.`);
  else supporting.push('Open interest was not available and was not invented.');
  if (context?.estimatedSpreadBps != null) supporting.push(`Estimated mark/last spread ${context.estimatedSpreadBps.toFixed(1)} bps.`);
  if (context?.estimatedSlippageBps != null) supporting.push(`Estimated slippage ${context.estimatedSlippageBps.toFixed(1)} bps from ATR. Estimate only.`);

  if (potential === 'NONE') {
    const label: QualityLabel = contradictory.some((item) => item.includes('conflicts')) ? 'CONFLICTING EVIDENCE' : picked?.pattern.status === 'FORMING' ? 'DEVELOPING SETUP' : 'CONFLICTING EVIDENCE';
    return baseQuality(label, 'WAIT', {
      reason: label === 'DEVELOPING SETUP'
        ? `${picked?.pattern.name} is developing. Stage B did not independently confirm a LONG or SHORT.`
        : 'Stage A found no one-sided setup, or short-term momentum conflicts with higher-timeframe trend.',
      entryConditions: 'Do not enter. WAIT is the valid result.',
      nextStep: 'Stay flat until closed-candle confirmation and higher-timeframe agreement.',
    });
  }

  const side = potential;
  const required: string[] = [];
  const failed: string[] = [];
  const bullish = side === 'LONG';

  const check = (ok: boolean, pass: string, fail: string) => {
    if (ok) {
      required.push(pass);
      supporting.push(pass);
    } else {
      failed.push(fail);
      contradictory.push(fail);
    }
  };

  check(Boolean(mid && mid.trend === (bullish ? 'BULLISH' : 'BEARISH')), `${mid?.interval} trend agrees with ${side}.`, `${mid?.interval || '15m'} trend does not agree with ${side}.`);
  check(Boolean(higher && higher.trend !== (bullish ? 'BEARISH' : 'BULLISH')), `Higher timeframe ${higher?.interval} is not opposing ${side}.`, `Higher timeframe ${higher?.interval || '1h/4h'} opposes ${side}.`);
  check(!hasConfirmed(higher, bullish ? 'BEARISH' : 'BULLISH'), 'No confirmed opposing higher-timeframe pattern.', 'A confirmed opposing higher-timeframe pattern is present.');
  check(
    mid?.rsi != null && (bullish ? mid.rsi < 75 : mid.rsi > 25),
    `${mid?.interval} RSI is not extreme against ${side}. RSI is a veto, not independent proof from EMA.`,
    `${mid?.interval || '15m'} RSI is missing or extreme against ${side}.`,
  );
  if (macdSupports(mid, side) || macdSupports(higher, side)) {
    supporting.push('MACD histogram agrees. It is counted with RSI as one momentum family, not a second independent proof.');
  } else if (mid?.macd) {
    contradictory.push('MACD histogram does not agree. This is momentum context, not a second independent score.');
  }
  check(
    hasConfirmed(mid, bullish ? 'BULLISH' : 'BEARISH')
      || hasConfirmed(hourly, bullish ? 'BULLISH' : 'BEARISH')
      || hasConfirmed(fourHour, bullish ? 'BULLISH' : 'BEARISH')
      || volumeBreak(mid, bullish ? 'UP' : 'DOWN'),
    'Closed-candle pattern confirmation or volume breakout is present. A confirmed pattern is not automatically a trade.',
    'No confirmed 15m, 1h or 4h pattern and no volume-backed closed-candle breakout.',
  );
  check(
    !mid?.structure.includes(bullish ? 'Lower highs and lower lows' : 'Higher highs and higher lows'),
    '15m swing structure is not opposing the setup.',
    '15m swing structure opposes the setup.',
  );
  check(
    mid?.rsiDivergence !== (bullish ? 'BEARISH' : 'BULLISH'),
    'No opposing RSI divergence on the signal timeframe.',
    'Opposing RSI divergence is present.',
  );
  if (mid?.retest === 'FAILED') {
    failed.push('Breakout retest failed.');
    contradictory.push('The breakout retest failed on a closed candle.');
  }
  if (context?.btcAvailable && context.btcTrend && context.correlationToBtc != null && context.correlationToBtc >= 0.7 && input.symbol !== 'BTCUSDT') {
    const opposing = (bullish && context.btcTrend === 'BEARISH') || (!bullish && context.btcTrend === 'BULLISH');
    if (opposing && !hasConfirmed(higher, bullish ? 'BULLISH' : 'BEARISH')) {
      failed.push('BTC context opposes the setup while correlation is high.');
      contradictory.push(`BTC is ${context.btcTrend} with correlation ${context.correlationToBtc.toFixed(2)} and no confirmed higher-timeframe pattern.`);
    }
  }
  if (context?.fundingRate != null && Math.abs(context.fundingRate) >= 0.001) {
    if ((bullish && context.fundingRate > 0) || (!bullish && context.fundingRate < 0)) {
      contradictory.push('Funding is crowded in the same direction. This is context, not a fill.');
    }
  }

  if (failed.length >= 2 || failed.some((item) => item.includes('opposes') || item.includes('missing') || item.includes('No confirmed'))) {
    const developing = picked?.pattern.status === 'FORMING' && failed.length < 3;
    return baseQuality(developing ? 'DEVELOPING SETUP' : failed.some((item) => item.includes('opposes')) ? 'CONFLICTING EVIDENCE' : 'DEVELOPING SETUP', 'WAIT', {
      reason: `Stage A saw a possible ${side}, but Stage B rejected it: ${failed[0]}`,
      entryConditions: 'Do not enter. Confirmation conditions are incomplete or contradictory.',
      nextStep: picked?.pattern.invalidation || 'Stay flat. The verifier does not manufacture a trade.',
      patternName: picked?.pattern.name || 'None',
      patternStatus: picked?.pattern.status || 'UNCONFIRMED',
    });
  }

  if (failed.length > 0) {
    return baseQuality('DEVELOPING SETUP', 'WAIT', {
      reason: `A ${side} idea is developing. Missing confirmation: ${failed[0]}`,
      entryConditions: 'Do not enter until the remaining confirmation prints on a closed candle.',
      nextStep: 'WAIT is valid. Watch the next 15m close and higher-timeframe agreement.',
    });
  }

  const level = bullish ? mid?.resistance : mid?.support;
  const levelText = fmtLevel(level, input.tickSize, input.pricePrecision);
  const result = baseQuality('CONFIRMED SETUP', side, {
    patternName: picked?.pattern.name || (bullish ? 'Volume breakout' : 'Volume breakdown'),
    patternStatus: picked?.pattern.status === 'CONFIRMED' ? 'CONFIRMED' : volumeBreak(mid, bullish ? 'UP' : 'DOWN') ? 'CONFIRMED' : picked?.pattern.status || 'UNCONFIRMED',
    reason: required.slice(0, 3).join(' '),
    entryConditions: bullish
      ? `Manual long only if price holds above ${levelText ?? 'the broken 15m level'} and the next 15m close stays bullish.`
      : `Manual short only if price holds below ${levelText ?? 'the broken 15m level'} and the next 15m close stays bearish.`,
    nextStep: `Watch ${mid?.interval || '15m'} and ${fast?.interval || minute?.interval || '5m'} closes. This is not a guaranteed outcome.`,
  });
  result.quality.executionEligible = true;
  return result;
}
