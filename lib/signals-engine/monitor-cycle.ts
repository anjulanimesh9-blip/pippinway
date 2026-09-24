import { getOfficialStore } from '@/lib/signals/official-store';
import { mergeOfficialLiveIntoResponse } from '@/lib/signals/official-live';
import { publishScanSnapshot } from '@/lib/signals/scan-snapshot';
import { weightSnapshot, lastBinanceFailure } from './rate-limit';
import {
  persistLease,
  releaseLease,
  renewLease,
  restoreLease,
  tryAcquireLease,
} from './monitor-lease';
import { PROCESS_ID } from './scan-job-persist';
import {
  currentScannerResponse,
  processCycleBatch,
  recordCycleMetrics,
  refreshBoardPrices,
  runScheduledScanTick,
} from './scanner';
import { monitorPriceTick } from './monitor';
import {
  buildColdCoverage,
  getColdUniverseState,
  type ColdUniverseCoverage,
} from './cold-universe';

export type MonitoringCycleResult = {
  ok: boolean;
  overlapped: boolean;
  kind: 'fast' | 'analysis' | 'combined';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  analyzed: string[];
  analyzedCount: number;
  selectedCount: number;
  backlog: number;
  weightUsed: number;
  weightLimit: number;
  lastFullUniverseAt: string | null;
  lastFullUniverseDurationMs: number | null;
  analysisDurationMs: number | null;
  priceUpdatedCount: number;
  coverageNote: string;
  workerStatus: 'running' | 'overlapping' | 'error' | 'idle';
  eligible: number;
  selected: number;
  long: number;
  short: number;
  wait: number;
  rejected: number;
  fresh: number;
  stale: number;
  failed: number;
  pending: number;
  cold?: ColdUniverseCoverage;
  coldAnalyzed?: string[];
  error?: string;
};

function emptyOverlap(startedAt: string): MonitoringCycleResult {
  return {
    ok: true,
    overlapped: true,
    kind: 'fast',
    startedAt,
    finishedAt: startedAt,
    durationMs: 0,
    analyzed: [],
    analyzedCount: 0,
    selectedCount: 0,
    backlog: 0,
    weightUsed: weightSnapshot().used,
    weightLimit: weightSnapshot().limit,
    lastFullUniverseAt: null,
    lastFullUniverseDurationMs: null,
    analysisDurationMs: null,
    priceUpdatedCount: 0,
    coverageNote: 'Previous monitoring cycle is still running. This tick was skipped to prevent overlap.',
    workerStatus: 'overlapping',
    eligible: 0,
    selected: 0,
    long: 0,
    short: 0,
    wait: 0,
    rejected: 0,
    fresh: 0,
    stale: 0,
    failed: 0,
    pending: 0,
  };
}

function coverageHealthFields(coverage: ColdUniverseCoverage | null | undefined) {
  if (!coverage) return {};
  return {
    eligibleUniverse: coverage.eligibleUniverse,
    hotUniverseSelected: coverage.hotUniverseSelected,
    hotUniverseAnalyzed: coverage.hotUniverseAnalyzed,
    coldUniverseSize: coverage.coldUniverseSize,
    coldUniverseAnalyzed: coverage.coldUniverseAnalyzed,
    fullUniverseCoverageCount: coverage.fullUniverseCoverageCount,
    fullUniverseCoveragePct: coverage.fullUniverseCoveragePct,
    currentColdBatch: coverage.currentColdBatch,
    currentColdBatchSymbols: coverage.currentColdBatchSymbols,
    lastFullEligibleUniverseAt: coverage.lastFullEligibleUniverseAt,
    nextExpectedFullEligibleUniverseAt: coverage.nextExpectedFullEligibleUniverseAt,
    lastColdBatchAt: coverage.lastColdBatchAt,
    lastColdBatchDurationMs: coverage.lastColdBatchDurationMs,
  };
}

function coverageNoteWithCold(base: string, coverage: ColdUniverseCoverage | null | undefined): string {
  if (!coverage || !coverage.eligibleUniverse) return base;
  const coldPart = coverage.coldUniverseSize > 0
    ? ` Cold coverage ${coverage.coldUniverseAnalyzed}/${coverage.coldUniverseSize} (batch ${coverage.currentColdBatch}).`
    : '';
  return `${base} Full eligible coverage ${coverage.fullUniverseCoverageCount}/${coverage.eligibleUniverse} (${coverage.fullUniverseCoveragePct}%).${coldPart}`;
}

async function publishBoard(input: {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  coverageNote: string;
  backlog: number;
  priceUpdatedCount: number;
  analysisDurationMs: number | null;
  warnings?: string[];
  cold?: ColdUniverseCoverage | null;
}) {
  const weight = weightSnapshot();
  const liveBoard = currentScannerResponse(
    [input.coverageNote, ...(input.warnings || [])].filter(Boolean),
  );
  const boardCounts = liveBoard?.counts;
  const boardHealth = liveBoard?.health;
  const selectedCount = liveBoard?.universe?.selected ?? boardHealth?.selectedCount ?? 0;
  const analyzedCount = boardHealth?.analyzedCount
    ?? liveBoard?.coins.filter((coin) => coin.scanState && coin.scanState !== 'pending').length
    ?? 0;
  const coldFields = coverageHealthFields(input.cold);
  const rankedAt = liveBoard?.universe?.listedAt ?? null;
  const analysisIntervalMs = Number(process.env.SIGNALS_ANALYSIS_INTERVAL_MS || 300_000);
  const nextAnalysisAt = new Date(Date.parse(input.finishedAt) + analysisIntervalMs).toISOString();
  const failure = lastBinanceFailure();

  await getOfficialStore().setHealth({
    ...coldFields,
    lastCycleAt: input.startedAt,
    lastCycleDurationMs: input.durationMs,
    lastFullUniverseAt: boardHealth?.lastFullUniverseAt ?? null,
    lastFullUniverseDurationMs: boardHealth?.lastFullUniverseDurationMs ?? null,
    requestWeightUsed: weight.used,
    requestWeightLimit: weight.limit,
    queueBacklog: input.backlog,
    workerStatus: 'running',
    freshCount: boardHealth?.freshCount,
    staleCount: boardHealth?.staleCount,
    failedCount: boardHealth?.failedCount,
    pendingCount: boardHealth?.pendingCount,
    neverScannedCount: boardHealth?.neverScannedCount,
    selectedCount,
    analyzedCount,
    priceUpdatedCount: input.priceUpdatedCount,
    analysisDurationMs: input.analysisDurationMs,
    validatedLong: boardCounts?.long ?? 0,
    validatedShort: boardCounts?.short ?? 0,
    waitCount: boardCounts?.wait ?? 0,
    rejectedCount: boardCounts?.invalid ?? 0,
    cycleOverlapsBlocked: 0,
    coverageNote: input.coverageNote,
    lastScanAt: boardHealth?.lastScanAt ?? input.startedAt,
    lastSuccessAt: input.finishedAt,
    lastPriceAt: boardHealth?.lastPriceAt ?? null,
    stale: Boolean(liveBoard?.stale),
    monitoring: 'running',
    eligibleUniverse: liveBoard?.universe?.eligible ?? coldFields.eligibleUniverse,
    hotUniverseSelected: selectedCount,
    hotUniverseAnalyzed: analyzedCount,
    top100RankedAt: rankedAt,
    nextAnalysisAt,
    binanceCircuitOpen: weight.circuitOpen,
    lastBinanceStatus: failure?.status ?? null,
    lastBinanceKind: failure?.kind ?? null,
    lastBinanceReason: failure?.reason ?? null,
    lastBinancePath: failure?.path ?? null,
  });

  if (liveBoard) {
    const activeOfficial = await getOfficialStore().listActive().catch(() => []);
    const enriched = mergeOfficialLiveIntoResponse(liveBoard, activeOfficial);
    enriched.health = {
      ...enriched.health!,
      ...coldFields,
      lastCycleAt: input.startedAt,
      lastCycleDurationMs: input.durationMs,
      requestWeightUsed: weight.used,
      requestWeightLimit: weight.limit,
      queueBacklog: input.backlog,
      workerStatus: 'running',
      monitoring: 'running',
      coverageNote: input.coverageNote,
      selectedCount,
      analyzedCount,
      priceUpdatedCount: input.priceUpdatedCount,
      analysisDurationMs: input.analysisDurationMs,
      cycleStartedAt: input.startedAt,
      cycleCompletedAt: input.finishedAt,
      eligibleUniverse: liveBoard.universe?.eligible ?? undefined,
      hotUniverseSelected: selectedCount,
      hotUniverseAnalyzed: analyzedCount,
      top100RankedAt: rankedAt,
      nextAnalysisAt,
      binanceCircuitOpen: weight.circuitOpen,
      lastBinanceStatus: failure?.status ?? null,
      lastBinanceKind: failure?.kind ?? null,
      lastBinanceReason: failure?.reason ?? null,
      lastBinancePath: failure?.path ?? null,
    };
    await publishScanSnapshot(enriched, { processId: PROCESS_ID, source: 'persistent-worker' }).catch((error) => {
      console.warn(JSON.stringify({
        event: 'scan_snapshot_publish_failed',
        reason: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
      }));
    });
    return { liveBoard: enriched, boardCounts: enriched.counts, boardHealth: enriched.health, selectedCount, analyzedCount, weight };
  }

  return { liveBoard, boardCounts, boardHealth, selectedCount, analyzedCount, weight };
}

/** Fast path: official lifecycle + Top 50 price/24h refresh + small cold batch. */
export async function runFastMarketMonitor(): Promise<MonitoringCycleResult> {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  await restoreLease();
  const lease = tryAcquireLease(PROCESS_ID);
  if (!lease.acquired) return emptyOverlap(startedAt);

  try {
    renewLease(PROCESS_ID);
    await persistLease();
    await monitorPriceTick();
    // Ensure board symbols exist (Top 100 by 24h quote volume).
    const scan = await runScheduledScanTick();
    const prices = await refreshBoardPrices();

    const hotAnalyzed = (scan.coins || []).filter((coin) => coin.scanState && coin.scanState !== 'pending').length;

    const finished = Date.now();
    const durationMs = finished - started;
    const finishedAt = new Date(finished).toISOString();
    recordCycleMetrics({ startedAt, durationMs, backlog: scan.progress?.queueBacklog ?? 0 });

    const pending = scan.counts?.pending ?? 0;
    const selected = scan.universe?.selected ?? 0;
    const analyzedCount = hotAnalyzed;
    const coverageNote = pending > 0 || analyzedCount < selected
      ? `Fast price monitor updated ${prices.priceUpdatedCount} quotes. Analysis coverage ${analyzedCount}/${selected}.`
      : `Fast price monitor updated ${prices.priceUpdatedCount} quotes. Top ${selected} pattern analysis complete — ${analyzedCount}/${selected} analyzed.`;

    const published = await publishBoard({
      startedAt,
      finishedAt,
      durationMs,
      coverageNote,
      backlog: scan.progress?.queueBacklog ?? 0,
      priceUpdatedCount: prices.priceUpdatedCount,
      analysisDurationMs: null,
      warnings: scan.warnings,
      cold: null,
    });

    return {
      ok: true,
      overlapped: false,
      kind: 'fast',
      startedAt,
      finishedAt,
      durationMs,
      analyzed: [],
      analyzedCount: published.analyzedCount,
      selectedCount: published.selectedCount,
      backlog: scan.progress?.queueBacklog ?? 0,
      weightUsed: published.weight.used,
      weightLimit: published.weight.limit,
      lastFullUniverseAt: published.boardHealth?.lastFullUniverseAt ?? null,
      lastFullUniverseDurationMs: published.boardHealth?.lastFullUniverseDurationMs ?? null,
      analysisDurationMs: null,
      priceUpdatedCount: prices.priceUpdatedCount,
      coverageNote,
      workerStatus: 'running',
      eligible: published.liveBoard?.universe?.eligible ?? scan.universe?.eligible ?? 0,
      selected: published.selectedCount,
      long: published.boardCounts?.long ?? 0,
      short: published.boardCounts?.short ?? 0,
      wait: published.boardCounts?.wait ?? 0,
      rejected: published.boardCounts?.invalid ?? 0,
      fresh: published.boardHealth?.freshCount ?? 0,
      stale: published.boardHealth?.staleCount ?? 0,
      failed: published.boardHealth?.failedCount ?? 0,
      pending: published.boardCounts?.pending ?? 0,
    };
  } catch (error) {
    const finished = Date.now();
    const message = error instanceof Error ? error.message : 'Fast market monitor failed';
    recordCycleMetrics({ startedAt, durationMs: finished - started });
    await getOfficialStore().setHealth({
      stale: true,
      error: message,
      monitoring: 'error',
      workerStatus: 'error',
      lastCycleAt: startedAt,
      lastCycleDurationMs: finished - started,
    }).catch(() => undefined);
    return {
      ...emptyOverlap(startedAt),
      ok: false,
      overlapped: false,
      kind: 'fast',
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      coverageNote: message,
      workerStatus: 'error',
      error: message,
    };
  } finally {
    releaseLease(PROCESS_ID);
    await persistLease().catch(() => undefined);
  }
}

/** Heavy path: complete Top 100 pattern analysis (risk×2 TP, no net≥3 gate by default). */
export async function runFullTop50Analysis(): Promise<MonitoringCycleResult> {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  await restoreLease();
  const lease = tryAcquireLease(PROCESS_ID);
  if (!lease.acquired) return { ...emptyOverlap(startedAt), kind: 'analysis' };

  try {
    renewLease(PROCESS_ID);
    await persistLease();
    await monitorPriceTick();
    // Force Top 100 re-rank from current eligible universe + 24h quote volume every analysis cycle.
    const scan = await runScheduledScanTick({ refreshUniverse: true });
    const selectedCount = scan.universe?.selected ?? 100;
    const batch = await processCycleBatch({
      fullPass: true,
      budget: selectedCount,
      activeSymbols: scan.coins
        .filter((coin) => coin.setup && (coin.direction === 'LONG' || coin.direction === 'SHORT'))
        .map((coin) => coin.symbol),
    });

    const livePreview = currentScannerResponse();
    const hotAnalyzed = livePreview?.health?.analyzedCount
      ?? livePreview?.coins.filter((c) => c.scanState && c.scanState !== 'pending').length
      ?? batch.analyzed.length;

    const finished = Date.now();
    const durationMs = finished - started;
    const finishedAt = new Date(finished).toISOString();
    recordCycleMetrics({ startedAt, durationMs, backlog: batch.backlog });

    const selected = livePreview?.universe?.selected ?? selectedCount;
    const coverageNote = hotAnalyzed < selected
      ? `Coverage is incomplete — ${hotAnalyzed}/${selected} selected coins have completed pattern analysis.`
      : `Top ${selected} pattern analysis complete — ${hotAnalyzed}/${selected} analyzed.`;

    const published = await publishBoard({
      startedAt,
      finishedAt,
      durationMs,
      coverageNote,
      backlog: batch.backlog,
      priceUpdatedCount: batch.priceUpdatedCount,
      analysisDurationMs: batch.analysisDurationMs,
      warnings: scan.warnings,
      cold: null,
    });

    return {
      ok: true,
      overlapped: false,
      kind: 'analysis',
      startedAt,
      finishedAt,
      durationMs,
      analyzed: batch.analyzed,
      analyzedCount: published.analyzedCount,
      selectedCount: published.selectedCount,
      backlog: batch.backlog,
      weightUsed: published.weight.used,
      weightLimit: published.weight.limit,
      lastFullUniverseAt: published.boardHealth?.lastFullUniverseAt ?? null,
      lastFullUniverseDurationMs: published.boardHealth?.lastFullUniverseDurationMs ?? batch.analysisDurationMs,
      analysisDurationMs: batch.analysisDurationMs,
      priceUpdatedCount: batch.priceUpdatedCount,
      coverageNote,
      workerStatus: 'running',
      eligible: published.liveBoard?.universe?.eligible ?? scan.universe?.eligible ?? 0,
      selected: published.selectedCount,
      long: published.boardCounts?.long ?? 0,
      short: published.boardCounts?.short ?? 0,
      wait: published.boardCounts?.wait ?? 0,
      rejected: published.boardCounts?.invalid ?? 0,
      fresh: published.boardHealth?.freshCount ?? 0,
      stale: published.boardHealth?.staleCount ?? 0,
      failed: published.boardHealth?.failedCount ?? 0,
      pending: published.boardCounts?.pending ?? batch.backlog,
    };
  } catch (error) {
    const finished = Date.now();
    const message = error instanceof Error ? error.message : 'Full Top 100 pattern analysis failed';
    recordCycleMetrics({ startedAt, durationMs: finished - started });
    await getOfficialStore().setHealth({
      stale: true,
      error: message,
      monitoring: 'error',
      workerStatus: 'error',
      lastCycleAt: startedAt,
      lastCycleDurationMs: finished - started,
    }).catch(() => undefined);
    return {
      ...emptyOverlap(startedAt),
      ok: false,
      overlapped: false,
      kind: 'analysis',
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      coverageNote: message,
      workerStatus: 'error',
      error: message,
    };
  } finally {
    releaseLease(PROCESS_ID);
    await persistLease().catch(() => undefined);
  }
}

/** Combined cycle used by legacy callers: fast monitor + full Top 50 analysis. */
export async function runMonitoringCycle(): Promise<MonitoringCycleResult> {
  return runFullTop50Analysis();
}

/** Snapshot current cold coverage without running a batch (UI/tests). */
export function currentColdCoverage(hotSelected = 50, hotAnalyzed = 50): ColdUniverseCoverage {
  return buildColdCoverage({
    state: getColdUniverseState(),
    hotSelected,
    hotAnalyzed,
  });
}
