import type { SymbolFilters } from "./types";

/** Deterministic Binance USDT-M filters captured 2026-09-22 for tests and offline fallback. */
export const EXCHANGE_FILTER_FIXTURES: Record<string, SymbolFilters> = {
  BTCUSDT: { symbol: "BTCUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.1, stepSize: 0.001, minQty: 0.001, minNotional: 50, available: true, maintMarginRatio: 0.004, pricePrecision: 2 },
  BNBUSDT: { symbol: "BNBUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.01, minQty: 0.01, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 3 },
  ETHUSDT: { symbol: "ETHUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 20, available: true, maintMarginRatio: 0.005, pricePrecision: 2 },
  BCHUSDT: { symbol: "BCHUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 20, available: true, maintMarginRatio: 0.01, pricePrecision: 2 },
  XRPUSDT: { symbol: "XRPUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.0001, stepSize: 0.1, minQty: 0.1, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 4 },
  LTCUSDT: { symbol: "LTCUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 20, available: true, maintMarginRatio: 0.01, pricePrecision: 2 },
  TRXUSDT: { symbol: "TRXUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.00001, stepSize: 1, minQty: 1, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 5 },
  ETCUSDT: { symbol: "ETCUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.001, stepSize: 0.01, minQty: 0.01, minNotional: 20, available: true, maintMarginRatio: 0.01, pricePrecision: 3 },
  LINKUSDT: { symbol: "LINKUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.001, stepSize: 0.01, minQty: 0.01, minNotional: 20, available: true, maintMarginRatio: 0.01, pricePrecision: 3 },
  XLMUSDT: { symbol: "XLMUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.00001, stepSize: 1, minQty: 1, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 5 },
  ADAUSDT: { symbol: "ADAUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.0001, stepSize: 1, minQty: 1, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 5 },
  XMRUSDT: { symbol: "XMRUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 2 },
  DASHUSDT: { symbol: "DASHUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 2 },
  ZECUSDT: { symbol: "ZECUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.01, stepSize: 0.001, minQty: 0.001, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 2 },
  XTZUSDT: { symbol: "XTZUSDT", status: "TRADING", contractType: "PERPETUAL", tickSize: 0.0001, stepSize: 0.1, minQty: 0.1, minNotional: 5, available: true, maintMarginRatio: 0.01, pricePrecision: 6 },
};

export const UNAVAILABLE_FIXTURE: SymbolFilters = {
  symbol: "FAKEUSDT",
  status: "NOT_LISTED",
  contractType: "",
  tickSize: 0.01,
  stepSize: 0.001,
  minQty: 0.001,
  minNotional: 5,
  available: false,
  reason: "Not listed on Binance USDT-M Futures",
};

/** Deterministic mid-market prices for parameterized finance tests. */
export const FIXTURE_PRICES: Record<string, number> = {
  BTCUSDT: 115000,
  BNBUSDT: 600,
  ETHUSDT: 4000,
  BCHUSDT: 500,
  XRPUSDT: 0.55,
  LTCUSDT: 80,
  TRXUSDT: 0.15,
  ETCUSDT: 20,
  LINKUSDT: 15,
  XLMUSDT: 0.3,
  ADAUSDT: 0.45,
  XMRUSDT: 160,
  DASHUSDT: 25,
  ZECUSDT: 40,
  XTZUSDT: 0.7,
};

export function fixtureFilters(symbol: string): SymbolFilters {
  return EXCHANGE_FILTER_FIXTURES[symbol] || {
    ...UNAVAILABLE_FIXTURE,
    symbol,
    reason: `${symbol} has no filter fixture`,
  };
}
