import { describe, expect, it } from "vitest";
import { SCAN_SYMBOLS } from "./types";

const LIVE = process.env.SIGNALS_LIVE_TEST === "1";

describe("live Binance read-only integration", () => {
  it("verifies all 15 symbols against exchangeInfo when SIGNALS_LIVE_TEST=1", async () => {
    if (!LIVE) {
      expect(SCAN_SYMBOLS).toHaveLength(15);
      return;
    }
    const response = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo", {
      headers: { Accept: "application/json" },
    });
    expect(response.ok).toBe(true);
    const body = (await response.json()) as { symbols?: Array<{ symbol: string; status: string; contractType?: string; quoteAsset?: string }> };
    const listed = new Map((body.symbols || []).map((item) => [item.symbol, item]));
    const eligible = (body.symbols || []).filter((item) => item.status === "TRADING" && item.contractType === "PERPETUAL" && item.quoteAsset === "USDT");
    expect(eligible.length).toBeGreaterThan(15);
    for (const symbol of SCAN_SYMBOLS) {
      const row = listed.get(symbol);
      expect(row, `${symbol} missing from Binance`).toBeTruthy();
      expect(row?.status).toBe("TRADING");
    }
  });

  it("counts live eligible USDT-M perpetuals when SIGNALS_LIVE_TEST=1", async () => {
    if (!LIVE) {
      expect(SCAN_SYMBOLS).toHaveLength(15);
      return;
    }
    const response = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo", {
      headers: { Accept: "application/json" },
    });
    expect(response.ok).toBe(true);
    const body = (await response.json()) as { symbols?: Array<{ symbol: string; status: string; contractType?: string; quoteAsset?: string }> };
    const eligible = (body.symbols || []).filter((item) => item.status === "TRADING" && item.contractType === "PERPETUAL" && item.quoteAsset === "USDT");
    expect(eligible.length).toBeGreaterThan(15);
    expect(eligible.some((item) => item.symbol === "BTCUSDT")).toBe(true);
  });

  it("reads public ticker prices without placing orders when SIGNALS_LIVE_TEST=1", async () => {
    if (!LIVE) {
      expect(true).toBe(true);
      return;
    }
    const response = await fetch("https://fapi.binance.com/fapi/v1/ticker/price");
    expect(response.ok).toBe(true);
    const rows = (await response.json()) as Array<{ symbol: string; price: string }>;
    const wanted = new Set<string>(SCAN_SYMBOLS);
    const hits = rows.filter((row) => wanted.has(row.symbol));
    expect(hits.length).toBe(15);
    for (const row of hits) {
      expect(Number(row.price)).toBeGreaterThan(0);
    }
  });
});
