import { promises as fs } from 'fs';
import path from 'path';
import type { CoinScan, ScanMode } from './types';
import { markAnalysisStale } from './universe';

export const PROCESS_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type PersistedScanJob = {
  processId: string;
  mode: ScanMode;
  symbols: string[];
  eligible: number;
  listedAt: string;
  cursor: number;
  generation: number;
  coins: CoinScan[];
  savedAt: string;
  lastCycleAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseAt?: string | null;
  lastFullUniverseDurationMs?: number | null;
  lastFullUniverseStartedAt?: number | null;
  queueBacklog?: number;
  cycleOverlapsBlocked?: number;
  lastCandleCloseBySymbolTf?: Record<string, number>;
};

function persistPath() {
  return path.join(process.cwd(), 'data', 'scan-job.json');
}

function compactCoin(coin: CoinScan): CoinScan {
  return {
    ...coin,
    timeframes: [],
    context: null,
  };
}

export async function saveScanJob(job: {
  mode: ScanMode;
  symbols: string[];
  eligible: number;
  listedAt: string;
  cursor: number;
  generation: number;
  coins: Map<string, CoinScan>;
  lastCycleAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseAt?: string | null;
  lastFullUniverseDurationMs?: number | null;
  lastFullUniverseStartedAt?: number | null;
  queueBacklog?: number;
  cycleOverlapsBlocked?: number;
  lastCandleCloseBySymbolTf?: Record<string, number>;
}): Promise<void> {
  const snapshot: PersistedScanJob = {
    processId: PROCESS_ID,
    mode: job.mode,
    symbols: job.symbols,
    eligible: job.eligible,
    listedAt: job.listedAt,
    cursor: job.cursor,
    generation: job.generation,
    coins: job.symbols.map((symbol) => job.coins.get(symbol)).filter((coin): coin is CoinScan => Boolean(coin)).map(compactCoin),
    savedAt: new Date().toISOString(),
    lastCycleAt: job.lastCycleAt ?? null,
    lastCycleDurationMs: job.lastCycleDurationMs ?? null,
    lastFullUniverseAt: job.lastFullUniverseAt ?? null,
    lastFullUniverseDurationMs: job.lastFullUniverseDurationMs ?? null,
    lastFullUniverseStartedAt: job.lastFullUniverseStartedAt ?? null,
    queueBacklog: job.queueBacklog ?? 0,
    cycleOverlapsBlocked: job.cycleOverlapsBlocked ?? 0,
    lastCandleCloseBySymbolTf: job.lastCandleCloseBySymbolTf || {},
  };
  await fs.mkdir(path.dirname(persistPath()), { recursive: true });
  await fs.writeFile(persistPath(), JSON.stringify(snapshot));
}

export async function loadScanJob(): Promise<PersistedScanJob | null> {
  try {
    const raw = await fs.readFile(persistPath(), 'utf8');
    const parsed = JSON.parse(raw) as PersistedScanJob;
    if (!parsed?.mode || !Array.isArray(parsed.symbols)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function restoreCoins(snapshot: PersistedScanJob): Map<string, CoinScan> {
  const coins = new Map<string, CoinScan>();
  const fromOtherProcess = snapshot.processId !== PROCESS_ID;
  for (const coin of snapshot.coins || []) {
    coins.set(coin.symbol, fromOtherProcess ? markAnalysisStale(coin) : coin);
  }
  return coins;
}
