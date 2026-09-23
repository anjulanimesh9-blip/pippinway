import { describe, expect, it } from "vitest";
import { resolvePlan } from "./access";
import { gateScanner } from "./redact";
import { DEFAULT_SIGNALS_CONFIG, DEFAULT_SIGNALS_SETTINGS } from "./config";
import { DEFAULT_SETTINGS, SCAN_SYMBOLS, type ScannerResponse } from "@/lib/signals-engine/types";

function scan(): ScannerResponse {
  return {
    settings: DEFAULT_SETTINGS,
    fetchedAt: new Date().toISOString(),
    pricesUpdatedAt: new Date().toISOString(),
    stale: false,
    warnings: [],
    coins: SCAN_SYMBOLS.map((symbol) => ({
      symbol,
      available: true,
      price: 1,
      priceUpdatedAt: new Date().toISOString(),
      stale: false,
      trend: "MIXED" as const,
      direction: "WAIT" as const,
      pattern: "None",
      patternStatus: "UNCONFIRMED" as const,
      timeframes: [],
      setup: null,
      entryConditions: "",
      reason: "",
      nextStep: "",
      lastCandleCloseAt: null,
      analyzedAt: new Date().toISOString(),
    })),
  };
}

const subscription = {
  membership: "free" as const,
  active: false,
  startedAt: null,
  expiresAt: null,
  expired: false,
  paymentId: null,
};

describe("subscription gating", () => {
  it("locks complete details for free users until a symbol is revealed", () => {
    const gated = gateScanner(scan(), {
      uid: "user-1",
      isAdmin: false,
      plan: "free",
      settings: DEFAULT_SIGNALS_SETTINGS,
      config: DEFAULT_SIGNALS_CONFIG,
      subscription,
    });
    expect(gated.coins.every((coin) => (coin as { locked?: boolean }).locked)).toBe(true);
    const revealed = gateScanner(scan(), {
      uid: "user-1",
      isAdmin: false,
      plan: "free",
      settings: DEFAULT_SIGNALS_SETTINGS,
      config: DEFAULT_SIGNALS_CONFIG,
      subscription,
    }, { revealed: ["BTCUSDT"] });
    expect((revealed.coins.find((coin) => coin.symbol === "BTCUSDT") as { locked?: boolean }).locked).toBe(false);
    expect((revealed.coins.find((coin) => coin.symbol === "XRPUSDT") as { locked?: boolean }).locked).toBe(true);
  });

  it("unlocks all pairs for pro and expired membership becomes free", () => {
    const gated = gateScanner(scan(), {
      uid: "pro-1",
      isAdmin: false,
      plan: "pro",
      settings: DEFAULT_SIGNALS_SETTINGS,
      config: DEFAULT_SIGNALS_CONFIG,
      subscription: { ...subscription, membership: "pro", active: true },
    });
    expect(gated.coins.every((coin) => !(coin as { locked?: boolean }).locked)).toBe(true);
    expect(resolvePlan({ isAdmin: false, membership: "pro", expiresAt: "2020-01-01T00:00:00.000Z" }).plan).toBe("free");
    expect(resolvePlan({ isAdmin: false, membership: "pro", expiresAt: "2099-01-01T00:00:00.000Z" }).plan).toBe("pro");
  });
});
