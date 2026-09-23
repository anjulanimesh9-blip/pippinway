export const SCAN_SYMBOLS = [
  'BTCUSDT',
  'BNBUSDT',
  'ETHUSDT',
  'BCHUSDT',
  'XRPUSDT',
  'LTCUSDT',
  'TRXUSDT',
  'ETCUSDT',
  'LINKUSDT',
  'XLMUSDT',
  'ADAUSDT',
  'XMRUSDT',
  'DASHUSDT',
  'ZECUSDT',
  'XTZUSDT',
] as const;

export const SCAN_INTERVALS = ['1m', '5m', '15m', '1h', '4h'] as const;
export const LEGACY_INTERVALS = ['5m', '15m', '1h', '4h', '1d'] as const;
export const ALL_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

export type MarginMode = 'ISOLATED' | 'CROSS';
export type LiquidationRisk = 'OK' | 'BEFORE_STOP' | 'UNKNOWN' | 'UNAVAILABLE';

export const DEFAULT_SETTINGS = {
  venue: 'Binance USDT-M Futures',
  mode: 'MANUAL' as const,
  leverage: 20,
  marginUSDT: 1,
  marginMode: 'ISOLATED' as MarginMode,
  takerFeeRate: 0.0005,
  autoExecute: false,
};

export type UserTradeSettings = {
  marginUSDT: number;
  leverage: number;
  marginMode: MarginMode;
  takerFeeRate?: number;
};

export type ScanSymbol = string;
export const SCAN_MODES = ['15', '50', '100', 'all', 'custom'] as const;
export type ScanMode = (typeof SCAN_MODES)[number];
export type ScanState = 'ready' | 'pending' | 'failed' | 'skipped' | 'timeout';
export const SYMBOL_PATTERN = /^[A-Z0-9]{5,20}$/;
export function isValidSymbol(symbol: string): boolean {
  return SYMBOL_PATTERN.test(symbol);
}
export type ScanInterval = (typeof SCAN_INTERVALS)[number];
export type AllowedInterval = (typeof ALL_INTERVALS)[number];
export type Direction = 'LONG' | 'SHORT' | 'WAIT';
export type SignalLifecycleStatus =
  | 'WAITING_FOR_ENTRY'
  | 'TRIGGERED'
  | 'ACTIVE'
  | 'TARGET_HIT'
  | 'STOP_HIT'
  | 'EXPIRED'
  | 'INVALIDATED'
  | 'MISSED_ENTRY';

export type SignalLifecycle = {
  status: SignalLifecycleStatus;
  fillConfirmed: false;
  observedTrigger: boolean;
  seenAwayFromEntry: boolean;
  originalEntry: number;
  openedAt: string;
  expiresAt: string;
  lastCandleCloseAt: string | null;
  triggerObservedAt: string | null;
  closedAt: string | null;
  note: string;
  nextStep: string;
};
export type Trend = 'BULLISH' | 'BEARISH' | 'MIXED';
export type PatternStatus = 'FORMING' | 'CONFIRMED' | 'UNCONFIRMED' | 'INVALIDATED' | 'UNAVAILABLE';
export type PatternName =
  | 'Double Top'
  | 'Double Bottom'
  | 'Triple Top'
  | 'Triple Bottom'
  | 'Head and Shoulders'
  | 'Inverse Head and Shoulders'
  | 'Bull Flag'
  | 'Bear Flag'
  | 'Bull Pennant'
  | 'Bear Pennant'
  | 'Ascending Triangle'
  | 'Descending Triangle'
  | 'Symmetrical Triangle'
  | 'Rising Wedge'
  | 'Falling Wedge'
  | 'Ascending Channel'
  | 'Descending Channel'
  | 'Rectangle'
  | 'Broadening Formation'
  | 'Cup and Handle'
  | '1-2-3 Reversal'
  | 'Trendline Break'
  | 'Rounding Top'
  | 'Rounding Bottom'
  | 'Inverse Cup and Handle'
  | 'Diamond Top'
  | 'Diamond Bottom'
  | 'Island Reversal'
  | 'Bump and Run Reversal'
  | 'None';

export type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closed: boolean;
};

export type SymbolFilters = {
  symbol: string;
  status: string;
  contractType: string;
  tickSize: number;
  stepSize: number;
  minQty: number;
  minNotional: number;
  available: boolean;
  reason?: string;
  maintMarginRatio?: number;
  pricePrecision?: number;
};

export type DetectedPattern = {
  name: PatternName;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  status: PatternStatus;
  evidence: string[];
  invalidation: string;
  volumeConfirmed?: boolean;
  educational?: boolean;
  levels?: {
    support?: number;
    resistance?: number;
    neckline?: number;
  };
};

export type MacdPoint = {
  macd: number;
  signal: number;
  histogram: number;
};

export type TimeframeVote = 'SUPPORT' | 'CONTRADICT' | 'NEUTRAL' | 'UNAVAILABLE';
export type QualityLabel = 'CONFIRMED SETUP' | 'DEVELOPING SETUP' | 'CONFLICTING EVIDENCE' | 'INSUFFICIENT DATA';

export type MarketContext = {
  btcAvailable: boolean;
  btcTrend: Trend | null;
  correlationToBtc: number | null;
  fundingRate: number | null;
  openInterest: number | null;
  markPrice: number | null;
  estimatedSpreadBps: number | null;
  estimatedSlippageBps: number | null;
  volumeRatio: number | null;
  notes: string[];
};

export type SignalQuality = {
  label: QualityLabel;
  engineVersion: string;
  supporting: string[];
  contradictory: string[];
  timeframeVotes: Array<{ interval: string; vote: TimeframeVote; note: string }>;
  patternConfirmation: PatternStatus;
  entryConditions: string;
  invalidationConditions: string;
  dataFreshness: 'FRESH' | 'STALE' | 'MISSING';
  executionEligible: boolean;
  context?: MarketContext;
};

export type TimeframeSnapshot = {
  interval: string;
  lastClosedAt: string;
  price: number;
  trend: Trend;
  structure: string;
  ema9: number;
  ema21: number;
  ema50: number | null;
  ema200: number | null;
  rsi: number | null;
  macd: MacdPoint | null;
  atr: number | null;
  volumeRatio: number;
  volumeAnomaly: boolean;
  rsiDivergence: 'BULLISH' | 'BEARISH' | 'NONE';
  candleConfirm: 'BULLISH' | 'BEARISH' | 'NONE';
  retest: 'HELD' | 'FAILED' | 'NONE';
  support: number;
  resistance: number;
  breakout: 'UP' | 'DOWN' | 'NONE';
  patterns: DetectedPattern[];
};

export type TradeSetup = {
  direction?: 'LONG' | 'SHORT';
  executable: boolean;
  executableReason: string;
  validationReasons: string[];
  ineligibleReason?: string;
  marginUSDT: number;
  allocatedMarginUSDT: number;
  requiredMarginUSDT: number;
  leverage: number;
  marginMode: MarginMode;
  notionalUSDT: number;
  quantity: number;
  entry: number;
  stop: number;
  target: number;
  riskReward: number;
  grossRiskReward: number;
  netRiskReward: number;
  estimatedProfitUSDT: number;
  estimatedLossUSDT: number;
  estimatedFeesUSDT: number;
  entryFeeUSDT: number;
  exitFeeUSDT: number;
  totalFeesUSDT: number;
  grossProfitUSDT: number;
  grossLossUSDT: number;
  netProfitUSDT: number;
  netLossUSDT: number;
  tickSize: number;
  stepSize: number;
  minNotional: number;
  minQty: number;
  pricePrecision?: number;
  maintMarginRatio?: number;
  liquidationEstimateUSDT: number | null;
  liquidationRisk: LiquidationRisk;
  liquidationNote: string;
};

export type CoinScan = {
  symbol: string;
  available: boolean;
  unavailableReason?: string;
  price: number | null;
  changePct?: number | null;
  quoteVolume?: number | null;
  priceUpdatedAt: string | null;
  stale: boolean;
  error?: string;
  trend: Trend;
  direction: Direction;
  pattern: string;
  patternStatus: PatternStatus;
  timeframes: TimeframeSnapshot[];
  filters?: SymbolFilters;
  setup: TradeSetup | null;
  entryConditions: string;
  reason: string;
  nextStep: string;
  lastCandleCloseAt: string | null;
  analyzedAt: string;
  originalEntry?: number;
  lifecycle?: SignalLifecycle;
  quality?: SignalQuality;
  context?: MarketContext | null;
  scanState?: ScanState;
  locked?: boolean;
};

export type ScannerUniverse = {
  mode: ScanMode;
  eligible: number;
  selected: number;
  listedAt: string;
};

export type ScannerProgress = {
  scanned: number;
  failed: number;
  skipped: number;
  pending: number;
  timedOut: number;
  running: boolean;
  updatedAt: string;
  failedReasons: Record<string, number>;
  fresh?: number;
  stale?: number;
  neverScanned?: number;
  queueBacklog?: number;
};

export type ScannerCounts = {
  long: number;
  short: number;
  wait: number;
  invalid: number;
  expired: number;
  pending: number;
};

export type ScannerHealth = {
  priceFeed: 'ok' | 'stale' | 'error';
  analysisFeed: 'ok' | 'stale' | 'error';
  lastScanAt: string | null;
  lastPriceAt: string | null;
  monitoring: 'running' | 'idle' | 'error';
  lastCycleAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseAt?: string | null;
  lastFullUniverseDurationMs?: number | null;
  requestWeightUsed?: number | null;
  requestWeightLimit?: number;
  queueBacklog?: number;
  workerStatus?: 'running' | 'idle' | 'error' | 'offline' | 'overlapping';
  freshCount?: number;
  staleCount?: number;
  failedCount?: number;
  pendingCount?: number;
  neverScannedCount?: number;
  coverageNote?: string;
  /** Sanitized last Binance failure that opened/fed the circuit breaker. Never includes secrets. */
  lastBinanceStatus?: number | null;
  lastBinanceKind?: string | null;
  lastBinanceReason?: string | null;
  lastBinancePath?: string | null;
  binanceCircuitOpen?: boolean;
};

export type ScannerResponse = {
  settings: typeof DEFAULT_SETTINGS;
  fetchedAt: string;
  pricesUpdatedAt: string;
  stale: boolean;
  error?: string;
  warnings: string[];
  coins: CoinScan[];
  universe?: ScannerUniverse;
  progress?: ScannerProgress;
  counts?: ScannerCounts;
  health?: ScannerHealth;
};

export type SignalRecord = {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  pattern: string;
  patternStatus: PatternStatus;
  interval: string;
  entry: number;
  stop: number;
  target: number;
  entryConditions: string;
  openedAt: string;
  source: 'live' | 'backtest';
  outcome: 'OPEN' | 'WIN' | 'LOSS' | 'EXPIRED' | 'AMBIGUOUS';
  closedAt: string | null;
  exitPrice: number | null;
  pnlUSDT: number | null;
  marginUSDT?: number;
  leverage?: number;
  marginMode?: MarginMode;
  quantity?: number;
  notionalUSDT?: number;
  requiredMarginUSDT?: number;
  totalFeesUSDT?: number;
  stepSize?: number;
  tickSize?: number;
  pricePrecision?: number;
  executable?: boolean;
  netProfitUSDT?: number;
  netLossUSDT?: number;
  snapshotPreserved?: boolean;
  lifecycleStatus?: SignalLifecycleStatus;
  fillConfirmed?: boolean;
  originalEntry?: number;
};

export type AccuracyStats = {
  sampleSize: number;
  closedSample: number;
  wins: number;
  losses: number;
  expired: number;
  open: number;
  winRate: number | null;
  profitFactor: number | null;
  maxDrawdownUSDT: number | null;
  netPnlUSDT: number;
  note: string;
};

export type HistoryResponse = {
  live: SignalRecord[];
  liveStats: AccuracyStats;
  backtestStats: AccuracyStats;
  backtestSampleNote: string;
  updatedAt: string;
};
