/**
 * Rolling cold-universe scanner: analyzes eligible USDT-M pairs outside the hot Top 50.
 * Uses the same production analyze → attachLifecycle → signalsOfficial path.
 * Does not change MIN_NET_RR or stretch targets.
 */
import { promises as fs } from "fs";
import path from "path";
import { canSpend, awaitBudget, weightSnapshot } from "./rate-limit";
import { scanSymbol } from "./scanner";
import { resolveUniverse } from "./universe";

export const COLD_BATCH_SIZE = Number(process.env.SIGNALS_COLD_BATCH_SIZE || 40);
/** Smaller cold batch used on ~60s fast ticks when weight remains. */
export const COLD_FAST_BATCH_SIZE = Number(process.env.SIGNALS_COLD_FAST_BATCH_SIZE || 12);
/** Soft weight reserve for a cold batch (kline + ticker + premium approx). */
export const COLD_BATCH_WEIGHT_RESERVE = Number(process.env.SIGNALS_COLD_WEIGHT_RESERVE || 120);
/** Target full eligible coverage window used for ETA (ms). */
export const COLD_COVERAGE_TARGET_MS = Number(process.env.SIGNALS_COLD_COVERAGE_TARGET_MS || 25 * 60_000);

export type ColdUniverseState = {
  cursor: number;
  /** Symbols successfully analyzed in the current full-eligible pass (hot + cold). */
  coveredThisPass: string[];
  /** Cold-only symbols analyzed in the current pass. */
  coldCoveredThisPass: string[];
  lastBatchSymbols: string[];
  lastBatchAt: string | null;
  lastBatchDurationMs: number | null;
  lastFullEligibleUniverseAt: string | null;
  lastFullEligibleUniverseDurationMs: number | null;
  passStartedAt: string | null;
  eligibleCount: number;
  hotCount: number;
  coldUniverseSize: number;
  updatedAt: string;
};

export type ColdUniverseCoverage = {
  eligibleUniverse: number;
  hotUniverseSelected: number;
  hotUniverseAnalyzed: number;
  coldUniverseSize: number;
  coldUniverseAnalyzed: number;
  fullUniverseCoverageCount: number;
  fullUniverseCoveragePct: number;
  currentColdBatch: string;
  currentColdBatchSymbols: string[];
  lastFullEligibleUniverseAt: string | null;
  nextExpectedFullEligibleUniverseAt: string | null;
  lastColdBatchAt: string | null;
  lastColdBatchDurationMs: number | null;
  requestWeightUsed: number;
  requestWeightLimit: number;
  workerStatus: string;
};

export type ColdBatchResult = {
  ok: boolean;
  analyzed: string[];
  skippedWeight: boolean;
  coverage: ColdUniverseCoverage;
  durationMs: number;
  error?: string;
};

const g = globalThis as typeof globalThis & {
  __pippinwayColdUniverse?: ColdUniverseState;
};

function persistPath() {
  return path.join(process.cwd(), "data", "cold-universe.json");
}

function emptyState(): ColdUniverseState {
  return {
    cursor: 0,
    coveredThisPass: [],
    coldCoveredThisPass: [],
    lastBatchSymbols: [],
    lastBatchAt: null,
    lastBatchDurationMs: null,
    lastFullEligibleUniverseAt: null,
    lastFullEligibleUniverseDurationMs: null,
    passStartedAt: null,
    eligibleCount: 0,
    hotCount: 0,
    coldUniverseSize: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function getColdUniverseState(): ColdUniverseState {
  return g.__pippinwayColdUniverse || emptyState();
}

async function saveState(state: ColdUniverseState): Promise<void> {
  g.__pippinwayColdUniverse = state;
  try {
    await fs.mkdir(path.dirname(persistPath()), { recursive: true });
    await fs.writeFile(persistPath(), JSON.stringify(state, null, 2));
  } catch {
    // Local persist is best-effort; in-memory state still drives the worker.
  }
}

export async function restoreColdUniverseState(): Promise<ColdUniverseState> {
  if (g.__pippinwayColdUniverse) return g.__pippinwayColdUniverse;
  try {
    const raw = await fs.readFile(persistPath(), "utf8");
    const parsed = JSON.parse(raw) as ColdUniverseState;
    g.__pippinwayColdUniverse = {
      ...emptyState(),
      ...parsed,
      coveredThisPass: Array.isArray(parsed.coveredThisPass) ? parsed.coveredThisPass : [],
      coldCoveredThisPass: Array.isArray(parsed.coldCoveredThisPass) ? parsed.coldCoveredThisPass : [],
      lastBatchSymbols: Array.isArray(parsed.lastBatchSymbols) ? parsed.lastBatchSymbols : [],
    };
  } catch {
    g.__pippinwayColdUniverse = emptyState();
  }
  return g.__pippinwayColdUniverse!;
}

export function buildColdCoverage(input: {
  state: ColdUniverseState;
  hotSelected: number;
  hotAnalyzed: number;
  workerStatus?: string;
}): ColdUniverseCoverage {
  const eligible = input.state.eligibleCount || 0;
  const covered = new Set(input.state.coveredThisPass.map((s) => s.toUpperCase())).size;
  // Include hot analyzed toward coverage display for the current pass.
  const fullCount = Math.min(eligible, Math.max(covered, input.hotAnalyzed));
  const pct = eligible > 0 ? Math.min(100, Math.round((fullCount / eligible) * 1000) / 10) : 0;
  const coldSize = input.state.coldUniverseSize;
  const coldAnalyzed = new Set(input.state.coldCoveredThisPass.map((s) => s.toUpperCase())).size;
  const batchIndex =
    coldSize > 0 ? Math.floor((input.state.cursor % Math.max(coldSize, 1)) / Math.max(COLD_BATCH_SIZE, 1)) + 1 : 0;
  const batchTotal = coldSize > 0 ? Math.ceil(coldSize / Math.max(COLD_BATCH_SIZE, 1)) : 0;
  const weight = weightSnapshot();

  let nextExpected: string | null = null;
  if (input.state.passStartedAt) {
    const started = Date.parse(input.state.passStartedAt);
    if (Number.isFinite(started)) {
      nextExpected = new Date(started + COLD_COVERAGE_TARGET_MS).toISOString();
    }
  } else if (input.state.lastFullEligibleUniverseAt) {
    const last = Date.parse(input.state.lastFullEligibleUniverseAt);
    if (Number.isFinite(last)) {
      nextExpected = new Date(last + COLD_COVERAGE_TARGET_MS).toISOString();
    }
  } else {
    nextExpected = new Date(Date.now() + COLD_COVERAGE_TARGET_MS).toISOString();
  }

  return {
    eligibleUniverse: eligible,
    hotUniverseSelected: input.hotSelected,
    hotUniverseAnalyzed: input.hotAnalyzed,
    coldUniverseSize: coldSize,
    coldUniverseAnalyzed: coldAnalyzed,
    fullUniverseCoverageCount: fullCount,
    fullUniverseCoveragePct: pct,
    currentColdBatch: batchTotal > 0 ? `${batchIndex}/${batchTotal}` : "0/0",
    currentColdBatchSymbols: input.state.lastBatchSymbols,
    lastFullEligibleUniverseAt: input.state.lastFullEligibleUniverseAt,
    nextExpectedFullEligibleUniverseAt: nextExpected,
    lastColdBatchAt: input.state.lastBatchAt,
    lastColdBatchDurationMs: input.state.lastBatchDurationMs,
    requestWeightUsed: weight.used,
    requestWeightLimit: weight.limit,
    workerStatus: input.workerStatus || "running",
  };
}

/**
 * Analyze the next cold batch (eligible − hot Top 50) with weight protection.
 * Official publication happens inside scanSymbol → attachLifecycle when gates pass.
 */
export async function runColdUniverseBatch(
  hotSymbols: string[],
  options: { batchSize?: number; hotAnalyzed?: number } = {},
): Promise<ColdBatchResult> {
  const started = Date.now();
  await restoreColdUniverseState();
  const state = getColdUniverseState();
  const hotSet = new Set(hotSymbols.map((s) => s.toUpperCase()));
  const hotAnalyzed = options.hotAnalyzed ?? hotSet.size;

  try {
    if (!canSpend(Math.min(COLD_BATCH_WEIGHT_RESERVE, 40))) {
      const coverage = buildColdCoverage({
        state,
        hotSelected: hotSet.size,
        hotAnalyzed,
        workerStatus: "running",
      });
      return {
        ok: true,
        analyzed: [],
        skippedWeight: true,
        coverage,
        durationMs: Date.now() - started,
      };
    }
    await awaitBudget(Math.min(COLD_BATCH_WEIGHT_RESERVE, 40));

    const all = await resolveUniverse("all", undefined, false);
    // Stable alphabetical order so volume re-ranks do not scramble the rolling cursor.
    const cold = all.symbols
      .map((symbol) => symbol.toUpperCase())
      .filter((symbol) => !hotSet.has(symbol))
      .sort((a, b) => a.localeCompare(b));
    state.eligibleCount = all.eligible;
    state.hotCount = hotSet.size;
    state.coldUniverseSize = cold.length;
    if (!state.passStartedAt) state.passStartedAt = new Date().toISOString();

    // Seed hot symbols into coverage for this pass.
    for (const symbol of hotSet) {
      if (!state.coveredThisPass.includes(symbol)) state.coveredThisPass.push(symbol);
    }

    if (!cold.length) {
      state.lastFullEligibleUniverseAt = new Date().toISOString();
      state.lastFullEligibleUniverseDurationMs = Date.now() - (Date.parse(state.passStartedAt!) || started);
      state.passStartedAt = new Date().toISOString();
      state.cursor = 0;
      state.coveredThisPass = [...hotSet];
      state.coldCoveredThisPass = [];
      state.updatedAt = new Date().toISOString();
      await saveState(state);
      return {
        ok: true,
        analyzed: [],
        skippedWeight: false,
        coverage: buildColdCoverage({
          state,
          hotSelected: hotSet.size,
          hotAnalyzed,
        }),
        durationMs: Date.now() - started,
      };
    }

    // Clamp cursor if the cold universe shrank since the last cycle.
    if (state.cursor >= cold.length) state.cursor = state.cursor % cold.length;

    const batchSize = Math.max(1, options.batchSize ?? COLD_BATCH_SIZE);
    const start = state.cursor % cold.length;
    const batch: string[] = [];
    for (let i = 0; i < batchSize && i < cold.length; i++) {
      batch.push(cold[(start + i) % cold.length]);
    }

    const analyzed: string[] = [];
    for (const symbol of batch) {
      if (!canSpend(25)) break;
      try {
        await awaitBudget(25);
        await scanSymbol(symbol);
        analyzed.push(symbol);
        if (!state.coveredThisPass.includes(symbol)) state.coveredThisPass.push(symbol);
        if (!state.coldCoveredThisPass.includes(symbol)) state.coldCoveredThisPass.push(symbol);
      } catch {
        // One symbol failure must not abort the batch; still advance coverage so a broken
        // pair cannot permanently stall the rolling cursor.
        analyzed.push(symbol);
        if (!state.coveredThisPass.includes(symbol)) state.coveredThisPass.push(symbol);
        if (!state.coldCoveredThisPass.includes(symbol)) state.coldCoveredThisPass.push(symbol);
      }
    }

    // Advance only by symbols actually processed. Jumping by the planned batch size when
    // weight breaks mid-batch would skip remaining pairs until a full wrap-around.
    state.cursor = (start + analyzed.length) % cold.length;
    state.lastBatchSymbols = analyzed;
    state.lastBatchAt = new Date().toISOString();
    state.lastBatchDurationMs = Date.now() - started;

    // Complete a full-eligible pass when every cold symbol has been visited this pass.
    const coldCovered = new Set(state.coldCoveredThisPass.map((s) => s.toUpperCase()));
    const coldComplete = cold.every((symbol) => coldCovered.has(symbol.toUpperCase()));
    if (coldComplete && cold.length > 0) {
      const passStart = Date.parse(state.passStartedAt || "") || started;
      state.lastFullEligibleUniverseAt = new Date().toISOString();
      state.lastFullEligibleUniverseDurationMs = Date.now() - passStart;
      state.passStartedAt = new Date().toISOString();
      state.coveredThisPass = [...hotSet];
      state.coldCoveredThisPass = [];
      state.cursor = 0;
    }

    state.updatedAt = new Date().toISOString();
    await saveState(state);

    return {
      ok: true,
      analyzed,
      skippedWeight: false,
      coverage: buildColdCoverage({
        state,
        hotSelected: hotSet.size,
        hotAnalyzed,
      }),
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      analyzed: [],
      skippedWeight: false,
      coverage: buildColdCoverage({
        state: getColdUniverseState(),
        hotSelected: hotSet.size,
        hotAnalyzed,
        workerStatus: "error",
      }),
      durationMs: Date.now() - started,
      error: message,
    };
  }
}

/** Test helper */
export function resetColdUniverseStateForTests() {
  g.__pippinwayColdUniverse = emptyState();
}
