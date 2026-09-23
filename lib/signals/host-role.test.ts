import { describe, expect, it } from "vitest";
import { binanceScanningAllowed, isVercelRuntime, preferPublishedScanSnapshot } from "./host-role";
import { compactScannerResponse, filterSnapshotForMode } from "./scan-snapshot";
import { DEFAULT_SETTINGS, type ScannerResponse } from "@/lib/signals-engine/types";

describe("host role", () => {
  it("blocks Binance scanning on Vercel unless explicitly overridden", () => {
    const prevVercel = process.env.VERCEL;
    const prevAllow = process.env.SIGNALS_ALLOW_BINANCE_ON_VERCEL;
    process.env.VERCEL = "1";
    delete process.env.SIGNALS_ALLOW_BINANCE_ON_VERCEL;
    expect(isVercelRuntime()).toBe(true);
    expect(binanceScanningAllowed()).toBe(false);
    expect(preferPublishedScanSnapshot()).toBe(true);
    process.env.SIGNALS_ALLOW_BINANCE_ON_VERCEL = "1";
    expect(binanceScanningAllowed()).toBe(true);
    process.env.VERCEL = prevVercel;
    process.env.SIGNALS_ALLOW_BINANCE_ON_VERCEL = prevAllow;
  });
});

describe("scan snapshot helpers", () => {
  it("compacts heavy coin fields and filters mode 15 to the core watchlist", () => {
    const response: ScannerResponse = {
      settings: DEFAULT_SETTINGS,
      fetchedAt: new Date().toISOString(),
      pricesUpdatedAt: new Date().toISOString(),
      stale: false,
      warnings: [],
      coins: [
        {
          symbol: "BTCUSDT",
          available: true,
          price: 1,
          priceUpdatedAt: null,
          changePct: 1,
          quoteVolume: 100,
          direction: "LONG",
          scanState: "ready",
          stale: false,
          setup: null,
          timeframes: [{ interval: "15m" } as never],
          context: { foo: 1 } as never,
        } as never,
        {
          symbol: "AAAUSDT",
          available: true,
          price: 2,
          priceUpdatedAt: null,
          changePct: 2,
          quoteVolume: 200,
          direction: "WAIT",
          scanState: "ready",
          stale: false,
          setup: null,
          timeframes: [{ interval: "1h" } as never],
          context: null,
        } as never,
      ],
      universe: { mode: "50", eligible: 500, selected: 2, listedAt: new Date().toISOString() },
    };
    const compact = compactScannerResponse(response);
    expect(compact.coins[0].timeframes).toEqual([]);
    expect(compact.coins[0].context).toBeNull();
    const free = filterSnapshotForMode(response, "15");
    expect(free.coins.every((coin) => coin.symbol === "BTCUSDT")).toBe(true);
  });
});
