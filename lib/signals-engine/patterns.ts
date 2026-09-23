import { findSwings, linearSlope, lineValue, marketStructure, nearlyEqual, type Swing } from './indicators';
import type { Candle, DetectedPattern, PatternName, PatternStatus } from './types';

function pattern(
  name: PatternName,
  bias: DetectedPattern['bias'],
  status: PatternStatus,
  evidence: string[],
  invalidation: string,
  extra: Pick<DetectedPattern, 'volumeConfirmed' | 'levels'> = {},
): DetectedPattern {
  return { name, bias, status, evidence, invalidation, educational: false, ...extra };
}

function lastOf<T>(items: T[], count: number): T[] {
  return items.slice(-count);
}

function atrOrFallback(candles: Candle[], atrValue: number | null): number {
  if (atrValue && atrValue > 0) return atrValue;
  const last = candles.at(-1);
  return last ? last.close * 0.005 : 1;
}

function relativeVolume(candles: Candle[]): number {
  const last = candles.at(-1);
  const previous = candles.slice(-21, -1);
  if (!last || !previous.length) return 1;
  const average = previous.reduce((sum, item) => sum + item.volume, 0) / previous.length;
  return average > 0 ? last.volume / average : 1;
}

function confirmBreak(close: number, level: number, direction: 'above' | 'below', buffer: number): boolean {
  return direction === 'above' ? close > level + buffer : close < level - buffer;
}

function confirmStatus(broke: boolean, volumeOk: boolean): PatternStatus {
  return broke && volumeOk ? 'CONFIRMED' : 'FORMING';
}

function volumeNote(broke: boolean, volumeOk: boolean, ratio: number): string {
  if (!broke) return 'Waiting for a confirming close beyond the pattern';
  if (volumeOk) return `Close confirmation with volume ${ratio.toFixed(2)}× the recent average`;
  return `Close is beyond the level but volume ${ratio.toFixed(2)}× is not confirming`;
}

function detectDouble(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 6);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 6);
  const close = candles.at(-1)!.close;
  const tolerance = Math.max(atrValue * 0.35, close * 0.0025);
  const volumeOk = volumeRatio >= 1.15;

  for (let i = 0; i < highs.length - 1; i++) {
    for (let j = i + 1; j < highs.length; j++) {
      const left = highs[i];
      const right = highs[j];
      const between = highs.filter((item) => item.index > left.index && item.index < right.index);
      if (between.some((item) => item.price > Math.max(left.price, right.price) + tolerance)) continue;
      const trough = lows.find((item) => item.index > left.index && item.index < right.index);
      const span = right.index - left.index;
      if (trough && span >= 6 && nearlyEqual(left.price, right.price, tolerance)) {
        const depth = Math.min(left.price, right.price) - trough.price;
        if (depth >= atrValue * 1 && span >= 8) {
          const neck = trough.price;
          const confirmed = confirmBreak(close, neck, 'below', atrValue * 0.12);
          return pattern(
            'Double Top',
            'BEARISH',
            confirmStatus(confirmed, volumeOk),
            [
              `Two swing highs at ${left.price.toPrecision(6)} and ${right.price.toPrecision(6)} within ${tolerance.toPrecision(4)}`,
              `Neckline trough at ${neck.toPrecision(6)}`,
              volumeNote(confirmed, volumeOk, volumeRatio),
            ],
            `Invalid if price closes back above ${Math.max(left.price, right.price).toPrecision(6)}`,
            { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, resistance: Math.max(left.price, right.price), support: neck } },
          );
        }
      }
    }
  }

  for (let i = 0; i < lows.length - 1; i++) {
    for (let j = i + 1; j < lows.length; j++) {
      const left = lows[i];
      const right = lows[j];
      const between = lows.filter((item) => item.index > left.index && item.index < right.index);
      if (between.some((item) => item.price < Math.min(left.price, right.price) - tolerance)) continue;
      const peak = highs.find((item) => item.index > left.index && item.index < right.index);
      const span = right.index - left.index;
      if (peak && span >= 6 && nearlyEqual(left.price, right.price, tolerance)) {
        const lift = peak.price - Math.max(left.price, right.price);
        if (lift >= atrValue * 1 && span >= 8) {
          const neck = peak.price;
          const confirmed = confirmBreak(close, neck, 'above', atrValue * 0.12);
          return pattern(
            'Double Bottom',
            'BULLISH',
            confirmStatus(confirmed, volumeOk),
            [
              `Two swing lows at ${left.price.toPrecision(6)} and ${right.price.toPrecision(6)} within ${tolerance.toPrecision(4)}`,
              `Neckline peak at ${neck.toPrecision(6)}`,
              volumeNote(confirmed, volumeOk, volumeRatio),
            ],
            `Invalid if price closes back below ${Math.min(left.price, right.price).toPrecision(6)}`,
            { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, support: Math.min(left.price, right.price), resistance: neck } },
          );
        }
      }
    }
  }
  return null;
}

function detectTriple(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 6);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 6);
  const close = candles.at(-1)!.close;
  const tolerance = Math.max(atrValue * 0.4, close * 0.003);
  const volumeOk = volumeRatio >= 1.15;

  if (highs.length >= 3) {
    const [a, b, c] = highs.slice(-3);
    if (nearlyEqual(a.price, b.price, tolerance) && nearlyEqual(b.price, c.price, tolerance) && c.index - a.index >= 12) {
      const troughs = lows.filter((item) => item.index > a.index && item.index < c.index);
      if (troughs.length >= 2) {
        const neck = Math.min(...troughs.map((item) => item.price));
        const confirmed = confirmBreak(close, neck, 'below', atrValue * 0.12);
        return pattern(
          'Triple Top',
          'BEARISH',
          confirmStatus(confirmed, volumeOk),
          [
            `Three similar highs ${a.price.toPrecision(6)}, ${b.price.toPrecision(6)}, ${c.price.toPrecision(6)}`,
            `Neckline ${neck.toPrecision(6)}`,
            volumeNote(confirmed, volumeOk, volumeRatio),
          ],
          `Invalid if price closes above ${Math.max(a.price, b.price, c.price).toPrecision(6)}`,
          { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, resistance: Math.max(a.price, b.price, c.price), support: neck } },
        );
      }
    }
  }

  if (lows.length >= 3) {
    const [a, b, c] = lows.slice(-3);
    if (nearlyEqual(a.price, b.price, tolerance) && nearlyEqual(b.price, c.price, tolerance) && c.index - a.index >= 12) {
      const peaks = highs.filter((item) => item.index > a.index && item.index < c.index);
      if (peaks.length >= 2) {
        const neck = Math.max(...peaks.map((item) => item.price));
        const confirmed = confirmBreak(close, neck, 'above', atrValue * 0.12);
        return pattern(
          'Triple Bottom',
          'BULLISH',
          confirmStatus(confirmed, volumeOk),
          [
            `Three similar lows ${a.price.toPrecision(6)}, ${b.price.toPrecision(6)}, ${c.price.toPrecision(6)}`,
            `Neckline ${neck.toPrecision(6)}`,
            volumeNote(confirmed, volumeOk, volumeRatio),
          ],
          `Invalid if price closes below ${Math.min(a.price, b.price, c.price).toPrecision(6)}`,
          { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, support: Math.min(a.price, b.price, c.price), resistance: neck } },
        );
      }
    }
  }
  return null;
}

function detectHeadShoulders(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 6);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 6);
  const close = candles.at(-1)!.close;
  const shoulderTol = Math.max(atrValue * 0.55, close * 0.006);
  const volumeOk = volumeRatio >= 1.15;

  if (highs.length >= 3) {
    const [left, head, right] = highs.slice(-3);
    if (head.index > left.index && right.index > head.index && head.price > left.price + atrValue * 0.45 && head.price > right.price + atrValue * 0.45 && nearlyEqual(left.price, right.price, shoulderTol)) {
      const leftTrough = lows.find((item) => item.index > left.index && item.index < head.index);
      const rightTrough = lows.find((item) => item.index > head.index && item.index < right.index);
      if (leftTrough && rightTrough) {
        const neck = (leftTrough.price + rightTrough.price) / 2;
        const confirmed = confirmBreak(close, neck, 'below', atrValue * 0.12);
        return pattern(
          'Head and Shoulders',
          'BEARISH',
          confirmStatus(confirmed, volumeOk),
          [
            `Head ${head.price.toPrecision(6)} above shoulders ${left.price.toPrecision(6)} / ${right.price.toPrecision(6)}`,
            `Neckline around ${neck.toPrecision(6)}`,
            volumeNote(confirmed, volumeOk, volumeRatio),
          ],
          `Invalid if price closes above the head at ${head.price.toPrecision(6)}`,
          { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, resistance: head.price, support: neck } },
        );
      }
    }
  }

  if (lows.length >= 3) {
    const [left, head, right] = lows.slice(-3);
    if (head.index > left.index && right.index > head.index && head.price < left.price - atrValue * 0.45 && head.price < right.price - atrValue * 0.45 && nearlyEqual(left.price, right.price, shoulderTol)) {
      const leftPeak = highs.find((item) => item.index > left.index && item.index < head.index);
      const rightPeak = highs.find((item) => item.index > head.index && item.index < right.index);
      if (leftPeak && rightPeak) {
        const neck = (leftPeak.price + rightPeak.price) / 2;
        const confirmed = confirmBreak(close, neck, 'above', atrValue * 0.12);
        return pattern(
          'Inverse Head and Shoulders',
          'BULLISH',
          confirmStatus(confirmed, volumeOk),
          [
            `Head ${head.price.toPrecision(6)} below shoulders ${left.price.toPrecision(6)} / ${right.price.toPrecision(6)}`,
            `Neckline around ${neck.toPrecision(6)}`,
            volumeNote(confirmed, volumeOk, volumeRatio),
          ],
          `Invalid if price closes below the head at ${head.price.toPrecision(6)}`,
          { volumeConfirmed: confirmed && volumeOk, levels: { neckline: neck, support: head.price, resistance: neck } },
        );
      }
    }
  }
  return null;
}

function findPole(candles: Candle[], atrValue: number): { start: number; end: number; direction: 'UP' | 'DOWN'; height: number } | null {
  const end = candles.length - 1;
  const minEnd = Math.max(8, candles.length - 36);
  let best: { start: number; end: number; direction: 'UP' | 'DOWN'; height: number } | null = null;
  for (let finish = end - 5; finish >= minEnd; finish--) {
    for (let length = 3; length <= 12; length++) {
      const start = finish - length;
      if (start < 0) continue;
      const slice = candles.slice(start, finish + 1);
      const high = Math.max(...slice.map((item) => item.high));
      const low = Math.min(...slice.map((item) => item.low));
      const height = high - low;
      if (height < atrValue * 2.2) continue;
      const direction: 'UP' | 'DOWN' = slice.at(-1)!.close > slice[0]!.open ? 'UP' : 'DOWN';
      const move = Math.abs(slice.at(-1)!.close - slice[0]!.open);
      if (move < height * 0.55) continue;
      if (!best || height > best.height) best = { start, end: finish, direction, height };
    }
  }
  return best;
}

function detectFlagOrPennant(candles: Candle[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const pole = findPole(candles, atrValue);
  if (!pole) return null;
  const flagBars = candles.slice(pole.end + 1);
  if (flagBars.length < 5 || flagBars.length > 22) return null;
  const flagHigh = Math.max(...flagBars.map((item) => item.high));
  const flagLow = Math.min(...flagBars.map((item) => item.low));
  const flagHeight = flagHigh - flagLow;
  if (flagHeight <= 0 || flagHeight > pole.height * 0.55) return null;

  const highs = flagBars.map((item, index) => ({ x: index, y: item.high }));
  const lows = flagBars.map((item, index) => ({ x: index, y: item.low }));
  const highSlope = linearSlope(highs);
  const lowSlope = linearSlope(lows);
  if (highSlope == null || lowSlope == null) return null;

  const close = candles.at(-1)!.close;
  const lastX = flagBars.length - 1;
  const upper = lineValue(highs[0], highSlope, lastX);
  const lower = lineValue(lows[0], lowSlope, lastX);
  const startWidth = flagBars[0].high - flagBars[0].low;
  const endWidth = Math.max(0.0000001, upper - lower);
  const converging = endWidth < startWidth * 0.72;
  const parallel = Math.abs(highSlope - lowSlope) <= atrValue * 0.08;
  const againstPole =
    (pole.direction === 'UP' && highSlope <= atrValue * 0.02 && lowSlope <= atrValue * 0.02) ||
    (pole.direction === 'DOWN' && highSlope >= -atrValue * 0.02 && lowSlope >= -atrValue * 0.02);
  if (!againstPole) return null;

  const bullish = pole.direction === 'UP';
  const broke = bullish
    ? confirmBreak(close, flagHigh, 'above', atrValue * 0.04)
    : confirmBreak(close, flagLow, 'below', atrValue * 0.04);
  const volumeOk = volumeRatio >= 1.15;
  const extra = { volumeConfirmed: broke && volumeOk, levels: { support: flagLow, resistance: flagHigh } };

  if (converging && !parallel) {
    return pattern(
      bullish ? 'Bull Pennant' : 'Bear Pennant',
      bullish ? 'BULLISH' : 'BEARISH',
      confirmStatus(broke, volumeOk),
      [
        `Impulse pole of ${pole.height.toPrecision(6)} over ${pole.end - pole.start + 1} candles`,
        `Consolidating pennant width shrank from ${startWidth.toPrecision(5)} to ${endWidth.toPrecision(5)}`,
        volumeNote(broke, volumeOk, volumeRatio),
      ],
      bullish ? `Invalid if price closes below ${flagLow.toPrecision(6)}` : `Invalid if price closes above ${flagHigh.toPrecision(6)}`,
      extra,
    );
  }

  if (parallel) {
    return pattern(
      bullish ? 'Bull Flag' : 'Bear Flag',
      bullish ? 'BULLISH' : 'BEARISH',
      confirmStatus(broke, volumeOk),
      [
        `Impulse pole of ${pole.height.toPrecision(6)}`,
        `Parallel-style flag range ${flagHeight.toPrecision(6)}, counter-trend slope`,
        volumeNote(broke, volumeOk, volumeRatio),
      ],
      bullish ? `Invalid if price closes below ${flagLow.toPrecision(6)}` : `Invalid if price closes above ${flagHigh.toPrecision(6)}`,
      extra,
    );
  }
  return null;
}

function detectTriangleWedgeChannel(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 5);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 5);
  if (highs.length < 3 || lows.length < 3) return null;
  const highPts = highs.map((item) => ({ x: item.index, y: item.price }));
  const lowPts = lows.map((item) => ({ x: item.index, y: item.price }));
  const highSlope = linearSlope(highPts);
  const lowSlope = linearSlope(lowPts);
  if (highSlope == null || lowSlope == null) return null;

  const close = candles.at(-1)!.close;
  const lastIndex = candles.length - 1;
  const upper = lineValue(highPts[0], highSlope, lastIndex);
  const lower = lineValue(lowPts[0], lowSlope, lastIndex);
  const startWidth = highPts[0].y - lowPts[0].y;
  const endWidth = upper - lower;
  if (startWidth <= atrValue * 0.4) return null;

  const flatHigh = Math.abs(highSlope) <= atrValue * 0.015;
  const flatLow = Math.abs(lowSlope) <= atrValue * 0.015;
  const risingHighs = highSlope > atrValue * 0.01;
  const fallingHighs = highSlope < -atrValue * 0.01;
  const risingLows = lowSlope > atrValue * 0.01;
  const fallingLows = lowSlope < -atrValue * 0.01;
  const converging = endWidth > 0 && endWidth < startWidth * 0.78;
  const diverging = endWidth > startWidth * 1.22;
  const parallel = Math.abs(highSlope - lowSlope) <= atrValue * 0.02;
  const confirmedUp = confirmBreak(close, upper, 'above', atrValue * 0.04);
  const confirmedDown = confirmBreak(close, lower, 'below', atrValue * 0.04);
  const volumeOk = volumeRatio >= 1.15;
  const levels = { support: lower, resistance: upper };

  if (flatHigh && risingLows && converging) {
    return pattern('Ascending Triangle', 'BULLISH', confirmStatus(confirmedUp, volumeOk), [
      'Flat resistance from recent swing highs',
      'Rising swing lows',
      volumeNote(confirmedUp, volumeOk, volumeRatio),
    ], `Invalid if price closes below ${lower.toPrecision(6)}`, { volumeConfirmed: confirmedUp && volumeOk, levels });
  }
  if (flatLow && fallingHighs && converging) {
    return pattern('Descending Triangle', 'BEARISH', confirmStatus(confirmedDown, volumeOk), [
      'Flat support from recent swing lows',
      'Lower swing highs',
      volumeNote(confirmedDown, volumeOk, volumeRatio),
    ], `Invalid if price closes above ${upper.toPrecision(6)}`, { volumeConfirmed: confirmedDown && volumeOk, levels });
  }
  if (fallingHighs && risingLows && converging) {
    const broke = confirmedUp || confirmedDown;
    return pattern('Symmetrical Triangle', 'NEUTRAL', confirmStatus(broke, volumeOk), [
      'Lower highs and higher lows',
      `Width contracted from ${startWidth.toPrecision(5)} to ${endWidth.toPrecision(5)}`,
      volumeNote(broke, volumeOk, volumeRatio),
    ], `Invalid if price returns and holds inside ${lower.toPrecision(6)}–${upper.toPrecision(6)}`, { volumeConfirmed: broke && volumeOk, levels });
  }
  if (risingHighs && risingLows && converging && lowSlope > highSlope) {
    return pattern('Rising Wedge', 'BEARISH', confirmStatus(confirmedDown, volumeOk), [
      'Rising highs and faster-rising lows',
      'Converging bearish wedge geometry',
      volumeNote(confirmedDown, volumeOk, volumeRatio),
    ], `Invalid if price closes above ${upper.toPrecision(6)}`, { volumeConfirmed: confirmedDown && volumeOk, levels });
  }
  if (fallingHighs && fallingLows && converging && highSlope < lowSlope) {
    return pattern('Falling Wedge', 'BULLISH', confirmStatus(confirmedUp, volumeOk), [
      'Falling lows and faster-falling highs',
      'Converging bullish wedge geometry',
      volumeNote(confirmedUp, volumeOk, volumeRatio),
    ], `Invalid if price closes below ${lower.toPrecision(6)}`, { volumeConfirmed: confirmedUp && volumeOk, levels });
  }
  if (risingHighs && fallingLows && diverging) {
    const broke = confirmedUp || confirmedDown;
    return pattern('Broadening Formation', 'NEUTRAL', confirmStatus(broke, volumeOk), [
      'Rising swing highs and falling swing lows',
      `Width expanded from ${startWidth.toPrecision(5)} to ${endWidth.toPrecision(5)}`,
      volumeNote(broke, volumeOk, volumeRatio),
    ], 'Invalid if price returns to the expanding range and holds', { volumeConfirmed: broke && volumeOk, levels });
  }
  if (parallel && highs.length >= 3 && lows.length >= 3 && (risingHighs || fallingHighs || risingLows || fallingLows) && !diverging) {
    const bullish = risingHighs || risingLows;
    const broke = confirmedUp || confirmedDown;
    return pattern(bullish ? 'Ascending Channel' : 'Descending Channel', 'NEUTRAL', confirmStatus(broke, volumeOk), [
      'Parallel swing highs and lows',
      `Channel ${lower.toPrecision(6)}–${upper.toPrecision(6)}`,
      volumeNote(broke, volumeOk, volumeRatio),
    ], 'Invalid if price re-enters and holds the channel', { volumeConfirmed: broke && volumeOk, levels });
  }
  return null;
}

function detectRectangle(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 4);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 4);
  if (highs.length < 3 || lows.length < 3) return null;
  const close = candles.at(-1)!.close;
  const highTol = Math.max(atrValue * 0.28, close * 0.002);
  const lowTol = highTol;
  const highMax = Math.max(...highs.map((item) => item.price));
  const highMin = Math.min(...highs.map((item) => item.price));
  const lowMax = Math.max(...lows.map((item) => item.price));
  const lowMin = Math.min(...lows.map((item) => item.price));
  if (highMax - highMin > highTol || lowMax - lowMin > lowTol) return null;
  const height = highMin - lowMax;
  if (height < atrValue * 1.1) return null;
  if (highs.at(-1)!.index - highs[0].index < 8) return null;
  const volumeOk = volumeRatio >= 1.15;
  const brokeUp = confirmBreak(close, highMax, 'above', atrValue * 0.05);
  const brokeDown = confirmBreak(close, lowMin, 'below', atrValue * 0.05);
  const broke = brokeUp || brokeDown;
  return pattern(
    'Rectangle',
    'NEUTRAL',
    confirmStatus(broke, volumeOk),
    [
      `Flat highs ${highMin.toPrecision(6)}–${highMax.toPrecision(6)} and flat lows ${lowMin.toPrecision(6)}–${lowMax.toPrecision(6)}`,
      volumeNote(broke, volumeOk, volumeRatio),
    ],
    `Invalid if price returns inside ${lowMax.toPrecision(6)}–${highMin.toPrecision(6)}`,
    { volumeConfirmed: broke && volumeOk, levels: { support: lowMax, resistance: highMin } },
  );
}

function detectCupAndHandle(candles: Candle[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  if (candles.length < 42) return null;
  const window = candles.slice(-70);
  const lows = window.map((item) => item.low);
  const start = Math.floor(window.length * 0.2);
  const end = Math.floor(window.length * 0.72);
  let minIndex = start;
  for (let i = start; i <= end; i++) {
    if (lows[i] < lows[minIndex]) minIndex = i;
  }
  const leftRim = Math.max(...window.slice(0, minIndex).map((item) => item.high));
  const rightSlice = window.slice(minIndex, Math.max(minIndex + 8, window.length - 8));
  if (!rightSlice.length) return null;
  const rightRim = Math.max(...rightSlice.map((item) => item.high));
  if (!nearlyEqual(leftRim, rightRim, Math.max(atrValue * 0.45, leftRim * 0.008))) return null;
  const cupDepth = ((leftRim + rightRim) / 2) - window[minIndex].low;
  if (cupDepth < atrValue * 2.4) return null;
  const handle = window.slice(-8);
  const handleLow = Math.min(...handle.map((item) => item.low));
  const handleHigh = Math.max(...handle.map((item) => item.high));
  if (handleHigh - handleLow > cupDepth * 0.5) return null;
  if (handleLow < window[minIndex].low + cupDepth * 0.35) return null;
  const close = window.at(-1)!.close;
  const rim = Math.max(leftRim, rightRim);
  const broke = confirmBreak(close, rim, 'above', atrValue * 0.05);
  const volumeOk = volumeRatio >= 1.15;
  return pattern(
    'Cup and Handle',
    'BULLISH',
    confirmStatus(broke, volumeOk),
    [
      `U-shaped cup depth ${cupDepth.toPrecision(6)} with similar rims ${leftRim.toPrecision(6)} / ${rightRim.toPrecision(6)}`,
      `Shallow handle staying above ${handleLow.toPrecision(6)}`,
      volumeNote(broke, volumeOk, volumeRatio),
    ],
    `Invalid if price closes below the handle low ${handleLow.toPrecision(6)}`,
    { volumeConfirmed: broke && volumeOk, levels: { resistance: rim, support: handleLow, neckline: rim } },
  );
}

function detect123(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 4);
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 4);
  const close = candles.at(-1)!.close;
  const volumeOk = volumeRatio >= 1.15;
  if (lows.length >= 2 && highs.length >= 1) {
    const p1 = lows.at(-2)!;
    const p2 = highs.find((item) => item.index > p1.index);
    const p3 = lows.at(-1)!;
    if (p2 && p3.index > p2.index && p3.price > p1.price + atrValue * 0.2 && p3.price < p2.price - atrValue * 0.2) {
      const broke = confirmBreak(close, p2.price, 'above', atrValue * 0.08);
      return pattern(
        '1-2-3 Reversal',
        'BULLISH',
        confirmStatus(broke, volumeOk),
        [
          `Point 1 low ${p1.price.toPrecision(6)}, point 2 high ${p2.price.toPrecision(6)}, higher point 3 ${p3.price.toPrecision(6)}`,
          volumeNote(broke, volumeOk, volumeRatio),
        ],
        `Invalid if price closes below point 3 ${p3.price.toPrecision(6)}`,
        { volumeConfirmed: broke && volumeOk, levels: { support: p3.price, resistance: p2.price, neckline: p2.price } },
      );
    }
  }
  if (highs.length >= 2 && lows.length >= 1) {
    const p1 = highs.at(-2)!;
    const p2 = lows.find((item) => item.index > p1.index);
    const p3 = highs.at(-1)!;
    if (p2 && p3.index > p2.index && p3.price < p1.price - atrValue * 0.2 && p3.price > p2.price + atrValue * 0.2) {
      const broke = confirmBreak(close, p2.price, 'below', atrValue * 0.08);
      return pattern(
        '1-2-3 Reversal',
        'BEARISH',
        confirmStatus(broke, volumeOk),
        [
          `Point 1 high ${p1.price.toPrecision(6)}, point 2 low ${p2.price.toPrecision(6)}, lower point 3 ${p3.price.toPrecision(6)}`,
          volumeNote(broke, volumeOk, volumeRatio),
        ],
        `Invalid if price closes above point 3 ${p3.price.toPrecision(6)}`,
        { volumeConfirmed: broke && volumeOk, levels: { resistance: p3.price, support: p2.price, neckline: p2.price } },
      );
    }
  }
  return null;
}

function detectTrendlineBreak(candles: Candle[], swings: Swing[], atrValue: number, volumeRatio: number): DetectedPattern | null {
  const close = candles.at(-1)!.close;
  const lastIndex = candles.length - 1;
  const volumeOk = volumeRatio >= 1.2;
  const lows = lastOf(swings.filter((item) => item.type === 'low'), 4);
  const highs = lastOf(swings.filter((item) => item.type === 'high'), 4);
  if (lows.length >= 3) {
    const pts = lows.map((item) => ({ x: item.index, y: item.price }));
    const slope = linearSlope(pts);
    if (slope != null && slope > atrValue * 0.008) {
      const line = lineValue(pts[0], slope, lastIndex);
      const broke = confirmBreak(close, line, 'below', atrValue * 0.08);
      if (broke) {
        return pattern(
          'Trendline Break',
          'BEARISH',
          confirmStatus(true, volumeOk),
          [
            `Rising support trendline near ${line.toPrecision(6)}`,
            volumeNote(true, volumeOk, volumeRatio),
          ],
          `Invalid if price closes back above ${line.toPrecision(6)}`,
          { volumeConfirmed: volumeOk, levels: { support: line, neckline: line } },
        );
      }
    }
  }
  if (highs.length >= 3) {
    const pts = highs.map((item) => ({ x: item.index, y: item.price }));
    const slope = linearSlope(pts);
    if (slope != null && slope < -atrValue * 0.008) {
      const line = lineValue(pts[0], slope, lastIndex);
      const broke = confirmBreak(close, line, 'above', atrValue * 0.08);
      if (broke) {
        return pattern(
          'Trendline Break',
          'BULLISH',
          confirmStatus(true, volumeOk),
          [
            `Falling resistance trendline near ${line.toPrecision(6)}`,
            volumeNote(true, volumeOk, volumeRatio),
          ],
          `Invalid if price closes back below ${line.toPrecision(6)}`,
          { volumeConfirmed: volumeOk, levels: { resistance: line, neckline: line } },
        );
      }
    }
  }
  return null;
}

export function detectPatterns(candles: Candle[], atrValue: number | null): DetectedPattern[] {
  if (candles.length < 30) return [];
  const atrSafe = atrOrFallback(candles, atrValue);
  const volumeRatio = relativeVolume(candles);
  const swings = findSwings(candles, candles.length > 80 ? 4 : 3);
  const found = [
    detectHeadShoulders(candles, swings, atrSafe, volumeRatio),
    detectTriple(candles, swings, atrSafe, volumeRatio),
    detectDouble(candles, swings, atrSafe, volumeRatio),
    detectCupAndHandle(candles, atrSafe, volumeRatio),
    detectFlagOrPennant(candles, atrSafe, volumeRatio),
    detectTriangleWedgeChannel(candles, swings, atrSafe, volumeRatio),
    detectRectangle(candles, swings, atrSafe, volumeRatio),
    detect123(candles, swings, atrSafe, volumeRatio),
  ].filter((item): item is DetectedPattern => item != null);

  if (!found.some((item) => item.status === 'CONFIRMED')) {
    const trendline = detectTrendlineBreak(candles, swings, atrSafe, volumeRatio);
    if (trendline) found.push(trendline);
  }

  const rank = (item: DetectedPattern) => (item.status === 'CONFIRMED' ? 2 : item.status === 'FORMING' ? 1 : 0);
  found.sort((a, b) => rank(b) - rank(a));
  const unique: DetectedPattern[] = [];
  for (const item of found) {
    if (!unique.some((row) => row.name === item.name)) unique.push(item);
  }
  return unique.slice(0, 4);
}

export function structureSnapshot(candles: Candle[]) {
  const swings = findSwings(candles, 3);
  const last = candles.at(-1);
  return marketStructure(swings, last?.close ?? 0);
}
