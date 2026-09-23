import { describe, expect, it } from "vitest";
import { publicEligibleCoin, splitFreeDashboard } from "./free-daily";
import type { CoinScan } from "@/lib/signals-engine/types";

function coin(symbol: string, extra: Partial<CoinScan> = {}): CoinScan {
  return {
    symbol,
    available: true,
    price: 100,
    changePct: 1.25,
    quoteVolume: 10,
    priceUpdatedAt: "2026-09-22T12:00:00.000Z",
    stale: false,
    trend: "BULLISH",
    direction: "LONG",
    pattern: "None",
    patternStatus: "UNCONFIRMED",
    timeframes: [],
    setup: { entry: 100, stop: 99, target: 102 } as CoinScan["setup"],
    entryConditions: "test",
    reason: "test",
    nextStep: "test",
    lastCandleCloseAt: null,
    analyzedAt: "2026-09-22T12:00:00.000Z",
    ...extra,
  };
}

describe("free daily dashboard split", () => {
  it("does not treat watchlist loading as a reveal", () => {
    const view = splitFreeDashboard({
      coins: [coin("BTCUSDT"), coin("ETHUSDT"), coin("BNBUSDT")],
      watchlist: ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
      revealed: [],
    });
    expect(view.signals).toEqual([]);
    expect(view.eligible.map((item) => item.symbol)).toEqual(["BTCUSDT", "ETHUSDT", "BNBUSDT"]);
    expect(view.eligible.every((item) => item.locked)).toBe(true);
  });

  it("returns full revealed coins and keeps the rest eligible", () => {
    const view = splitFreeDashboard({
      coins: [coin("BTCUSDT"), coin("ETHUSDT"), coin("BNBUSDT")],
      watchlist: ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
      revealed: ["ETHUSDT"],
    });
    expect(view.signals.map((item) => item.symbol)).toEqual(["ETHUSDT"]);
    expect(view.eligible.map((item) => item.symbol)).toEqual(["BTCUSDT", "BNBUSDT"]);
  });

  it("redacts eligible coins to public market fields", () => {
    const preview = publicEligibleCoin(coin("BTCUSDT", { setup: { entry: 1, stop: 2, target: 3 } as CoinScan["setup"] }));
    expect(preview).toEqual({
      symbol: "BTCUSDT",
      locked: true,
      price: 100,
      changePct: 1.25,
      stale: false,
      available: true,
      scanState: undefined,
    });
    expect(preview).not.toHaveProperty("setup");
    expect(preview).not.toHaveProperty("direction");
  });
});
