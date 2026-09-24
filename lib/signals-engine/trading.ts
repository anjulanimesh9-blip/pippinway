import { DEFAULT_SETTINGS, type Direction, type LiquidationRisk, type MarginMode, type SymbolFilters, type TradeSetup, type UserTradeSettings } from "./types";

export const TAKER_FEE = 0.0005;
export const DEFAULT_MARGIN_MODE: MarginMode = "ISOLATED";
export const MIN_NET_RISK_REWARD = 3;

/**
 * Legacy pattern publication path (restored): net R/R ≥ 3 is NOT required by default.
 * Set SIGNALS_REQUIRE_NET_RR=1 to re-enable the strict fee-aware floor.
 */
export function requirePublicationNetRr(): boolean {
  return process.env.SIGNALS_REQUIRE_NET_RR === "1";
}

export function passesPublicationRr(netRiskReward: number | null | undefined): boolean {
  return Number.isFinite(netRiskReward) && (netRiskReward as number) >= MIN_NET_RISK_REWARD;
}

export function isRrPublicationReject(reason?: string | null): boolean {
  return Boolean(reason && reason.includes("does not support a defensible 1:3"));
}

export function decimalsOf(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 0;
  const text = step.toString();
  if (text.includes("e-")) return Number(text.split("e-")[1]) || 0;
  return text.includes(".") ? text.split(".")[1].replace(/0+$/, "").length || text.split(".")[1].length : 0;
}

export function floorToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) return 0;
  const precision = decimalsOf(step);
  const floored = Math.floor((value + 1e-12) / step) * step;
  return Number(floored.toFixed(precision));
}

export function roundToTick(price: number, tick: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(tick) || tick <= 0) return price;
  return Number((Math.round(price / tick) * tick).toFixed(decimalsOf(tick)));
}

export function formatByStep(value: number, step: number): string {
  return value.toFixed(Math.max(0, decimalsOf(step)));
}

export function displayDecimals(tickSize: number, pricePrecision?: number): number {
  if (pricePrecision != null && Number.isFinite(pricePrecision) && pricePrecision >= 0) return pricePrecision;
  return Math.max(0, decimalsOf(tickSize));
}

export function formatPriceByTick(value: number, tickSize: number, pricePrecision?: number): string {
  const digits = displayDecimals(tickSize, pricePrecision);
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function money(n: number): number {
  return Number(n.toFixed(4));
}

function ratio(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(4));
}

export function geometryValid(direction: Direction, entry: number, stop: number, target: number): boolean {
  if (direction === "WAIT") return false;
  if (!(entry > 0 && stop > 0 && target > 0)) return false;
  if (direction === "LONG") return stop < entry && target > entry;
  return stop > entry && target < entry;
}

export function geometryReasons(direction: Direction, entry: number, stop: number, target: number): string[] {
  const reasons: string[] = [];
  if (direction === "WAIT") {
    reasons.push("No executable trade: WAIT has no entry/SL/TP.");
    return reasons;
  }
  if (!(entry > 0)) reasons.push("Entry price is missing or invalid.");
  if (!(stop > 0)) reasons.push("Stop-loss price is missing or invalid.");
  if (!(target > 0)) reasons.push("Take-profit price is missing or invalid.");
  if (entry > 0 && stop > 0 && target > 0) {
    if (direction === "LONG") {
      if (!(stop < entry)) reasons.push("LONG stop-loss must be below entry.");
      if (!(target > entry)) reasons.push("LONG take-profit must be above entry.");
      if (stop < entry && !(entry - stop > 0)) reasons.push("LONG risk must be positive.");
    } else {
      if (!(stop > entry)) reasons.push("SHORT stop-loss must be above entry.");
      if (!(target < entry)) reasons.push("SHORT take-profit must be below entry.");
      if (stop > entry && !(stop - entry > 0)) reasons.push("SHORT risk must be positive.");
    }
  }
  return reasons;
}

export function estimateIsolatedLiquidation(
  direction: Direction,
  entry: number,
  leverage: number,
  maintMarginRatio: number | undefined,
): { price: number | null; risk: LiquidationRisk; note: string } {
  if (!Number.isFinite(leverage) || leverage <= 1) {
    return { price: null, risk: "UNKNOWN", note: "Liquidation estimate needs leverage greater than 1×." };
  }
  if (maintMarginRatio == null || !Number.isFinite(maintMarginRatio) || maintMarginRatio < 0) {
    return {
      price: null,
      risk: "UNAVAILABLE",
      note: "Liquidation is unavailable. Maintenance margin requires a signed Binance account request, so an exact price is not invented.",
    };
  }
  const buffer = 1 / leverage - maintMarginRatio;
  if (buffer <= 0) {
    return { price: null, risk: "UNKNOWN", note: "Maintenance margin is not smaller than 1/leverage; liquidation cannot be estimated safely." };
  }
  const price = direction === "LONG" ? entry * (1 - buffer) : entry * (1 + buffer);
  return {
    price,
    risk: "OK",
    note: `Isolated estimate using maintenance margin ${(maintMarginRatio * 100).toFixed(2)}%. Exchange liquidation also includes fees and funding.`,
  };
}

function classifyLiquidation(
  direction: Direction,
  stop: number,
  mode: MarginMode,
  isolated: { price: number | null; risk: LiquidationRisk; note: string },
): { risk: LiquidationRisk; price: number | null; note: string } {
  if (mode === "CROSS") {
    return {
      risk: "UNKNOWN",
      price: null,
      note: "Cross-margin liquidation depends on whole-account equity and other positions. Exact price is not invented.",
    };
  }
  if (isolated.risk !== "OK" || isolated.price == null) return isolated;
  const beforeStop = direction === "LONG" ? isolated.price > stop : isolated.price < stop;
  if (beforeStop) {
    return {
      risk: "BEFORE_STOP",
      price: isolated.price,
      note: `${isolated.note} Estimated liquidation is before the stop-loss.`,
    };
  }
  return isolated;
}

export type SizedPosition = {
  quantity: number;
  notionalUSDT: number;
  requiredMarginUSDT: number;
  entryFeeUSDT: number;
  exitFeeUSDT: number;
  totalFeesUSDT: number;
  minQty: number;
  minNotional: number;
  stepSize: number;
  tickSize: number;
  reasons: string[];
};

export function sizePosition(
  entry: number,
  settings: Pick<UserTradeSettings, "marginUSDT" | "leverage"> & { takerFeeRate?: number },
  filters: SymbolFilters,
): SizedPosition {
  const reasons: string[] = [];
  const leverage = Math.max(1, Math.floor(settings.leverage || 1));
  const allocated = Math.max(0, settings.marginUSDT || 0);
  const feeRate = settings.takerFeeRate ?? TAKER_FEE;
  const rawNotional = allocated * leverage;
  const qty = entry > 0 ? floorToStep(rawNotional / entry, filters.stepSize) : 0;
  const notional = qty * entry;
  const requiredMargin = leverage > 0 ? notional / leverage : 0;
  const entryFee = notional * feeRate;
  const exitFee = notional * feeRate;

  if (!filters.available) {
    reasons.push(filters.reason || `${filters.symbol} is not available for trading.`);
  }
  if (qty <= 0) {
    reasons.push(
      `Quantity rounds to 0 with step ${formatByStep(filters.stepSize, filters.stepSize)} (allocated $${allocated.toFixed(2)} × ${leverage}x).`,
    );
  }
  if (qty > 0 && qty + 1e-12 < filters.minQty) {
    reasons.push(`Quantity ${formatByStep(qty, filters.stepSize)} is below minQty ${formatByStep(filters.minQty, filters.stepSize)}.`);
  }
  if (qty > 0 && notional + 1e-9 < filters.minNotional) {
    reasons.push(`Notional $${notional.toFixed(4)} is below exchange minNotional $${filters.minNotional}.`);
  }
  if (requiredMargin - allocated > 1e-8) {
    reasons.push(`Required margin $${requiredMargin.toFixed(4)} exceeds allocated $${allocated.toFixed(2)}.`);
  }

  return {
    quantity: qty,
    notionalUSDT: money(notional),
    requiredMarginUSDT: money(requiredMargin),
    entryFeeUSDT: money(entryFee),
    exitFeeUSDT: money(exitFee),
    totalFeesUSDT: money(entryFee + exitFee),
    minQty: filters.minQty,
    minNotional: filters.minNotional,
    stepSize: filters.stepSize,
    tickSize: filters.tickSize,
    reasons,
  };
}

export function pnlAtPrice(direction: Direction, qty: number, entry: number, exit: number): number {
  return direction === "LONG" ? (exit - entry) * qty : (entry - exit) * qty;
}

export function realizedPnlUSDT(input: {
  direction: "LONG" | "SHORT";
  entry: number;
  exitPrice: number;
  quantity: number;
  totalFeesUSDT: number;
  outcome: "WIN" | "LOSS" | "EXPIRED" | "AMBIGUOUS";
}): number {
  const gross = pnlAtPrice(input.direction, input.quantity, input.entry, input.exitPrice);
  return money(gross - input.totalFeesUSDT);
}

export type BuildSetupInput = {
  direction: Direction;
  entry: number;
  stop: number;
  target: number;
  filters: SymbolFilters;
  marginUSDT?: number;
  leverage?: number;
  feeRate?: number;
  marginMode?: MarginMode;
};

export function resolveSettings(input: Partial<UserTradeSettings> & { feeRate?: number; marginUSDT?: number; leverage?: number; marginMode?: MarginMode }): UserTradeSettings {
  return {
    marginUSDT: input.marginUSDT ?? DEFAULT_SETTINGS.marginUSDT,
    leverage: input.leverage ?? DEFAULT_SETTINGS.leverage,
    marginMode: input.marginMode ?? DEFAULT_SETTINGS.marginMode,
    takerFeeRate: input.feeRate ?? input.takerFeeRate ?? DEFAULT_SETTINGS.takerFeeRate,
  };
}

export function buildSetup(input: BuildSetupInput): TradeSetup | null {
  if (input.direction === "WAIT") return null;

  const settings = resolveSettings(input);
  const mode = settings.marginMode;
  const entry = roundToTick(input.entry, input.filters.tickSize);
  const stop = roundToTick(input.stop, input.filters.tickSize);
  const target = roundToTick(input.target, input.filters.tickSize);
  const geoReasons = geometryReasons(input.direction, entry, stop, target);
  const geoOk = geoReasons.length === 0;
  const sized = sizePosition(entry, settings, input.filters);

  const grossProfit = geoOk ? money(pnlAtPrice(input.direction, sized.quantity, entry, target)) : 0;
  const grossLoss = geoOk ? money(Math.abs(pnlAtPrice(input.direction, sized.quantity, entry, stop))) : 0;
  const netProfit = money(grossProfit - sized.totalFeesUSDT);
  const netLoss = money(grossLoss + sized.totalFeesUSDT);
  const grossRR = grossLoss > 0 ? ratio(grossProfit / grossLoss) : 0;
  const netRR = netLoss > 0 ? ratio(netProfit / netLoss) : 0;

  const isolated = estimateIsolatedLiquidation(input.direction, entry, settings.leverage, input.filters.maintMarginRatio);
  const liq = classifyLiquidation(input.direction, stop, mode, isolated);
  const liqReasons: string[] = [];
  if (liq.risk === "BEFORE_STOP") {
    liqReasons.push("Estimated isolated liquidation could occur before the stop-loss.");
  }

  const reasons = [...geoReasons, ...sized.reasons, ...liqReasons];
  const executable = geoOk && sized.reasons.length === 0 && input.filters.available && liq.risk !== "BEFORE_STOP";
  const executableReason = executable
    ? "Sized with exchange filters. Manual signals only; no order is sent."
    : `NOT EXECUTABLE: ${reasons[0] || "Setup failed validation."}`;

  return {
    direction: input.direction,
    executable,
    executableReason,
    validationReasons: reasons,
    ineligibleReason: executable ? undefined : reasons[0],
    marginUSDT: money(settings.marginUSDT),
    allocatedMarginUSDT: money(settings.marginUSDT),
    requiredMarginUSDT: sized.requiredMarginUSDT,
    leverage: settings.leverage,
    marginMode: mode,
    notionalUSDT: sized.notionalUSDT,
    quantity: sized.quantity,
    entry,
    stop,
    target,
    riskReward: netRR,
    grossRiskReward: grossRR,
    netRiskReward: netRR,
    estimatedProfitUSDT: netProfit,
    estimatedLossUSDT: netLoss,
    estimatedFeesUSDT: sized.totalFeesUSDT,
    entryFeeUSDT: sized.entryFeeUSDT,
    exitFeeUSDT: sized.exitFeeUSDT,
    totalFeesUSDT: sized.totalFeesUSDT,
    grossProfitUSDT: grossProfit,
    grossLossUSDT: grossLoss,
    netProfitUSDT: netProfit,
    netLossUSDT: netLoss,
    tickSize: sized.tickSize,
    stepSize: sized.stepSize,
    pricePrecision: input.filters.pricePrecision,
    minNotional: sized.minNotional,
    minQty: sized.minQty,
    maintMarginRatio: input.filters.maintMarginRatio,
    liquidationEstimateUSDT: liq.price == null ? null : money(liq.price),
    liquidationRisk: liq.risk,
    liquidationNote: liq.note,
  };
}

export function applyTradeSettings(setup: TradeSetup, settings: UserTradeSettings, filters: SymbolFilters, direction?: "LONG" | "SHORT"): TradeSetup {
  const side = direction || setup.direction;
  if (!side) return setup;
  return (
    buildSetup({
      direction: side,
      entry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      filters,
      marginUSDT: settings.marginUSDT,
      leverage: settings.leverage,
      marginMode: settings.marginMode,
      feeRate: settings.takerFeeRate,
    }) || setup
  );
}

export function outcomeFromPath(
  direction: "LONG" | "SHORT",
  entry: number,
  stop: number,
  target: number,
  future: Array<{ high: number; low: number; close: number; openTime: number }>,
): { outcome: "WIN" | "LOSS" | "EXPIRED" | "AMBIGUOUS"; exitPrice: number; closedAt: number } | null {
  for (const candle of future) {
    const hitStop = direction === "LONG" ? candle.low <= stop : candle.high >= stop;
    const hitTarget = direction === "LONG" ? candle.high >= target : candle.low <= target;
    if (hitStop && hitTarget) {
      return { outcome: "AMBIGUOUS", exitPrice: candle.close, closedAt: candle.openTime };
    }
    if (hitStop) return { outcome: "LOSS", exitPrice: stop, closedAt: candle.openTime };
    if (hitTarget) return { outcome: "WIN", exitPrice: target, closedAt: candle.openTime };
  }
  return null;
}
