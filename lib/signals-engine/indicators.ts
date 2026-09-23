import type { Candle, MacdPoint, Trend } from './types';

export function ema(values: number[], period: number): number[] {
  if (!values.length) return [];
  const k = 2 / (period + 1);
  let current = values[0];
  return values.map((value, index) => {
    if (index === 0) return current;
    current = value * k + current * (1 - k);
    return current;
  });
}

export function lastEma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  return ema(values, period).at(-1) ?? null;
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const delta = values[i] - values[i - 1];
    gain += Math.max(delta, 0);
    loss += Math.max(-delta, 0);
  }
  gain /= period;
  loss /= period;
  for (let i = period + 1; i < values.length; i++) {
    const delta = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(delta, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-delta, 0)) / period;
  }
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

export function atr(candles: Candle[], period = 14): number | null {
  if (candles.length < period + 1) return null;
  const ranges = candles.slice(1).map((candle, index) => {
    const previous = candles[index];
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previous.close),
      Math.abs(candle.low - previous.close),
    );
  });
  let value = ranges.slice(0, period).reduce((sum, item) => sum + item, 0) / period;
  for (const item of ranges.slice(period)) {
    value = (value * (period - 1) + item) / period;
  }
  return value;
}

export function macd(values: number[]): MacdPoint | null {
  if (values.length < 35) return null;
  const fast = ema(values, 12);
  const slow = ema(values, 26);
  const line = fast.map((value, index) => value - slow[index]);
  const signal = ema(line, 9);
  const index = values.length - 1;
  return {
    macd: line[index],
    signal: signal[index],
    histogram: line[index] - signal[index],
  };
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function trendFromEmas(price: number, ema9: number, ema21: number, ema50: number | null): Trend {
  const bullish = ema9 > ema21 && price > ema21 && (ema50 == null || price >= ema50 * 0.998);
  const bearish = ema9 < ema21 && price < ema21 && (ema50 == null || price <= ema50 * 1.002);
  if (bullish) return 'BULLISH';
  if (bearish) return 'BEARISH';
  return 'MIXED';
}

export function rangeLevels(candles: Candle[], lookback = 20) {
  const window = candles.slice(-(lookback + 1), -1);
  if (!window.length) {
    const last = candles.at(-1);
    return { support: last?.low ?? 0, resistance: last?.high ?? 0 };
  }
  return {
    support: Math.min(...window.map((item) => item.low)),
    resistance: Math.max(...window.map((item) => item.high)),
  };
}

export type Swing = {
  index: number;
  time: number;
  price: number;
  type: 'high' | 'low';
};

export function findSwings(candles: Candle[], strength = 3): Swing[] {
  const swings: Swing[] = [];
  for (let i = strength; i < candles.length - strength; i++) {
    const candle = candles[i];
    let isHigh = true;
    let isLow = true;
    for (let offset = 1; offset <= strength; offset++) {
      if (candles[i - offset].high >= candle.high || candles[i + offset].high > candle.high) isHigh = false;
      if (candles[i - offset].low <= candle.low || candles[i + offset].low < candle.low) isLow = false;
    }
    if (isHigh) swings.push({ index: i, time: candle.openTime, price: candle.high, type: 'high' });
    else if (isLow) swings.push({ index: i, time: candle.openTime, price: candle.low, type: 'low' });
  }
  return swings;
}

export function marketStructure(swings: Swing[], lastClose: number): { label: string; breakout: 'UP' | 'DOWN' | 'NONE' } {
  const highs = swings.filter((item) => item.type === 'high').slice(-3);
  const lows = swings.filter((item) => item.type === 'low').slice(-3);
  if (highs.length < 2 || lows.length < 2) {
    return { label: 'Insufficient swing structure', breakout: 'NONE' };
  }
  const hh = highs.at(-1)!.price > highs.at(-2)!.price;
  const lh = highs.at(-1)!.price < highs.at(-2)!.price;
  const hl = lows.at(-1)!.price > lows.at(-2)!.price;
  const ll = lows.at(-1)!.price < lows.at(-2)!.price;
  let label = 'Range / mixed swings';
  if (hh && hl) label = 'Higher highs and higher lows';
  else if (lh && ll) label = 'Lower highs and lower lows';
  else if (hh && ll) label = 'Expanding swings';
  else if (lh && hl) label = 'Contracting swings';
  const lastHigh = highs.at(-1)!.price;
  const lastLow = lows.at(-1)!.price;
  if (lastClose > lastHigh) return { label: `${label}; close above last swing high`, breakout: 'UP' };
  if (lastClose < lastLow) return { label: `${label}; close below last swing low`, breakout: 'DOWN' };
  return { label, breakout: 'NONE' };
}

export function linearSlope(points: Array<{ x: number; y: number }>): number | null {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

export function lineValue(start: { x: number; y: number }, slope: number, x: number): number {
  return start.y + slope * (x - start.x);
}

export function nearlyEqual(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function rsiSeries(values: number[], period = 14): Array<number | null> {
  return values.map((_, index) => (index < period ? null : rsi(values.slice(0, index + 1), period)));
}

export function rsiDivergence(candles: Candle[]): 'BULLISH' | 'BEARISH' | 'NONE' {
  if (candles.length < 30) return 'NONE';
  const closes = candles.map((item) => item.close);
  const series = rsiSeries(closes);
  const swings = findSwings(candles, 3);
  const highs = swings.filter((item) => item.type === 'high').slice(-2);
  const lows = swings.filter((item) => item.type === 'low').slice(-2);
  if (highs.length === 2) {
    const rsiA = series[highs[0].index];
    const rsiB = series[highs[1].index];
    if (rsiA != null && rsiB != null && highs[1].price > highs[0].price && rsiB < rsiA - 1.5) return 'BEARISH';
  }
  if (lows.length === 2) {
    const rsiA = series[lows[0].index];
    const rsiB = series[lows[1].index];
    if (rsiA != null && rsiB != null && lows[1].price < lows[0].price && rsiB > rsiA + 1.5) return 'BULLISH';
  }
  return 'NONE';
}

export function candleConfirmation(candle: Candle): 'BULLISH' | 'BEARISH' | 'NONE' {
  const range = candle.high - candle.low;
  if (range <= 0) return 'NONE';
  const body = candle.close - candle.open;
  const mid = (candle.high + candle.low) / 2;
  if (body > 0 && candle.close >= mid && Math.abs(body) >= range * 0.45) return 'BULLISH';
  if (body < 0 && candle.close <= mid && Math.abs(body) >= range * 0.45) return 'BEARISH';
  return 'NONE';
}

export function detectRetest(
  candles: Candle[],
  levels: { support: number; resistance: number },
  breakout: 'UP' | 'DOWN' | 'NONE',
  atrValue: number | null,
): 'HELD' | 'FAILED' | 'NONE' {
  if (breakout === 'NONE' || candles.length < 4) return 'NONE';
  const last = candles.at(-1)!;
  const prior = candles.at(-2)!;
  const buffer = (atrValue || last.close * 0.002) * 0.15;
  if (breakout === 'UP') {
    const tagged = prior.low <= levels.resistance + buffer && prior.close > levels.resistance - buffer;
    if (!tagged) return 'NONE';
    return last.close >= levels.resistance - buffer ? 'HELD' : 'FAILED';
  }
  const tagged = prior.high >= levels.support - buffer && prior.close < levels.support + buffer;
  if (!tagged) return 'NONE';
  return last.close <= levels.support + buffer ? 'HELD' : 'FAILED';
}

export function pearsonCorrelation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 10) return null;
  const xs = a.slice(-n);
  const ys = b.slice(-n);
  const meanX = mean(xs);
  const meanY = mean(ys);
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX <= 0 || denY <= 0) return null;
  return num / Math.sqrt(denX * denY);
}
