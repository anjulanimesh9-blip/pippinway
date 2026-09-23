import { describe, expect, it } from "vitest";
import { analyzeTimeframe, buildCoinScan } from "./signals";
import { fixtureFilters } from "./exchange-fixtures";
import { compareEngines, walkForwardSignals } from "./verify-backtest";
import { verifySignal } from "./verify";
import { SCAN_INTERVALS, SCAN_SYMBOLS, type Candle, type TimeframeSnapshot } from "./types";

function candles(count: number, start = 10, drift = 0.01): Candle[] {
  const rows: Candle[] = [];
  let price = start;
  for (let i = 0; i < count; i++) {
    price *= 1 + ((i % 7) - 3) * drift * 0.15;
    const open = price;
    const close = price * (1 + ((i % 5) - 2) * drift * 0.05);
    rows.push({
      openTime: 1_700_000_000_000 + i * 900_000,
      open,
      high: Math.max(open, close) * 1.002,
      low: Math.min(open, close) * 0.998,
      close,
      volume: 1000 + (i % 4) * 200,
      closed: true,
    });
  }
  return rows;
}

function snapshot(interval: string, extras: Partial<TimeframeSnapshot> = {}): TimeframeSnapshot {
  const base = analyzeTimeframe(candles(80), interval);
  return { ...base, interval, ...extras };
}

describe("verification engine", () => {
  it("ignores a forming candle so confirmation uses only closed bars", () => {
    const closed = candles(80);
    const forming = {
      ...closed[closed.length - 1],
      openTime: closed[closed.length - 1].openTime + 900_000,
      close: closed[closed.length - 1].close * 1.2,
      closed: false,
    };
    const fromClosed = analyzeTimeframe(closed, "15m");
    const withForming = analyzeTimeframe([...closed, forming], "15m");
    expect(withForming.price).toBe(fromClosed.price);
    expect(withForming.lastClosedAt).toBe(fromClosed.lastClosedAt);
  });

  it("returns WAIT with INSUFFICIENT DATA when candles are missing", () => {
    const result = verifySignal({ snapshots: [], stale: false, error: "No candles", symbol: "BTCUSDT" });
    expect(result.direction).toBe("WAIT");
    expect(result.quality.label).toBe("INSUFFICIENT DATA");
    expect(result.quality.executionEligible).toBe(false);
  });

  it("returns WAIT with INSUFFICIENT DATA when data is stale", () => {
    const result = verifySignal({ snapshots: [snapshot("15m")], stale: true, symbol: "ETHUSDT" });
    expect(result.direction).toBe("WAIT");
    expect(result.quality.label).toBe("INSUFFICIENT DATA");
  });

  it("accepts a confirmed 1h pattern even when a 4h snapshot is present", () => {
    const mid = snapshot("15m", { trend: "BULLISH", breakout: "NONE", rsiDivergence: "NONE", patterns: [] });
    const hourly = snapshot("1h", {
      trend: "BULLISH",
      patterns: [{
        name: "Double Bottom",
        bias: "BULLISH",
        status: "CONFIRMED",
        evidence: ["Closed above the neckline"],
        invalidation: "Invalid if the neckline fails.",
      }],
    });
    const four = snapshot("4h", { trend: "BULLISH", patterns: [] });
    const result = verifySignal({ snapshots: [mid, hourly, four], stale: false, symbol: "LTCUSDT" });
    expect(result.direction).toBe("LONG");
    expect(result.quality.executionEligible).toBe(true);
    expect(result.patternName).toBe("Double Bottom");
  });

  it("does not treat a forming pattern as a trade", () => {
    const mid = snapshot("15m", {
      trend: "MIXED",
      breakout: "NONE",
      rsiDivergence: "NONE",
      patterns: [{
        name: "Ascending Triangle",
        bias: "BULLISH",
        status: "FORMING",
        evidence: ["Developing only"],
        invalidation: "Invalid if the base breaks.",
      }],
    });
    const result = verifySignal({ snapshots: [mid, snapshot("1h", { trend: "MIXED" })], stale: false, symbol: "XTZUSDT" });
    expect(result.direction).toBe("WAIT");
    expect(["DEVELOPING SETUP", "CONFLICTING EVIDENCE", "INSUFFICIENT DATA"]).toContain(result.quality.label);
  });

  it.each([...SCAN_SYMBOLS])("buildCoinScan stays WAIT or a verified side for %s", (symbol) => {
    const scan = buildCoinScan({
      symbol,
      filters: fixtureFilters(symbol),
      snapshots: SCAN_INTERVALS.map((interval) => snapshot(interval)),
      livePrice: 10,
      priceUpdatedAt: new Date().toISOString(),
      stale: false,
    });
    expect(["LONG", "SHORT", "WAIT"]).toContain(scan.direction);
    expect(scan.quality?.label).toBeTruthy();
    if (scan.direction === "WAIT") expect(scan.setup).toBeNull();
    if (scan.setup) {
      expect(scan.setup.entry).toBe(scan.originalEntry);
      expect(scan.setup.tickSize).toBe(fixtureFilters(symbol).tickSize);
    }
  });

  it.each([...SCAN_INTERVALS])("analyzeTimeframe(%s) fills structure, divergence and volume fields", (interval) => {
    const row = analyzeTimeframe(candles(90), interval);
    expect(row.structure.length).toBeGreaterThan(0);
    expect(["BULLISH", "BEARISH", "NONE"]).toContain(row.rsiDivergence);
    expect(["BULLISH", "BEARISH", "NONE"]).toContain(row.candleConfirm);
    expect(["HELD", "FAILED", "NONE"]).toContain(row.retest);
    expect(typeof row.volumeAnomaly).toBe("boolean");
  });
});

describe("historical engine comparison", () => {
  it("compares v1 and v2 on the same synthetic out-of-sample path without claiming guaranteed accuracy", () => {
    const path = candles(160, 20, 0.02);
    const previous = walkForwardSignals({ symbol: "XTZUSDT", interval: "15m", candles: path, engine: "v1" });
    const upgraded = walkForwardSignals({ symbol: "XTZUSDT", interval: "15m", candles: path, engine: "v2" });
    const comparison = compareEngines(previous, upgraded);
    expect(comparison.previousSignals).toBeGreaterThanOrEqual(0);
    expect(comparison.upgradedSignals).toBeGreaterThanOrEqual(0);
    expect(comparison.note).toContain("does not guarantee future");
    if (comparison.falseSignalsDecreased !== true) {
      expect(comparison.note).toContain("No improved-accuracy claim");
    }
  });
});
