import { getOfficialStore, persistReconcile, publishedFromOfficial } from '@/lib/signals/official-store';
import { candlesAreStale, getExchangeFilters, getOpenInterest, getPremiumIndex, getTicker24hrAll, getTickers, mapPool } from './binance';
import { getCandlesIncremental, needsTimeframeRefresh, restoreCandleCloses, serializeCandleCloses } from './candle-cache';
import { buildMarketContext } from './context';
import { freshnessCounts, prioritizeSymbols, symbolNeedsAnalysis } from './freshness';
import { recordLiveSignals } from './history';
import { reconcilePublishedSignal, type PublishedSignal } from './lifecycle';
import { weightSnapshot } from './rate-limit';
import { analyzeTimeframe, buildCoinScan } from './signals';
import {
  DEFAULT_SETTINGS,
  SCAN_INTERVALS,
  SCAN_SYMBOLS,
  type CoinScan,
  type ScanMode,
  type ScannerResponse,
  type SymbolFilters,
  type TimeframeSnapshot,
} from './types';
import { loadScanJob, restoreCoins, saveScanJob } from './scan-job-persist';
import { DEFAULT_LIVE_SCAN_MODE, jobFingerprint, parseScanMode, resolveUniverse, scannerCounts } from './universe';
import { selectNearSetups } from './near-setups';

const published = new Map<string, PublishedSignal>();
let hydrated = false;

async function hydratePublished() {
  if (hydrated) return;
  const active = await getOfficialStore().listActive();
  for (const record of active) {
    published.set(record.symbol, publishedFromOfficial(record));
  }
  hydrated = true;
}

export function resetPublishedCache() {
  published.clear();
  hydrated = false;
}

async function attachLifecycle(coin: CoinScan): Promise<CoinScan> {
  await hydratePublished();
  const previous = published.get(coin.symbol) || null;
  const result = reconcilePublishedSignal(coin, previous);
  if (result.published) {
    published.set(coin.symbol, result.published);
    await persistReconcile(result.coin, result.published, previous?.lifecycle.status);
  } else {
    published.delete(coin.symbol);
  }
  return result.coin;
}

const SCAN_CONCURRENCY = 5;
const INLINE_LIMIT = 15;
const BACKGROUND_BATCH = 10;
const BACKGROUND_MS = 10_000;
const ANALYZE_TIMEOUT_MS = 25_000;
const CYCLE_ANALYZE_BUDGET = 50;

type AnalysisHit = { coin: CoinScan; at: number };
const analysisCache = new Map<string, AnalysisHit>();

type ScanJob = {
  mode: ScanMode;
  symbols: string[];
  eligible: number;
  listedAt: string;
  cursor: number;
  generation: number;
  running: boolean;
  coins: Map<string, CoinScan>;
  failedReasons: Record<string, number>;
  updatedAt: string;
  lastScanAt: string | null;
  lastPriceAt: string | null;
  priceFeed: 'ok' | 'stale' | 'error';
  analysisFeed: 'ok' | 'stale' | 'error';
  lastCycleAt: string | null;
  lastCycleDurationMs: number | null;
  lastFullUniverseAt: string | null;
  lastFullUniverseDurationMs: number | null;
  lastFullUniverseStartedAt: number | null;
  queueBacklog: number;
  cycleOverlapsBlocked: number;
};

const g = globalThis as typeof globalThis & {
  __pippinwayScanJob?: ScanJob;
  __pippinwayScanLoop?: ReturnType<typeof setInterval>;
};

export type ScanOptions = {
  mode?: ScanMode | string | null;
  custom?: string[];
  force?: boolean;
  backgroundLoop?: boolean;
  inlineAnalyze?: boolean;
};

function emptyFilters(symbol: string, reason: string): SymbolFilters {
  return {
    symbol,
    status: 'UNKNOWN',
    contractType: '',
    tickSize: 0,
    stepSize: 0,
    minQty: 0,
    minNotional: 0,
    available: false,
    reason,
  };
}

function tagState(coin: CoinScan): CoinScan {
  if (coin.scanState) return coin;
  if (!coin.available || coin.error) return { ...coin, scanState: coin.available ? 'failed' : 'skipped' };
  return { ...coin, scanState: 'ready' };
}

function pendingCoin(symbol: string, filters: SymbolFilters, price: number | undefined, fetchedAt: string, quoteVolume?: number, changePct?: number): CoinScan {
  return {
    ...buildCoinScan({
      symbol,
      filters: filters.available ? filters : emptyFilters(symbol, filters.reason || 'Queued'),
      snapshots: [],
      livePrice: price ?? null,
      priceUpdatedAt: price != null ? fetchedAt : null,
      stale: false,
    }),
    available: true,
    pattern: 'Queued',
    patternStatus: 'UNAVAILABLE',
    direction: 'WAIT',
    reason: 'Queued for the same validated engine. This is not a published setup.',
    nextStep: 'Wait for the background scanner. WAIT stays valid; no LONG or SHORT is forced.',
    scanState: 'pending',
    analyzedAt: '',
    quoteVolume: quoteVolume ?? null,
    changePct: changePct ?? null,
  };
}

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function getJob(): ScanJob | undefined {
  return g.__pippinwayScanJob;
}

function setJob(job: ScanJob) {
  g.__pippinwayScanJob = job;
}

export function publicMonitorHealth() {
  const job = getJob();
  const weight = weightSnapshot();
  const monitorOn = Boolean((globalThis as typeof globalThis & { __pippinwaySignalsMonitor?: unknown }).__pippinwaySignalsMonitor);
  return {
    lastCycleAt: job?.lastCycleAt ?? null,
    lastPriceAt: job?.lastPriceAt ?? null,
    lastScanAt: job?.lastScanAt ?? null,
    lastCycleDurationMs: job?.lastCycleDurationMs ?? null,
    lastFullUniverseAt: job?.lastFullUniverseAt ?? null,
    lastFullUniverseDurationMs: job?.lastFullUniverseDurationMs ?? null,
    queueBacklog: job?.queueBacklog ?? null,
    workerStatus: monitorOn ? 'running' : job?.lastCycleAt ? 'idle' : 'offline',
    monitoring: monitorOn ? 'running' : job?.lastCycleAt ? 'idle' : 'offline',
    coverageNote: job?.lastFullUniverseAt
      ? null
      : job?.lastCycleAt
        ? 'A monitoring cycle was recorded, but the persistent 60-second worker is not running on this process.'
        : 'No completed monitoring cycle has been recorded on this process yet.',
    lastBinanceStatus: weight.lastFailure?.status ?? null,
    lastBinanceKind: weight.lastFailure?.kind ?? null,
    lastBinanceReason: weight.lastFailure?.reason ?? null,
    lastBinancePath: weight.lastFailure?.path ?? null,
    binanceCircuitOpen: weight.circuitOpen,
  };
}

export function activeScanSymbols(): string[] {
  return getJob()?.symbols?.length ? getJob()!.symbols : [...SCAN_SYMBOLS];
}

let btcCache: { snapshots: TimeframeSnapshot[]; closes: number[]; expires: number } | null = null;

async function loadBtcContext(): Promise<{ snapshots: TimeframeSnapshot[]; closes: number[] }> {
  if (btcCache && btcCache.expires > Date.now()) return btcCache;
  const snapshots: TimeframeSnapshot[] = [];
  let closes: number[] = [];
  await mapPool(['1h', '4h'] as const, 2, async (interval) => {
    try {
      const candles = await getCandlesIncremental('BTCUSDT', interval, 120);
      const snapshot = analyzeTimeframe(candles, interval);
      snapshots.push(snapshot);
      if (interval === '1h') closes = candles.filter((item) => item.closed).map((item) => item.close);
    } catch {
      // BTC context stays unavailable rather than invented.
    }
  });
  btcCache = { snapshots, closes, expires: Date.now() + 60_000 };
  return btcCache;
}

async function analyzeSymbol(
  symbol: string,
  filters: Awaited<ReturnType<typeof getExchangeFilters>> extends Map<string, infer V> ? V : never,
  livePrice: number | undefined,
  priceUpdatedAt: string,
  extras?: {
    fundingRate?: number | null;
    markPrice?: number | null;
    btcSnapshots?: TimeframeSnapshot[];
    btcCloses?: number[];
  },
  force = false,
): Promise<CoinScan> {
  if (!filters.available) {
    return await attachLifecycle(buildCoinScan({
      symbol,
      filters,
      snapshots: [],
      livePrice: null,
      priceUpdatedAt,
      stale: false,
    }));
  }
  if (livePrice == null) {
    return await attachLifecycle(buildCoinScan({
      symbol,
      filters,
      snapshots: [],
      livePrice: null,
      priceUpdatedAt,
      stale: true,
      error: 'Ticker price unavailable from Binance',
    }));
  }

  const snapshots: TimeframeSnapshot[] = [];
  const errors: string[] = [];
  let stale = false;
  let hourlyCloses: number[] = [];
  const previous = analysisCache.get(symbol)?.coin;
  await mapPool([...SCAN_INTERVALS], 2, async (interval) => {
    try {
      const reused = previous?.timeframes.find((item) => item.interval === interval);
      if (!force && reused && !needsTimeframeRefresh(symbol, interval)) {
        snapshots.push(reused);
        return;
      }
      const candles = await getCandlesIncremental(symbol, interval, 250);
      snapshots.push(analyzeTimeframe(candles, interval));
      if (interval === '1h') hourlyCloses = candles.filter((item) => item.closed).map((item) => item.close);
      if (candlesAreStale(candles, interval)) stale = true;
    } catch (error) {
      errors.push(`${interval}: ${error instanceof Error ? error.message : 'kline error'}`);
    }
  });
  snapshots.sort((a, b) => SCAN_INTERVALS.indexOf(a.interval as (typeof SCAN_INTERVALS)[number]) - SCAN_INTERVALS.indexOf(b.interval as (typeof SCAN_INTERVALS)[number]));

  const mid = snapshots.find((item) => item.interval === '15m') || snapshots.at(-1);
  let openInterest: number | null = null;
  try {
    openInterest = await getOpenInterest(symbol);
  } catch {
    openInterest = null;
  }
  const context = buildMarketContext({
    symbol,
    livePrice,
    markPrice: extras?.markPrice ?? null,
    fundingRate: extras?.fundingRate ?? null,
    openInterest,
    atr: mid?.atr ?? null,
    volumeRatio: mid?.volumeRatio ?? null,
    btcSnapshots: extras?.btcSnapshots,
    symbolCloses: hourlyCloses,
    btcCloses: extras?.btcCloses,
  });

  return await attachLifecycle(buildCoinScan({
    symbol,
    filters,
    snapshots,
    livePrice,
    priceUpdatedAt,
    stale,
    error: snapshots.length ? undefined : errors.join('; ') || 'No usable candles',
    context,
  }));
}

async function analyzeCached(
  symbol: string,
  filters: SymbolFilters,
  livePrice: number | undefined,
  priceUpdatedAt: string,
  extras: Parameters<typeof analyzeSymbol>[4],
  force: boolean,
  touchAnalyzedAt = false,
): Promise<CoinScan> {
  const hit = analysisCache.get(symbol);
  if (!force && hit && !symbolNeedsAnalysis(symbol, hit.coin, false) && !hit.coin.stale) {
    const cached = hit.coin;
    if (livePrice != null && cached.scanState === 'ready') {
      return attachLifecycle({
        ...cached,
        price: livePrice,
        priceUpdatedAt,
        changePct: cached.changePct,
        quoteVolume: cached.quoteVolume,
        analyzedAt: touchAnalyzedAt ? new Date().toISOString() : cached.analyzedAt,
      });
    }
    return touchAnalyzedAt ? { ...cached, analyzedAt: new Date().toISOString() } : cached;
  }
  const coin = tagState(await analyzeSymbol(symbol, filters, livePrice, priceUpdatedAt, extras, force));
  analysisCache.set(symbol, { coin, at: Date.now() });
  return coin;
}

function noteFailure(job: ScanJob, reason: string) {
  job.failedReasons[reason] = (job.failedReasons[reason] || 0) + 1;
}

function markFullPassIfComplete(job: ScanJob, now = Date.now()) {
  if (!job.symbols.length) return;
  const started = job.lastFullUniverseStartedAt || now;
  const complete = job.symbols.every((symbol) => {
    const coin = job.coins.get(symbol);
    if (!coin || coin.scanState === 'pending') return false;
    const analyzed = Date.parse(coin.analyzedAt || '') || 0;
    return analyzed >= started - 1000;
  });
  if (!complete) return;
  job.lastFullUniverseDurationMs = now - started;
  job.lastFullUniverseAt = new Date(now).toISOString();
  job.lastFullUniverseStartedAt = now;
}

export function recordCycleMetrics(input: {
  startedAt: string;
  durationMs: number;
  overlapsBlocked?: number;
  backlog?: number;
}) {
  const job = getJob();
  if (!job) return;
  job.lastCycleAt = input.startedAt;
  job.lastCycleDurationMs = input.durationMs;
  job.cycleOverlapsBlocked += input.overlapsBlocked || 0;
  if (input.backlog != null) job.queueBacklog = input.backlog;
  void saveScanJob({ ...job, lastCandleCloseBySymbolTf: serializeCandleCloses() }).catch(() => undefined);
}

export async function processCycleBatch(options: {
  force?: boolean;
  /** Visit every selected symbol once (cache-aware). Used for complete Top 50 analysis passes. */
  fullPass?: boolean;
  activeSymbols?: string[];
  budget?: number;
} = {}): Promise<{ analyzed: string[]; backlog: number; analysisDurationMs: number; priceUpdatedCount: number }> {
  const job = getJob();
  if (!job || job.running || !job.symbols.length) {
    return { analyzed: [], backlog: job?.queueBacklog || 0, analysisDurationMs: 0, priceUpdatedCount: 0 };
  }
  const generation = job.generation;
  const analysisStarted = Date.now();
  if (options.fullPass) {
    job.lastFullUniverseStartedAt = analysisStarted;
  }
  job.running = true;
  try {
    const prioritized = prioritizeSymbols({
      symbols: job.symbols,
      coins: job.coins,
      activeSymbols: options.activeSymbols,
      force: options.force || options.fullPass,
    });
    const queued = options.fullPass
      ? job.symbols
      : prioritized.slice(0, options.budget ?? CYCLE_ANALYZE_BUDGET);
    let priceUpdatedCount = 0;
    if (queued.length) {
      const beforePrices = new Map(
        queued.map((symbol) => [symbol, job.coins.get(symbol)?.price ?? null] as const),
      );
      await processSymbols(queued, options.force === true, generation, { touchAnalyzedAt: Boolean(options.fullPass) });
      const latest = getJob();
      if (latest) {
        for (const symbol of queued) {
          const next = latest.coins.get(symbol)?.price ?? null;
          if (next != null && next !== beforePrices.get(symbol)) priceUpdatedCount += 1;
        }
      }
    }
    const latest = getJob();
    if (latest && latest.generation === generation) {
      latest.queueBacklog = latest.symbols.filter((symbol) => symbolNeedsAnalysis(symbol, latest.coins.get(symbol), options.force)).length;
      if (options.fullPass) {
        const complete = latest.symbols.every((symbol) => {
          const coin = latest.coins.get(symbol);
          return Boolean(coin && coin.scanState && coin.scanState !== 'pending');
        });
        if (complete) {
          latest.lastFullUniverseDurationMs = Date.now() - analysisStarted;
          latest.lastFullUniverseAt = new Date().toISOString();
          latest.lastFullUniverseStartedAt = Date.now();
        }
      } else {
        markFullPassIfComplete(latest);
      }
      void saveScanJob({ ...latest, lastCandleCloseBySymbolTf: serializeCandleCloses() }).catch(() => undefined);
      return {
        analyzed: queued,
        backlog: latest.queueBacklog,
        analysisDurationMs: Date.now() - analysisStarted,
        priceUpdatedCount,
      };
    }
    return {
      analyzed: queued,
      backlog: queued.length,
      analysisDurationMs: Date.now() - analysisStarted,
      priceUpdatedCount,
    };
  } finally {
    const latest = getJob();
    if (latest && latest.generation === generation) latest.running = false;
  }
}

async function processSymbols(
  symbols: string[],
  force: boolean,
  generation: number,
  options: { touchAnalyzedAt?: boolean } = {},
): Promise<void> {
  const job = getJob();
  if (!job || !symbols.length || job.generation !== generation) return;
  const fetchedAt = new Date().toISOString();
  let filters = new Map<string, SymbolFilters>();
  let prices = new Map<string, number>();
  try {
    filters = await getExchangeFilters(symbols);
  } catch (error) {
    job.analysisFeed = 'error';
    job.updatedAt = fetchedAt;
    for (const symbol of symbols) {
      const coin = tagState(await attachLifecycle(buildCoinScan({
        symbol,
        filters: emptyFilters(symbol, 'Exchange information unavailable'),
        snapshots: [],
        livePrice: null,
        priceUpdatedAt: null,
        stale: true,
        error: error instanceof Error ? error.message : 'Exchange information unavailable',
      })));
      coin.scanState = 'failed';
      job.coins.set(symbol, coin);
      noteFailure(job, 'exchangeInfo');
    }
    return;
  }

  try {
    prices = await getTickers(symbols);
    job.priceFeed = 'ok';
    job.lastPriceAt = fetchedAt;
  } catch {
    job.priceFeed = 'error';
  }

  const [premium, btc, stats] = await Promise.all([
    getPremiumIndex(symbols).catch(() => new Map()),
    loadBtcContext().catch(() => ({ snapshots: [] as TimeframeSnapshot[], closes: [] as number[] })),
    getTicker24hrAll().catch(() => new Map()),
  ]);

  const analyzed = await mapPool(symbols, SCAN_CONCURRENCY, async (symbol) => {
    const symbolFilters = filters.get(symbol) || emptyFilters(symbol, 'Missing from exchange information');
    try {
      const prem = premium.get(symbol);
      const coin = await withTimeout(analyzeCached(symbol, symbolFilters, prices.get(symbol), fetchedAt, {
        fundingRate: prem?.lastFundingRate ?? null,
        markPrice: prem?.markPrice ?? null,
        btcSnapshots: btc.snapshots,
        btcCloses: btc.closes,
      }, force, options.touchAnalyzedAt === true), ANALYZE_TIMEOUT_MS, symbol);
      const row = stats.get(symbol);
      return {
        ...coin,
        quoteVolume: row?.quoteVolume ?? coin.quoteVolume ?? null,
        changePct: row?.changePct ?? coin.changePct ?? null,
      };
    } catch (error) {
      const timedOut = error instanceof Error && error.message.includes('timed out');
      noteFailure(job, timedOut ? 'timeout' : 'analyze');
      const failed = tagState(await attachLifecycle(buildCoinScan({
        symbol,
        filters: symbolFilters,
        snapshots: [],
        livePrice: prices.get(symbol) ?? null,
        priceUpdatedAt: fetchedAt,
        stale: true,
        error: error instanceof Error ? error.message : 'Scan failed',
      })));
      return { ...failed, scanState: timedOut ? 'timeout' as const : 'failed' as const };
    }
  });

  const latest = getJob();
  if (!latest || latest.generation !== generation) return;
  for (const coin of analyzed) {
    latest.coins.set(coin.symbol, coin);
    if (coin.scanState === 'failed') noteFailure(latest, coin.error || 'failed');
    if (coin.scanState === 'timeout') noteFailure(latest, 'timeout');
    if (coin.scanState === 'skipped') noteFailure(latest, coin.unavailableReason || 'unavailable');
  }
  latest.updatedAt = fetchedAt;
  latest.lastScanAt = fetchedAt;
  latest.analysisFeed = analyzed.some((coin) => coin.stale || coin.scanState === 'failed' || coin.scanState === 'timeout') ? 'stale' : 'ok';
  void recordLiveSignals(analyzed.filter((coin) => coin.scanState === 'ready' && !coin.stale)).catch(() => undefined);
  void saveScanJob(latest).catch(() => undefined);
}

function syncJob(selection: { mode: ScanMode; symbols: string[]; eligible: number; listedAt: string }) {
  const current = getJob();
  const same = current && jobFingerprint(current.mode, current.symbols) === jobFingerprint(selection.mode, selection.symbols);
  if (same && current) {
    current.eligible = selection.eligible;
    current.listedAt = selection.listedAt;
    return current;
  }
  const kept = new Map<string, CoinScan>();
  for (const symbol of selection.symbols) {
    const previous = current?.coins.get(symbol);
    if (previous && previous.scanState && previous.scanState !== 'pending') kept.set(symbol, previous);
  }
  const next: ScanJob = {
    mode: selection.mode,
    symbols: selection.symbols,
    eligible: selection.eligible,
    listedAt: selection.listedAt,
    cursor: 0,
    generation: (current?.generation || 0) + 1,
    running: false,
    coins: kept,
    failedReasons: {},
    updatedAt: new Date().toISOString(),
    lastScanAt: current?.lastScanAt ?? null,
    lastPriceAt: current?.lastPriceAt ?? null,
    priceFeed: current?.priceFeed ?? 'ok',
    analysisFeed: current?.analysisFeed ?? 'ok',
    lastCycleAt: current?.lastCycleAt ?? null,
    lastCycleDurationMs: current?.lastCycleDurationMs ?? null,
    lastFullUniverseAt: current?.lastFullUniverseAt ?? null,
    lastFullUniverseDurationMs: current?.lastFullUniverseDurationMs ?? null,
    lastFullUniverseStartedAt: current?.lastFullUniverseStartedAt ?? Date.now(),
    queueBacklog: current?.queueBacklog ?? 0,
    cycleOverlapsBlocked: current?.cycleOverlapsBlocked ?? 0,
  };
  setJob(next);
  return next;
}

/** Build a ScannerResponse from the in-process job without additional Binance calls. */
/** Refresh prices/24h stats on the in-memory board without re-running technical analysis. */
export async function refreshBoardPrices(): Promise<{ priceUpdatedCount: number; lastPriceAt: string | null }> {
  const job = getJob();
  if (!job?.symbols.length) return { priceUpdatedCount: 0, lastPriceAt: null };
  const fetchedAt = new Date().toISOString();
  let prices = new Map<string, number>();
  let stats = new Map<string, { changePct: number; quoteVolume: number }>();
  try {
    [prices, stats] = await Promise.all([
      getTickers(job.symbols),
      getTicker24hrAll().catch(() => new Map()),
    ]);
    job.priceFeed = 'ok';
    job.lastPriceAt = fetchedAt;
  } catch {
    job.priceFeed = 'error';
    return { priceUpdatedCount: 0, lastPriceAt: job.lastPriceAt };
  }
  let priceUpdatedCount = 0;
  for (const symbol of job.symbols) {
    const coin = job.coins.get(symbol);
    if (!coin) continue;
    const price = prices.get(symbol);
    const row = stats.get(symbol);
    const next = {
      ...coin,
      price: price ?? coin.price,
      priceUpdatedAt: price != null ? fetchedAt : coin.priceUpdatedAt,
      changePct: row?.changePct ?? coin.changePct ?? null,
      quoteVolume: row?.quoteVolume ?? coin.quoteVolume ?? null,
    };
    if (price != null && price !== coin.price) priceUpdatedCount += 1;
    job.coins.set(symbol, next);
  }
  job.updatedAt = fetchedAt;
  void saveScanJob({ ...job, lastCandleCloseBySymbolTf: serializeCandleCloses() }).catch(() => undefined);
  return { priceUpdatedCount, lastPriceAt: fetchedAt };
}

export function currentScannerResponse(warnings: string[] = [], error?: string): ScannerResponse | null {
  const job = getJob();
  if (!job || !job.symbols.length) return null;
  const prices = new Map<string, number>();
  const stats = new Map<string, { changePct: number; quoteVolume: number }>();
  for (const symbol of job.symbols) {
    const coin = job.coins.get(symbol);
    if (coin?.price != null) prices.set(symbol, coin.price);
    if (coin && (coin.changePct != null || coin.quoteVolume != null)) {
      stats.set(symbol, { changePct: coin.changePct ?? 0, quoteVolume: coin.quoteVolume ?? 0 });
    }
  }
  return snapshotFromJob(job, prices, stats, warnings, error);
}

function snapshotFromJob(job: ScanJob, prices: Map<string, number>, stats: Map<string, { changePct: number; quoteVolume: number }>, warnings: string[], error?: string): ScannerResponse {
  const fetchedAt = new Date().toISOString();
  const coins = job.symbols.map((symbol) => {
    const analyzed = job.coins.get(symbol);
    const row = stats.get(symbol);
    const price = prices.get(symbol);
    if (analyzed && analyzed.scanState !== 'pending') {
      return {
        ...analyzed,
        price: price ?? analyzed.price,
        priceUpdatedAt: price != null ? fetchedAt : analyzed.priceUpdatedAt,
        changePct: row?.changePct ?? analyzed.changePct ?? null,
        quoteVolume: row?.quoteVolume ?? analyzed.quoteVolume ?? null,
      };
    }
    return pendingCoin(symbol, emptyFilters(symbol, 'Queued'), price, fetchedAt, row?.quoteVolume, row?.changePct);
  });
  const ready = coins.filter((coin) => coin.scanState === 'ready').length;
  const failed = coins.filter((coin) => coin.scanState === 'failed').length;
  const skipped = coins.filter((coin) => coin.scanState === 'skipped').length;
  const pending = coins.filter((coin) => coin.scanState === 'pending').length;
  const timedOut = coins.filter((coin) => coin.scanState === 'timeout').length;
  const freshness = freshnessCounts(coins);
  const weight = weightSnapshot();
  const selected = job.symbols.length;
  const analyzedCount = coins.filter((coin) => coin.scanState && coin.scanState !== 'pending').length;
  const coverageNote = pending > 0 || analyzedCount < selected
    ? `Coverage is incomplete — ${analyzedCount}/${selected} selected coins have completed analysis.`
    : `Top ${selected} analysis complete — ${analyzedCount}/${selected} analyzed.`;
  return {
    settings: DEFAULT_SETTINGS,
    fetchedAt,
    pricesUpdatedAt: job.lastPriceAt || fetchedAt,
    stale: coins.some((coin) => coin.stale) || job.priceFeed !== 'ok',
    error,
    warnings,
    coins,
    universe: { mode: job.mode, eligible: job.eligible, selected: job.symbols.length, listedAt: job.listedAt },
    progress: {
      scanned: ready,
      failed,
      skipped,
      pending,
      timedOut,
      running: job.running,
      updatedAt: job.updatedAt,
      failedReasons: job.failedReasons,
      fresh: freshness.fresh,
      stale: freshness.stale,
      neverScanned: freshness.never_scanned,
      queueBacklog: job.queueBacklog,
    },
    counts: scannerCounts(coins),
    nearSetups: selectNearSetups(coins),
    health: {
      priceFeed: job.priceFeed,
      analysisFeed: job.analysisFeed,
      lastScanAt: job.lastScanAt,
      lastPriceAt: job.lastPriceAt,
      monitoring: g.__pippinwayScanLoop ? 'running' : 'idle',
      lastCycleAt: job.lastCycleAt,
      lastCycleDurationMs: job.lastCycleDurationMs,
      lastFullUniverseAt: job.lastFullUniverseAt,
      lastFullUniverseDurationMs: job.lastFullUniverseDurationMs,
      requestWeightUsed: weight.used,
      requestWeightLimit: weight.limit,
      queueBacklog: job.queueBacklog,
      workerStatus: g.__pippinwayScanLoop ? 'running' : 'idle',
      freshCount: freshness.fresh,
      staleCount: freshness.stale,
      failedCount: freshness.failed,
      pendingCount: freshness.never_scanned + pending,
      neverScannedCount: freshness.never_scanned,
      selectedCount: selected,
      analyzedCount,
      coverageNote,
      lastBinanceStatus: weight.lastFailure?.status ?? null,
      lastBinanceKind: weight.lastFailure?.kind ?? null,
      lastBinanceReason: weight.lastFailure?.reason ?? null,
      lastBinancePath: weight.lastFailure?.path ?? null,
      binanceCircuitOpen: weight.circuitOpen,
    },
  };
}

export async function continueBackgroundScan(force = false): Promise<void> {
  const job = getJob();
  if (!job || job.running || !job.symbols.length) return;
  const generation = job.generation;
  job.running = true;
  try {
    const start = job.cursor % job.symbols.length;
    const rotated = [...job.symbols.slice(start), ...job.symbols.slice(0, start)];
    const queued = prioritizeSymbols({ symbols: rotated, coins: job.coins, force }).slice(0, BACKGROUND_BATCH);
    const next = queued.length ? queued : rotated.slice(0, BACKGROUND_BATCH);
    await processSymbols(next, force, generation);
    const latest = getJob();
    if (latest && latest.generation === generation) {
      latest.cursor = (start + next.length) % Math.max(1, latest.symbols.length);
      latest.queueBacklog = latest.symbols.filter((symbol) => symbolNeedsAnalysis(symbol, latest.coins.get(symbol), force)).length;
      markFullPassIfComplete(latest);
      void saveScanJob({ ...latest, lastCandleCloseBySymbolTf: serializeCandleCloses() }).catch(() => undefined);
    }
  } finally {
    const latest = getJob();
    if (latest && latest.generation === generation) latest.running = false;
  }
}

export function startBackgroundScanLoop() {
  if (g.__pippinwayScanLoop) return;
  g.__pippinwayScanLoop = setInterval(() => void continueBackgroundScan(), BACKGROUND_MS);
  void continueBackgroundScan();
}

async function restorePersistedJob() {
  if (getJob()) return;
  const snapshot = await loadScanJob();
  if (!snapshot) return;
  setJob({
    mode: snapshot.mode,
    symbols: snapshot.symbols,
    eligible: snapshot.eligible,
    listedAt: snapshot.listedAt,
    cursor: snapshot.cursor,
    generation: snapshot.generation || 1,
    running: false,
    coins: restoreCoins(snapshot),
    failedReasons: { restart: 1 },
    updatedAt: snapshot.savedAt,
    lastScanAt: snapshot.savedAt,
    lastPriceAt: null,
    priceFeed: 'ok',
    analysisFeed: 'stale',
    lastCycleAt: snapshot.lastCycleAt ?? null,
    lastCycleDurationMs: snapshot.lastCycleDurationMs ?? null,
    lastFullUniverseAt: snapshot.lastFullUniverseAt ?? null,
    lastFullUniverseDurationMs: snapshot.lastFullUniverseDurationMs ?? null,
    lastFullUniverseStartedAt: snapshot.lastFullUniverseStartedAt ?? Date.now(),
    queueBacklog: snapshot.queueBacklog ?? snapshot.symbols.length,
    cycleOverlapsBlocked: snapshot.cycleOverlapsBlocked ?? 0,
  });
  if (snapshot.lastCandleCloseBySymbolTf) restoreCandleCloses(snapshot.lastCandleCloseBySymbolTf);
}

export async function runScheduledScanTick(): Promise<ScannerResponse> {
  await restorePersistedJob();
  const mode = getJob()?.mode && getJob()?.mode !== '15' ? getJob()!.mode : DEFAULT_LIVE_SCAN_MODE;
  return scanMarkets(false, { mode, backgroundLoop: false, inlineAnalyze: false });
}

export async function scanMarkets(force = false, options: ScanOptions = {}): Promise<ScannerResponse> {
  if (options.backgroundLoop !== false) startBackgroundScanLoop();
  await restorePersistedJob();
  const mode = options.mode == null ? (getJob()?.mode && getJob()?.mode !== '15' ? getJob()!.mode : DEFAULT_LIVE_SCAN_MODE) : parseScanMode(options.mode);
  const selection = await resolveUniverse(mode, options.custom);
  const job = syncJob(selection);
  const pending = selection.symbols.filter((symbol) => {
    const coin = job.coins.get(symbol);
    return force || symbolNeedsAnalysis(symbol, coin, force || options.force === true);
  });
  const inlineCap = selection.symbols.length <= INLINE_LIMIT ? selection.symbols.length : INLINE_LIMIT;
  const inline = options.inlineAnalyze === false ? [] : (pending.length ? pending : selection.symbols).slice(0, inlineCap);
  if (inline.length) await processSymbols(inline, force || options.force === true, job.generation);

  const warnings: string[] = [];
  let prices = new Map<string, number>();
  let stats = new Map<string, { changePct: number; quoteVolume: number }>();
  try {
    [prices, stats] = await Promise.all([
      getTickers(selection.symbols),
      getTicker24hrAll().catch(() => new Map()),
    ]);
    job.priceFeed = 'ok';
    job.lastPriceAt = new Date().toISOString();
  } catch (error) {
    job.priceFeed = 'error';
    warnings.push(error instanceof Error ? error.message : 'Ticker refresh failed');
  }

  const ready = selection.symbols.map((symbol) => job.coins.get(symbol)).filter((coin): coin is CoinScan => Boolean(coin && coin.scanState === 'ready'));
  const enriched = await Promise.all(ready.map(async (coin) => {
    const price = prices.get(coin.symbol);
    if (price == null) return coin;
    return attachLifecycle({ ...coin, price, priceUpdatedAt: job.lastPriceAt });
  }));
  for (const coin of enriched) job.coins.set(coin.symbol, coin);

  const snapshot = snapshotFromJob(job, prices, stats, warnings);
  if (pending.length > inline.length) {
    snapshot.warnings = [...snapshot.warnings, 'Background scanner is walking the remaining pairs with the same validated engine.'];
  }
  return snapshot;
}

export async function scanSymbol(symbol: string): Promise<CoinScan> {
  const upper = symbol.toUpperCase();
  const [filters, prices] = await Promise.all([getExchangeFilters([upper]), getTickers([upper])]);
  const symbolFilters = filters.get(upper);
  if (!symbolFilters) {
    return tagState(buildCoinScan({
      symbol: upper,
      filters: emptyFilters(upper, 'Not in the scanner universe or unverified'),
      snapshots: [],
      livePrice: null,
      priceUpdatedAt: null,
      stale: false,
    }));
  }
  return tagState(await analyzeSymbol(upper, symbolFilters, prices.get(upper), new Date().toISOString()));
}

export async function getLivePrices(symbols: readonly string[] = activeScanSymbols()) {
  const fetchedAt = new Date().toISOString();
  try {
    const [filters, prices, stats] = await Promise.all([
      getExchangeFilters(symbols),
      getTickers(symbols),
      getTicker24hrAll().catch(() => new Map()),
    ]);
    const job = getJob();
    if (job) {
      job.lastPriceAt = fetchedAt;
      job.priceFeed = 'ok';
    }
    return {
      fetchedAt,
      stale: false,
      error: undefined as string | undefined,
      prices: symbols.map((symbol) => {
        const info = filters.get(symbol);
        const row = stats.get(symbol);
        return {
          symbol,
          available: Boolean(info?.available),
          price: prices.get(symbol) ?? null,
          changePct: row?.changePct ?? null,
          quoteVolume: row?.quoteVolume ?? null,
          reason: info?.available ? undefined : info?.reason || 'Unavailable',
        };
      }),
    };
  } catch (error) {
    const job = getJob();
    if (job) job.priceFeed = 'error';
    return {
      fetchedAt,
      stale: true,
      error: error instanceof Error ? error.message : 'Price feed unavailable',
      prices: symbols.map((symbol) => ({
        symbol,
        available: false,
        price: null,
        changePct: null,
        quoteVolume: null,
        reason: 'Price feed unavailable',
      })),
    };
  }
}
