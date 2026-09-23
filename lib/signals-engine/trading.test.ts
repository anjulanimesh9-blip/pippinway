import { describe, expect, it } from "vitest";
import { EXCHANGE_FILTER_FIXTURES, FIXTURE_PRICES, UNAVAILABLE_FIXTURE, fixtureFilters } from "./exchange-fixtures";
import { applyUserSettings } from "@/lib/signals/redact";
import { pnlForRecord } from "./history";
import { buildCoinScan } from "./signals";
import {
  TAKER_FEE,
  applyTradeSettings,
  buildSetup,
  estimateIsolatedLiquidation,
  floorToStep,
  geometryValid,
  roundToTick,
  pnlAtPrice,
  realizedPnlUSDT,
  sizePosition,
} from "./trading";
import { SCAN_SYMBOLS, type CoinScan, type SignalRecord, type TradeSetup } from "./types";

const SYMBOLS = [...SCAN_SYMBOLS];

function levels(direction: "LONG" | "SHORT", entry: number) {
  if (direction === "LONG") return { entry, stop: entry * 0.99, target: entry * 1.02 };
  return { entry, stop: entry * 1.01, target: entry * 0.98 };
}

function setupFor(
  symbol: string,
  direction: "LONG" | "SHORT",
  extras: {
    marginUSDT?: number;
    leverage?: number;
    marginMode?: "ISOLATED" | "CROSS";
    available?: boolean;
    withMmr?: boolean;
    stop?: number;
    target?: number;
  } = {},
) {
  const filters = {
    ...fixtureFilters(symbol),
    available: extras.available ?? true,
    maintMarginRatio: extras.withMmr === false ? undefined : fixtureFilters(symbol).maintMarginRatio,
  };
  const entry = FIXTURE_PRICES[symbol];
  const geo = levels(direction, entry);
  return buildSetup({
    direction,
    entry,
    stop: extras.stop ?? geo.stop,
    target: extras.target ?? geo.target,
    filters,
    marginUSDT: extras.marginUSDT ?? 100,
    leverage: extras.leverage ?? 20,
    marginMode: extras.marginMode ?? "ISOLATED",
  });
}

describe("exchange fixtures cover all 15 coins", () => {
  it("has filters and prices for every supported pair", () => {
    for (const symbol of SYMBOLS) {
      expect(EXCHANGE_FILTER_FIXTURES[symbol]?.available).toBe(true);
      expect(FIXTURE_PRICES[symbol]).toBeGreaterThan(0);
    }
  });
});

describe.each(SYMBOLS)("%s precision and sizing", (symbol) => {
  const filters = fixtureFilters(symbol);
  const entry = FIXTURE_PRICES[symbol];

  it("floors quantity to step size and never exceeds allocated notional", () => {
    const sized = sizePosition(entry, { marginUSDT: 100, leverage: 20 }, filters);
    const rawQty = (100 * 20) / entry;
    expect(sized.quantity).toBe(floorToStep(rawQty, filters.stepSize));
    expect(sized.quantity).toBe(floorToStep(sized.quantity + filters.stepSize * 0.4, filters.stepSize));
    expect(sized.notionalUSDT).toBeLessThanOrEqual(2000 + 1e-6);
    expect(sized.requiredMarginUSDT).toBeCloseTo(sized.notionalUSDT / 20, 3);
    expect(sized.entryFeeUSDT).toBeCloseTo(sized.notionalUSDT * TAKER_FEE, 3);
    expect(sized.exitFeeUSDT).toBeCloseTo(sized.notionalUSDT * TAKER_FEE, 3);
    expect(sized.totalFeesUSDT).toBeCloseTo(Number((sized.entryFeeUSDT + sized.exitFeeUSDT).toFixed(4)), 3);
    expect(sized.tickSize).toBe(filters.tickSize);
    expect(sized.stepSize).toBe(filters.stepSize);
    expect(sized.minQty).toBe(filters.minQty);
    expect(sized.minNotional).toBe(filters.minNotional);
  });

  it("fails the $1 / 20x default when rounded notional is below minNotional", () => {
    const sized = sizePosition(entry, { marginUSDT: 1, leverage: 20 }, filters);
    if (sized.notionalUSDT + 1e-9 < filters.minNotional || sized.quantity < filters.minQty || sized.quantity <= 0) {
      expect(sized.reasons.length).toBeGreaterThan(0);
    }
  });
});

describe.each(SYMBOLS)("%s LONG and SHORT finance", (symbol) => {
  for (const direction of ["LONG", "SHORT"] as const) {
    it(`${direction} uses shared engine math`, () => {
      const setup = setupFor(symbol, direction, { marginUSDT: 100, leverage: 20, withMmr: false });
      expect(setup).not.toBeNull();
      const row = setup as TradeSetup;
      const geo = levels(direction, FIXTURE_PRICES[symbol]);
      const tick = fixtureFilters(symbol).tickSize;
      expect(row.entry).toBe(roundToTick(geo.entry, tick));
      expect(row.stop).toBe(roundToTick(geo.stop, tick));
      expect(row.target).toBe(roundToTick(geo.target, tick));
      expect(geometryValid(direction, row.entry, row.stop, row.target)).toBe(true);

      const qty = row.quantity;
      const grossProfit = pnlAtPrice(direction, qty, row.entry, row.target);
      const grossLoss = Math.abs(pnlAtPrice(direction, qty, row.entry, row.stop));
      expect(row.grossProfitUSDT).toBeCloseTo(Number(grossProfit.toFixed(4)), 4);
      expect(row.grossLossUSDT).toBeCloseTo(Number(grossLoss.toFixed(4)), 4);
      expect(row.netProfitUSDT).toBeCloseTo(Number((grossProfit - row.totalFeesUSDT).toFixed(4)), 4);
      expect(row.netLossUSDT).toBeCloseTo(Number((grossLoss + row.totalFeesUSDT).toFixed(4)), 4);
      expect(row.estimatedProfitUSDT).toBe(row.netProfitUSDT);
      expect(row.estimatedLossUSDT).toBe(row.netLossUSDT);
      expect(row.grossRiskReward).toBeCloseTo(Number((grossProfit / grossLoss).toFixed(4)), 4);
      expect(row.netRiskReward).toBeCloseTo(Number((row.netProfitUSDT / row.netLossUSDT).toFixed(4)), 4);
      expect(row.riskReward).toBe(row.netRiskReward);
      expect(row.netRiskReward).toBeLessThan(row.grossRiskReward);
      expect(row.liquidationRisk).toBe("UNAVAILABLE");
      expect(row.liquidationEstimateUSDT).toBeNull();
    });
  }
});

describe("leverage and margin changes", () => {
  it.each(SYMBOLS)("%s resizes finance without changing prices or direction", (symbol) => {
    const original = setupFor(symbol, "LONG", { marginUSDT: 100, leverage: 20 }) as TradeSetup;
    const resized = applyTradeSettings(
      original,
      { marginUSDT: 300, leverage: 5, marginMode: "ISOLATED" },
      fixtureFilters(symbol),
      "LONG",
    );
    expect(resized.entry).toBe(original.entry);
    expect(resized.stop).toBe(original.stop);
    expect(resized.target).toBe(original.target);
    expect(resized.direction).toBe("LONG");
    expect(resized.leverage).toBe(5);
    expect(resized.allocatedMarginUSDT).toBe(300);
    expect(resized.notionalUSDT).toBeLessThan(original.notionalUSDT);
  });

  it("applyUserSettings never flips LONG/SHORT/WAIT", () => {
    const coins: CoinScan[] = SYMBOLS.map((symbol) => ({
      symbol,
      available: true,
      price: FIXTURE_PRICES[symbol],
      priceUpdatedAt: null,
      stale: false,
      trend: "BULLISH",
      direction: "LONG",
      pattern: "None",
      patternStatus: "UNCONFIRMED",
      timeframes: [],
      filters: fixtureFilters(symbol),
      setup: setupFor(symbol, "LONG", { marginUSDT: 50, leverage: 20 }),
      entryConditions: "test",
      reason: "test",
      nextStep: "test",
      lastCandleCloseAt: null,
      analyzedAt: new Date().toISOString(),
    }));
    const next = applyUserSettings(coins, {
      marginUSDT: 300,
      leverage: 5,
      marginMode: "CROSS",
      venue: "Binance USDT-M Futures",
      mode: "MANUAL",
      scanMode: "15",
      watchlist: [],
    });
    next.forEach((coin, index) => {
      expect(coin.direction).toBe("LONG");
      expect(coin.setup?.entry).toBe(coins[index].setup?.entry);
      expect(coin.setup?.stop).toBe(coins[index].setup?.stop);
      expect(coin.setup?.target).toBe(coins[index].setup?.target);
      expect(coin.setup?.marginMode).toBe("CROSS");
      expect(coin.setup?.liquidationRisk).toBe("UNKNOWN");
    });
  });
});

describe("invalid geometry is not silently rewritten", () => {
  it.each(SYMBOLS)("%s invalid LONG stays invalid with original prices", (symbol) => {
    const entry = FIXTURE_PRICES[symbol];
    const setup = buildSetup({
      direction: "LONG",
      entry,
      stop: entry * 1.02,
      target: entry * 0.98,
      filters: fixtureFilters(symbol),
      marginUSDT: 100,
      leverage: 20,
    });
    const tick = fixtureFilters(symbol).tickSize;
    expect(setup?.executable).toBe(false);
    expect(setup?.entry).toBe(roundToTick(entry, tick));
    expect(setup?.stop).toBe(roundToTick(entry * 1.02, tick));
    expect(setup?.target).toBe(roundToTick(entry * 0.98, tick));
    expect(setup?.executableReason).toContain("NOT EXECUTABLE");
    expect(setup?.validationReasons.some((item) => item.includes("stop-loss"))).toBe(true);
  });

  it.each(SYMBOLS)("%s invalid SHORT stays invalid with original prices", (symbol) => {
    const entry = FIXTURE_PRICES[symbol];
    const setup = buildSetup({
      direction: "SHORT",
      entry,
      stop: entry * 0.98,
      target: entry * 1.02,
      filters: fixtureFilters(symbol),
      marginUSDT: 100,
      leverage: 20,
    });
    const tick = fixtureFilters(symbol).tickSize;
    expect(setup?.executable).toBe(false);
    expect(setup?.stop).toBe(roundToTick(entry * 0.98, tick));
    expect(setup?.target).toBe(roundToTick(entry * 1.02, tick));
  });
});

describe("unavailable pairs", () => {
  it("does not emit an executable LONG/SHORT when the pair is unavailable", () => {
    const scan = buildCoinScan({
      symbol: "FAKEUSDT",
      filters: { ...UNAVAILABLE_FIXTURE },
      snapshots: [],
      livePrice: 1,
      priceUpdatedAt: null,
      stale: false,
    });
    expect(scan.direction).toBe("WAIT");
    expect(scan.setup).toBeNull();
    expect(scan.available).toBe(false);
  });

  it.each(SYMBOLS)("%s buildSetup is not executable when the filter is unavailable", (symbol) => {
    const setup = setupFor(symbol, "LONG", { available: false });
    expect(setup?.executable).toBe(false);
    expect(setup?.executableReason).toContain("NOT EXECUTABLE");
  });
});

describe("minimum order boundaries", () => {
  it("BTC $1 x 20 fails min notional after lot rounding", () => {
    const setup = setupFor("BTCUSDT", "LONG", { marginUSDT: 1, leverage: 20, withMmr: false });
    expect(setup?.executable).toBe(false);
    expect(setup?.quantity).toBe(0);
    expect(setup?.validationReasons.join(" ")).toMatch(/0|minNotional|Quantity/i);
  });

  it("BTC $50 x 20 can meet the $50 min notional", () => {
    const setup = setupFor("BTCUSDT", "LONG", { marginUSDT: 50, leverage: 20, withMmr: false });
    expect(setup?.notionalUSDT).toBeGreaterThanOrEqual(50);
    expect(setup?.quantity).toBeGreaterThanOrEqual(0.001);
    expect(setup?.executable).toBe(true);
  });

  it("LINK $1 x 20 often fails after step rounding", () => {
    const setup = setupFor("LINKUSDT", "LONG", { marginUSDT: 1, leverage: 20, withMmr: false });
    expect(setup?.notionalUSDT).toBeLessThan(20);
    expect(setup?.executable).toBe(false);
  });

  it("XLM integer step size floors quantity", () => {
    const sized = sizePosition(0.3, { marginUSDT: 1, leverage: 20 }, fixtureFilters("XLMUSDT"));
    expect(sized.stepSize).toBe(1);
    expect(sized.quantity).toBe(66);
    expect(sized.notionalUSDT).toBeCloseTo(19.8, 4);
  });

  it("quantity just below a step floors to the previous lot", () => {
    expect(floorToStep(0.0019, 0.001)).toBe(0.001);
    expect(floorToStep(0.0009, 0.001)).toBe(0);
    expect(floorToStep(1.99, 1)).toBe(1);
  });
});

describe("liquidation", () => {
  it("does not invent an isolated price without maintenance margin", () => {
    const estimate = estimateIsolatedLiquidation("LONG", 100, 20, undefined);
    expect(estimate.price).toBeNull();
    expect(estimate.risk).toBe("UNAVAILABLE");
  });

  it("marks isolated liquidation OK when the stop is closer than the estimate", () => {
    const setup = setupFor("BTCUSDT", "LONG", { marginUSDT: 100, leverage: 20, withMmr: true });
    expect(setup?.liquidationRisk).toBe("OK");
    expect(setup?.liquidationEstimateUSDT).not.toBeNull();
    expect(setup?.liquidationEstimateUSDT as number).toBeLessThan(setup!.stop);
  });

  it("flags isolated liquidation before a distant stop at 125x", () => {
    const setup = setupFor("BTCUSDT", "LONG", { marginUSDT: 500, leverage: 125, withMmr: true });
    expect(setup?.liquidationRisk).toBe("BEFORE_STOP");
    expect(setup?.executable).toBe(false);
    expect(setup?.executableReason).toContain("NOT EXECUTABLE");
  });

  it("keeps cross-margin liquidation unknown even when MMR exists", () => {
    const setup = setupFor("ETHUSDT", "SHORT", { marginUSDT: 100, leverage: 20, marginMode: "CROSS", withMmr: true });
    expect(setup?.liquidationRisk).toBe("UNKNOWN");
    expect(setup?.liquidationEstimateUSDT).toBeNull();
  });
});

describe("history snapshots", () => {
  it("closed P/L uses the stored quantity and fees, not current defaults", () => {
    const record: SignalRecord = {
      id: "xlm-test",
      symbol: "XLMUSDT",
      direction: "LONG",
      pattern: "None",
      patternStatus: "UNCONFIRMED",
      interval: "15m",
      entry: 0.3,
      stop: 0.297,
      target: 0.306,
      entryConditions: "test",
      openedAt: new Date().toISOString(),
      source: "live",
      outcome: "WIN",
      closedAt: new Date().toISOString(),
      exitPrice: 0.306,
      pnlUSDT: null,
      quantity: 66,
      totalFeesUSDT: 0.0198,
      marginUSDT: 1,
      leverage: 20,
      snapshotPreserved: true,
    };
    const pnl = pnlForRecord(record, 0.306, "WIN");
    expect(pnl).toBe(realizedPnlUSDT({
      direction: "LONG",
      entry: 0.3,
      exitPrice: 0.306,
      quantity: 66,
      totalFeesUSDT: 0.0198,
      outcome: "WIN",
    }));
    expect(pnl).toBeCloseTo(66 * 0.006 - 0.0198, 4);
  });
});
