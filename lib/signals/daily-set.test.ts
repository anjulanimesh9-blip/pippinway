import { describe, expect, it } from "vitest";
import { isActionableFreeSignal, isScanReadyForFreeze, pickDailyFreeSignals } from "./daily-set";

function coin(partial: Record<string, unknown>) {
  return {
    symbol: "BTCUSDT",
    available: true,
    direction: "LONG",
    setup: { entry: 1, stop: 0.9, target: 1.2 },
    patternStatus: "CONFIRMED",
    quoteVolume: 100,
    analyzedAt: "2026-09-22T12:00:00.000Z",
    ...partial,
  };
}

describe("daily free signal selection", () => {
  it("ignores WAIT, closed, and missing setups", () => {
    expect(isActionableFreeSignal(coin({ direction: "WAIT" }))).toBe(false);
    expect(isActionableFreeSignal(coin({ setup: null }))).toBe(false);
    expect(isActionableFreeSignal(coin({ lifecycle: { status: "EXPIRED" } }))).toBe(false);
    expect(isActionableFreeSignal(coin({}))).toBe(true);
  });

  it("freezes an existing daily set and does not invent fillers", () => {
    const coins = [
      coin({ symbol: "ETHUSDT", quoteVolume: 9 }),
      coin({ symbol: "BTCUSDT", quoteVolume: 99 }),
      coin({ symbol: "SOLUSDT", direction: "WAIT", setup: null }),
    ];
    expect(pickDailyFreeSignals(coins, ["ETHUSDT"], 4)).toEqual(["ETHUSDT"]);
    expect(pickDailyFreeSignals(coins, [], 4)).toEqual(["BTCUSDT", "ETHUSDT"]);
  });

  it("does not freeze while the scan is still pending", () => {
    expect(isScanReadyForFreeze({ coins: [{}], progress: { pending: 4, running: true }, universe: { selected: 15 } })).toBe(false);
    expect(isScanReadyForFreeze({ coins: new Array(15), progress: { pending: 0, scanned: 15, running: false }, universe: { selected: 15 } })).toBe(true);
  });
});
