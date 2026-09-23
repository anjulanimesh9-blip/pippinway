import { describe, expect, it } from "vitest";
import { isActionableSetup, matchesStatusFilter, statusBucket } from "./status";
import type { CoinScan } from "@/lib/signals-engine/types";

function coin(partial: Partial<CoinScan>): CoinScan {
  return {
    symbol: "BTCUSDT",
    available: true,
    price: 100,
    changePct: 1,
    priceUpdatedAt: null,
    stale: false,
    trend: "MIXED",
    direction: "WAIT",
    pattern: "None",
    patternStatus: "UNCONFIRMED",
    timeframes: [],
    setup: null,
    entryConditions: "",
    reason: "",
    nextStep: "",
    lastCandleCloseAt: null,
    analyzedAt: "2026-09-22T00:00:00.000Z",
    ...partial,
  };
}

describe("signal status buckets", () => {
  it("does not treat WAIT as an actionable setup", () => {
    expect(isActionableSetup(coin({ direction: "WAIT" }))).toBe(false);
    expect(statusBucket(coin({ direction: "WAIT" }))).toBe("WAIT");
    expect(matchesStatusFilter(coin({ direction: "WAIT" }), "SETUPS")).toBe(false);
  });

  it("keeps direction and closed lifecycle separate", () => {
    const waiting = coin({
      direction: "LONG",
      setup: { entry: 1, stop: 0.9, target: 1.3 } as CoinScan["setup"],
      lifecycle: { status: "WAITING_FOR_ENTRY" } as CoinScan["lifecycle"],
    });
    expect(statusBucket(waiting)).toBe("LONG");
    expect(matchesStatusFilter(waiting, "SETUPS")).toBe(true);
    const closed = coin({
      direction: "LONG",
      setup: { entry: 1, stop: 0.9, target: 1.3 } as CoinScan["setup"],
      lifecycle: { status: "INVALIDATED" } as CoinScan["lifecycle"],
    });
    expect(statusBucket(closed)).toBe("INVALIDATED");
    expect(matchesStatusFilter(closed, "SETUPS")).toBe(false);
    expect(matchesStatusFilter(closed, "INVALIDATED")).toBe(true);
  });

  it("separates stale coins from validated setups", () => {
    const stale = coin({ stale: true, direction: "WAIT" });
    expect(statusBucket(stale)).toBe("STALE");
    expect(matchesStatusFilter(stale, "STALE")).toBe(true);
    expect(matchesStatusFilter(stale, "SETUPS")).toBe(false);
  });

  it("keeps validated LONG/SHORT in the default setups filter", () => {
    const long = coin({
      direction: "LONG",
      setup: { entry: 1, stop: 0.9, target: 1.2 } as CoinScan["setup"],
    });
    expect(isActionableSetup(long)).toBe(true);
    expect(matchesStatusFilter(long, "SETUPS")).toBe(true);
    expect(matchesStatusFilter(long, "LONG")).toBe(true);
  });

  it("marks pending coins separately from signals", () => {
    const pending = coin({ scanState: "pending", direction: "LONG" });
    expect(statusBucket(pending)).toBe("PENDING");
    expect(matchesStatusFilter(pending, "SETUPS")).toBe(false);
  });
});
