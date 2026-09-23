import type { PatternName } from './types';

export type PatternRole = 'SIGNAL' | 'EDUCATIONAL';

export type PatternCatalogEntry = {
  name: PatternName;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'EITHER';
  role: PatternRole;
  family: 'reversal' | 'continuation' | 'range' | 'breakout';
  detector: 'implemented' | 'unsupported';
  reason: string;
};

export const PATTERN_CATALOG: PatternCatalogEntry[] = [
  { name: 'Head and Shoulders', bias: 'BEARISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Three swing highs with a higher head and a neckline close.' },
  { name: 'Inverse Head and Shoulders', bias: 'BULLISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Three swing lows with a lower head and a neckline close.' },
  { name: 'Double Top', bias: 'BEARISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Two similar swing highs and a neckline close.' },
  { name: 'Double Bottom', bias: 'BULLISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Two similar swing lows and a neckline close.' },
  { name: 'Triple Top', bias: 'BEARISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Three similar swing highs and a close below the intervening lows.' },
  { name: 'Triple Bottom', bias: 'BULLISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Three similar swing lows and a close above the intervening highs.' },
  { name: 'Cup and Handle', bias: 'BULLISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'U-shaped base plus a shallow handle, confirmed on a close above the rim.' },
  { name: 'Ascending Triangle', bias: 'BULLISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Flat resistance with rising lows.' },
  { name: 'Descending Triangle', bias: 'BEARISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Flat support with falling highs.' },
  { name: 'Symmetrical Triangle', bias: 'NEUTRAL', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Contracting highs and lows. Bias waits for the close outside.' },
  { name: 'Rising Wedge', bias: 'BEARISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Rising, converging swing highs and lows.' },
  { name: 'Falling Wedge', bias: 'BULLISH', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Falling, converging swing highs and lows.' },
  { name: 'Bull Flag', bias: 'BULLISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Impulse pole plus a counter-trend parallel flag.' },
  { name: 'Bear Flag', bias: 'BEARISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Impulse pole plus a counter-trend parallel flag.' },
  { name: 'Bull Pennant', bias: 'BULLISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Impulse pole plus a converging pennant.' },
  { name: 'Bear Pennant', bias: 'BEARISH', role: 'SIGNAL', family: 'continuation', detector: 'implemented', reason: 'Impulse pole plus a converging pennant.' },
  { name: 'Rectangle', bias: 'NEUTRAL', role: 'SIGNAL', family: 'range', detector: 'implemented', reason: 'Flat swing highs and lows. Bias waits for a close outside.' },
  { name: 'Ascending Channel', bias: 'NEUTRAL', role: 'SIGNAL', family: 'range', detector: 'implemented', reason: 'Parallel rising swing highs and lows.' },
  { name: 'Descending Channel', bias: 'NEUTRAL', role: 'SIGNAL', family: 'range', detector: 'implemented', reason: 'Parallel falling swing highs and lows.' },
  { name: 'Broadening Formation', bias: 'NEUTRAL', role: 'SIGNAL', family: 'range', detector: 'implemented', reason: 'Rising highs and falling lows. Not a directional trade until a close outside.' },
  { name: '1-2-3 Reversal', bias: 'EITHER', role: 'SIGNAL', family: 'reversal', detector: 'implemented', reason: 'Three-swing reversal with a close through point 2.' },
  { name: 'Trendline Break', bias: 'EITHER', role: 'SIGNAL', family: 'breakout', detector: 'implemented', reason: 'Close through a fitted swing trendline with volume.' },
  { name: 'Rounding Top', bias: 'BEARISH', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Curvature is too subjective on crypto OHLC to publish as a signal.' },
  { name: 'Rounding Bottom', bias: 'BULLISH', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Curvature is too subjective on crypto OHLC to publish as a signal.' },
  { name: 'Inverse Cup and Handle', bias: 'BEARISH', role: 'EDUCATIONAL', family: 'continuation', detector: 'unsupported', reason: 'Rare, noisy, and easy to overfit on 15-coin futures data.' },
  { name: 'Diamond Top', bias: 'BEARISH', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Expand-then-contract geometry is too ambiguous for reliable detection.' },
  { name: 'Diamond Bottom', bias: 'BULLISH', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Expand-then-contract geometry is too ambiguous for reliable detection.' },
  { name: 'Island Reversal', bias: 'EITHER', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Needs persistent gaps. USDT-M crypto futures rarely gap on closed candles.' },
  { name: 'Bump and Run Reversal', bias: 'EITHER', role: 'EDUCATIONAL', family: 'reversal', detector: 'unsupported', reason: 'Needs a long lead-in trend and discretionary bump slope.' },
];

export const SIGNAL_PATTERN_NAMES = PATTERN_CATALOG.filter((item) => item.role === 'SIGNAL').map((item) => item.name);
export const EDUCATIONAL_PATTERN_NAMES = PATTERN_CATALOG.filter((item) => item.role === 'EDUCATIONAL').map((item) => item.name);

export function isEducationalPattern(name: PatternName) {
  return EDUCATIONAL_PATTERN_NAMES.includes(name);
}
