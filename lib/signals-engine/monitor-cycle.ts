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
  runScheduledScanTick,
} from './scanner';
import { monitorPriceTick } from './monitor';

export type MonitoringCycleResult = {
  ok: boolean;
  overlapped: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  analyzed: string[];
  backlog: number;
  weightUsed: number;
  weightLimit: number;
  lastFullUniverseAt: string | null;
  lastFullUniverseDurationMs: number | null;
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

const CYCLE_BUDGET_MS = 45_000;

export async function runMonitoringCycle(): Promise<MonitoringCycleResult> {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  await restoreLease();
  const lease = tryAcquireLease(PROCESS_ID);
  if (!lease.acquired) {
    recordCycleMetrics({ startedAt, durationMs: 0, overlapsBlocked: 1 });
    return {
      ok: true,
      overlapped: true,
      startedAt,
      finishedAt: startedAt,
      durationMs: 0,
      analyzed: [],
      backlog: 0,
      weightUsed: weightSnapshot().used,
      weightLimit: weightSnapshot().limit,
      lastFullUniverseAt: null,
      lastFullUniverseDurationMs: null,
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

  try {
    renewLease(PROCESS_ID);
    await persistLease();
    await monitorPriceTick();
    const scan = await runScheduledScanTick();
    const remaining = Math.max(8_000, CYCLE_BUDGET_MS - (Date.now() - started));
    const selectedCount = scan.universe?.selected ?? 50;
    const budget = remaining < 15_000 ? Math.min(20, selectedCount) : selectedCount;
    const batch = await processCycleBatch({
      activeSymbols: scan.coins.filter((coin) => coin.setup && (coin.direction === 'LONG' || coin.direction === 'SHORT')).map((coin) => coin.symbol),
      budget,
    });
    const finished = Date.now();
    const durationMs = finished - started;
    recordCycleMetrics({ startedAt, durationMs, backlog: batch.backlog });
    const weight = weightSnapshot();
    const coverageNote = scan.health?.coverageNote
      || (batch.backlog > 0
        ? `Queue still has ${batch.backlog} symbols. Full-universe analysis is incremental and is not claimed to finish every 60 seconds.`
        : 'Selected symbols have analysis snapshots. Freshness is per-coin, not a 60-second full-universe guarantee.');

    // Build the post-batch board first. runScheduledScanTick counts are pre-batch (mostly pending)
    // and must not overwrite LONG/SHORT/WAIT after processCycleBatch finishes.
    const liveBoard = currentScannerResponse(
      [
        coverageNote,
        ...(scan.warnings || []),
      ].filter(Boolean),
    );
    const boardCounts = liveBoard?.counts;
    const boardHealth = liveBoard?.health;

    await getOfficialStore().setHealth({
      lastCycleAt: startedAt,
      lastCycleDurationMs: durationMs,
      lastFullUniverseAt: boardHealth?.lastFullUniverseAt ?? scan.health?.lastFullUniverseAt ?? null,
      lastFullUniverseDurationMs: boardHealth?.lastFullUniverseDurationMs ?? scan.health?.lastFullUniverseDurationMs ?? null,
      requestWeightUsed: weight.used,
      requestWeightLimit: weight.limit,
      queueBacklog: batch.backlog,
      workerStatus: 'running',
      freshCount: boardHealth?.freshCount,
      staleCount: boardHealth?.staleCount,
      failedCount: boardHealth?.failedCount,
      pendingCount: boardHealth?.pendingCount,
      neverScannedCount: boardHealth?.neverScannedCount,
      // Board direction counts among analyzed coins (scanState !== pending). Not official actionable fills.
      validatedLong: boardCounts?.long ?? 0,
      validatedShort: boardCounts?.short ?? 0,
      waitCount: boardCounts?.wait ?? 0,
      rejectedCount: boardCounts?.invalid ?? 0,
      cycleOverlapsBlocked: 0,
      coverageNote,
      lastScanAt: boardHealth?.lastScanAt ?? scan.health?.lastScanAt ?? startedAt,
      lastSuccessAt: new Date(finished).toISOString(),
      stale: Boolean(liveBoard?.stale ?? scan.stale),
      monitoring: 'running',
    });
    if (liveBoard) {
      liveBoard.health = {
        ...liveBoard.health!,
        lastCycleAt: startedAt,
        lastCycleDurationMs: durationMs,
        lastFullUniverseAt: boardHealth?.lastFullUniverseAt ?? scan.health?.lastFullUniverseAt ?? null,
        lastFullUniverseDurationMs: boardHealth?.lastFullUniverseDurationMs ?? scan.health?.lastFullUniverseDurationMs ?? null,
        requestWeightUsed: weight.used,
        requestWeightLimit: weight.limit,
        queueBacklog: batch.backlog,
        workerStatus: 'running',
        monitoring: 'running',
        coverageNote,
      };
      await publishScanSnapshot(liveBoard, { processId: PROCESS_ID, source: 'persistent-worker' }).catch((error) => {
        console.warn(JSON.stringify({
          event: 'scan_snapshot_publish_failed',
          reason: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
        }));
      });
    }
    return {
      ok: true,
      overlapped: false,
      startedAt,
      finishedAt: new Date(finished).toISOString(),
      durationMs,
      analyzed: batch.analyzed,
      backlog: batch.backlog,
      weightUsed: weight.used,
      weightLimit: weight.limit,
      lastFullUniverseAt: boardHealth?.lastFullUniverseAt ?? scan.health?.lastFullUniverseAt ?? null,
      lastFullUniverseDurationMs: boardHealth?.lastFullUniverseDurationMs ?? scan.health?.lastFullUniverseDurationMs ?? null,
      coverageNote,
      workerStatus: 'running',
      eligible: liveBoard?.universe?.eligible ?? scan.universe?.eligible ?? 0,
      selected: liveBoard?.universe?.selected ?? scan.universe?.selected ?? 0,
      long: boardCounts?.long ?? 0,
      short: boardCounts?.short ?? 0,
      wait: boardCounts?.wait ?? 0,
      rejected: boardCounts?.invalid ?? 0,
      fresh: boardHealth?.freshCount ?? 0,
      stale: boardHealth?.staleCount ?? 0,
      failed: boardHealth?.failedCount ?? 0,
      pending: boardCounts?.pending ?? batch.backlog,
    };
  } catch (error) {
    const finished = Date.now();
    const message = error instanceof Error ? error.message : 'Monitoring cycle failed';
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
      ok: false,
      overlapped: false,
      startedAt,
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      analyzed: [],
      backlog: 0,
      weightUsed: weightSnapshot().used,
      weightLimit: weightSnapshot().limit,
      lastFullUniverseAt: null,
      lastFullUniverseDurationMs: null,
      coverageNote: message,
      workerStatus: 'error',
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
      error: message,
    };
  } finally {
    releaseLease(PROCESS_ID);
    await persistLease().catch(() => undefined);
  }
}
