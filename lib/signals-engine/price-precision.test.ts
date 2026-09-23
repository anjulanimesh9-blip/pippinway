import { describe, expect, it } from "vitest";
import { EXCHANGE_FILTER_FIXTURES, FIXTURE_PRICES } from "./exchange-fixtures";
import { displayDecimals, formatPriceByTick, roundToTick } from "./trading";
import { SCAN_INTERVALS, SCAN_SYMBOLS } from "./types";

describe("Binance tick-size price precision", () => {
  it.each([...SCAN_SYMBOLS])("keeps %s numeric price unchanged while formatting to exchange precision", (symbol) => {
    const filters = EXCHANGE_FILTER_FIXTURES[symbol];
    const price = FIXTURE_PRICES[symbol];
    const rounded = roundToTick(price, filters.tickSize);
    expect(Math.abs(rounded - price)).toBeLessThan(filters.tickSize + 1e-12);
    const formatted = formatPriceByTick(price, filters.tickSize, filters.pricePrecision);
    expect(Number(formatted.replace(/,/g, ""))).toBeCloseTo(price, 8);
    expect(formatted.split(".")[1]?.length || 0).toBe(displayDecimals(filters.tickSize, filters.pricePrecision));
  });

  it("formats XTZUSDT with Binance pricePrecision trailing zeros without changing the price", () => {
    const filters = EXCHANGE_FILTER_FIXTURES.XTZUSDT;
    expect(filters.tickSize).toBe(0.0001);
    expect(filters.pricePrecision).toBe(6);
    expect(formatPriceByTick(0.3392, filters.tickSize, filters.pricePrecision)).toBe("0.339200");
    expect(formatPriceByTick(0.335, filters.tickSize, filters.pricePrecision)).toBe("0.335000");
    expect(roundToTick(0.33923, filters.tickSize)).toBe(0.3392);
    expect(roundToTick(0.3392, filters.tickSize)).toBe(0.3392);
  });

  it("uses tickSize for increments, not a guessed decimal count", () => {
    expect(roundToTick(115000.14, 0.1)).toBe(115000.1);
    expect(roundToTick(0.150004, 0.00001)).toBe(0.15000);
    expect(formatPriceByTick(0.15, 0.00001, 5)).toBe("0.15000");
  });

  it("scans 1m, 5m, 15m, 1H and 4H", () => {
    expect([...SCAN_INTERVALS]).toEqual(["1m", "5m", "15m", "1h", "4h"]);
  });
});
