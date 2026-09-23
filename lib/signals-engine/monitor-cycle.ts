import { getOfficialStore } from '@/lib/signals/official-store';
import { publishScanSnapshot } from '@/lib/signals/scan-snapshot';
import { weightSnapshot } from './rate-limit';
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

async function publishBoard(input: {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  coverageNote: string;
  backlog: number;
  priceUpdatedCount: number;
  analysisDurationMs: number | null;
  warnings?: string[];
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

  await getOfficialStore().setHealth({
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
  });

  if (liveBoard) {
    liveBoard.health = {
      ...liveBoard.health!,
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
    };
    await publishScanSnapshot(liveBoard, { processId: PROCESS_ID, source: 'persistent-worker' }).catch((error) => {
      console.warn(JSON.stringify({
        event: 'scan_snapshot_publish_failed',
        reason: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
      }));
    });
  }

  return { liveBoard, boardCounts, boardHealth, selectedCount, analyzedCount, weight };
}

/** Fast path: official lifecycle + Top 50 price/24h refresh. No heavy TA. */
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
    // Ensure board symbols exist (uses 15m Top 50 ranking cache).
    const scan = await runScheduledScanTick();
    const prices = await refreshBoardPrices();
    const finished = Date.now();
    const durationMs = finished - started;
    const finishedAt = new Date(finished).toISOString();
    recordCycleMetrics({ startedAt, durationMs, backlog: scan.progress?.queueBacklog ?? 0 });

    const pending = scan.counts?.pending ?? 0;
    const selected = scan.universe?.selected ?? 0;
    const analyzedCount = (scan.coins || []).filter((coin) => coin.scanState && coin.scanState !== 'pending').length;
    const coverageNote = pending > 0 || analyzedCount < selected
      ? `Fast price monitor updated ${prices.priceUpdatedCount} quotes. Analysis coverage ${analyzedCount}/${selected}.`
      : `Fast price monitor updated ${prices.priceUpdatedCount} quotes. Top ${selected} analysis complete — ${analyzedCount}/${selected} analyzed.`;

    const published = await publishBoard({
      startedAt,
      finishedAt,
      durationMs,
      coverageNote,
      backlog: scan.progress?.queueBacklog ?? 0,
      priceUpdatedCount: prices.priceUpdatedCount,
      analysisDurationMs: null,
      warnings: scan.warnings,
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

/** Heavy path: complete Top 50 technical analysis pass (cache-aware). */
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
    const scan = await runScheduledScanTick();
    const selectedCount = scan.universe?.selected ?? 50;
    const batch = await processCycleBatch({
      fullPass: true,
      budget: selectedCount,
      activeSymbols: scan.coins
        .filter((coin) => coin.setup && (coin.direction === 'LONG' || coin.direction === 'SHORT'))
        .map((coin) => coin.symbol),
    });
    const finished = Date.now();
    const durationMs = finished - started;
    const finishedAt = new Date(finished).toISOString();
    recordCycleMetrics({ startedAt, durationMs, backlog: batch.backlog });

    const livePreview = currentScannerResponse();
    const analyzedCount = livePreview?.health?.analyzedCount
      ?? livePreview?.coins.filter((c) => c.scanState && c.scanState !== 'pending').length
      ?? batch.analyzed.length;
    const selected = livePreview?.universe?.selected ?? selectedCount;
    const coverageNote = analyzedCount < selected
      ? `Coverage is incomplete — ${analyzedCount}/${selected} selected coins have completed analysis.`
      : `Top ${selected} analysis complete — ${analyzedCount}/${selected} analyzed.`;

    const published = await publishBoard({
      startedAt,
      finishedAt,
      durationMs,
      coverageNote,
      backlog: batch.backlog,
      priceUpdatedCount: batch.priceUpdatedCount,
      analysisDurationMs: batch.analysisDurationMs,
      warnings: scan.warnings,
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
    const message = error instanceof Error ? error.message : 'Full Top 50 analysis failed';
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
