import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./scanner", () => ({
  scanSymbol: vi.fn(async (symbol: string) => ({ symbol, direction: "WAIT" })),
}));

vi.mock("./universe", () => ({
  resolveUniverse: vi.fn(async () => ({
    mode: "all",
    eligible: 8,
    selected: 8,
    listedAt: new Date().toISOString(),
    symbols: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT"],
  })),
}));

vi.mock("./rate-limit", () => ({
  canSpend: vi.fn(() => true),
  awaitBudget: vi.fn(async () => undefined),
  weightSnapshot: vi.fn(() => ({ used: 100, limit: 2400, circuitOpen: false })),
}));

import { scanSymbol } from "./scanner";
import {
  buildColdCoverage,
  COLD_BATCH_SIZE,
  resetColdUniverseStateForTests,
  runColdUniverseBatch,
} from "./cold-universe";
import { getColdUniverseState } from "./cold-universe";

describe("cold-universe scanner", () => {
  beforeEach(async () => {
    resetColdUniverseStateForTests();
    vi.mocked(scanSymbol).mockReset();
    vi.mocked(scanSymbol).mockImplementation(async (symbol: string) => ({ symbol, direction: "WAIT" }));
    const { canSpend, awaitBudget } = await import("./rate-limit");
    vi.mocked(canSpend).mockReset();
    vi.mocked(canSpend).mockReturnValue(true);
    vi.mocked(awaitBudget).mockReset();
    vi.mocked(awaitBudget).mockResolvedValue(undefined);
  });

  afterEach(() => {
    resetColdUniverseStateForTests();
  });

  it("analyzes only non-hot symbols in bounded batches", async () => {
    const hot = ["BTCUSDT", "ETHUSDT"];
    const result = await runColdUniverseBatch(hot, { batchSize: 3, hotAnalyzed: 2 });
    expect(result.ok).toBe(true);
    expect(result.skippedWeight).toBe(false);
    expect(result.analyzed).toHaveLength(3);
    expect(result.analyzed.every((symbol) => !hot.includes(symbol))).toBe(true);
    expect(scanSymbol).toHaveBeenCalledTimes(3);
    expect(result.coverage.eligibleUniverse).toBe(8);
    expect(result.coverage.hotUniverseSelected).toBe(2);
    expect(result.coverage.coldUniverseSize).toBe(6);
    expect(result.coverage.coldUniverseAnalyzed).toBe(3);
    expect(result.coverage.fullUniverseCoverageCount).toBeGreaterThanOrEqual(5);
  });

  it("rotates the cursor across subsequent batches until cold coverage completes", async () => {
    const hot = ["BTCUSDT", "ETHUSDT"];
    const first = await runColdUniverseBatch(hot, { batchSize: 3, hotAnalyzed: 2 });
    const second = await runColdUniverseBatch(hot, { batchSize: 3, hotAnalyzed: 2 });
    expect(first.analyzed).toHaveLength(3);
    expect(second.analyzed).toHaveLength(3);
    const overlap = first.analyzed.filter((symbol) => second.analyzed.includes(symbol));
    expect(overlap).toHaveLength(0);
    // Second batch finishes the cold size of 6 and starts a new pass.
    expect(second.coverage.lastFullEligibleUniverseAt).toBeTruthy();
    const state = getColdUniverseState();
    expect(state.coldCoveredThisPass.length).toBe(0);
    expect(state.cursor).toBe(0);
  });

  it("skips the batch when request weight is exhausted", async () => {
    const { canSpend } = await import("./rate-limit");
    vi.mocked(canSpend).mockReturnValueOnce(false);
    const result = await runColdUniverseBatch(["BTCUSDT"], { batchSize: 5 });
    expect(result.skippedWeight).toBe(true);
    expect(result.analyzed).toEqual([]);
    expect(scanSymbol).not.toHaveBeenCalled();
  });

  it("does not skip cold symbols when weight breaks mid-batch", async () => {
    const { canSpend } = await import("./rate-limit");
    // Initial reserve check + two symbols, then refuse the third.
    vi.mocked(canSpend)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const hot = ["BTCUSDT", "ETHUSDT"];
    const first = await runColdUniverseBatch(hot, { batchSize: 5, hotAnalyzed: 2 });
    expect(first.analyzed).toHaveLength(2);
    expect(scanSymbol).toHaveBeenCalledTimes(2);
    const cursorAfterPartial = getColdUniverseState().cursor;
    expect(cursorAfterPartial).toBe(2);

    vi.mocked(canSpend).mockReturnValue(true);
    vi.mocked(scanSymbol).mockClear();
    const second = await runColdUniverseBatch(hot, { batchSize: 2, hotAnalyzed: 2 });
    expect(second.analyzed).toHaveLength(2);
    // Next symbols continue from the partial cursor (alphabetical cold after BTC/ETH).
    expect(second.analyzed[0]).toBe("BNBUSDT");
    const overlap = first.analyzed.filter((symbol) => second.analyzed.includes(symbol));
    expect(overlap).toHaveLength(0);
  });

  it("keeps rolling coverage across cycles instead of restarting at batch 0", async () => {
    const hot = ["BTCUSDT", "ETHUSDT"];
    await runColdUniverseBatch(hot, { batchSize: 2, hotAnalyzed: 2 });
    const mid = getColdUniverseState();
    expect(mid.cursor).toBe(2);
    expect(mid.coldCoveredThisPass).toHaveLength(2);
    await runColdUniverseBatch(hot, { batchSize: 2, hotAnalyzed: 2 });
    const next = getColdUniverseState();
    expect(next.cursor).toBe(4);
    expect(next.coldCoveredThisPass).toHaveLength(4);
    expect(next.lastFullEligibleUniverseAt).toBeNull();
  });

  it("continues the batch when a single symbol throws", async () => {
    vi.mocked(scanSymbol)
      .mockRejectedValueOnce(new Error("kline timeout"))
      .mockResolvedValue({ symbol: "OK", direction: "WAIT" } as never);
    const hot = ["BTCUSDT", "ETHUSDT"];
    const result = await runColdUniverseBatch(hot, { batchSize: 3, hotAnalyzed: 2 });
    expect(result.ok).toBe(true);
    expect(result.analyzed).toHaveLength(3);
    expect(scanSymbol).toHaveBeenCalledTimes(3);
  });

  it("buildColdCoverage reports percent and ETA fields", () => {
    resetColdUniverseStateForTests();
    const state = getColdUniverseState();
    state.eligibleCount = 100;
    state.coldUniverseSize = 50;
    state.coveredThisPass = ["A", "B", "C"];
    state.coldCoveredThisPass = ["A", "B"];
    state.passStartedAt = new Date().toISOString();
    state.cursor = 10;
    const coverage = buildColdCoverage({ state, hotSelected: 50, hotAnalyzed: 50 });
    expect(coverage.fullUniverseCoveragePct).toBeGreaterThan(0);
    expect(coverage.currentColdBatch).toMatch(/\d+\/\d+/);
    expect(coverage.nextExpectedFullEligibleUniverseAt).toBeTruthy();
    expect(coverage.requestWeightLimit).toBe(2400);
  });

  it("keeps default analysis batch size at a safe controlled value", () => {
    expect(COLD_BATCH_SIZE).toBeGreaterThanOrEqual(10);
    expect(COLD_BATCH_SIZE).toBeLessThanOrEqual(80);
  });
});
