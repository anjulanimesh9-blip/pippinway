import { isValidSymbol } from "@/lib/signals-engine/types";

export type SignalsPlan = "free" | "pro";

export const FREE_DAILY_REVEALS = 4;
export const DEFAULT_SUBSCRIPTION_DAYS = 30;

export type SignalsConfig = {
  betaMode: boolean;
  billingEnabled: boolean;
  proPriceMonthly: number;
  currency: string;
  freeSymbols: string[];
  freeShowFullDetails: boolean;
  alertsEnabled: boolean;
  freeDailyReveals: number;
  subscriptionDays: number;
  ecocashRecipientNumber: string;
  ecocashRecipientName: string;
  ecocashInstructions: string;
};

export type SignalsUserSettings = {
  marginUSDT: number;
  leverage: number;
  marginMode: "ISOLATED" | "CROSS";
  takerFeeRate?: number;
  venue: string;
  mode: "MANUAL";
  scanMode: "15" | "50" | "all" | "custom" | "100";
  watchlist: string[];
};

export const DEFAULT_SIGNALS_CONFIG: SignalsConfig = {
  betaMode: true,
  billingEnabled: false,
  proPriceMonthly: 4.99,
  currency: "USD",
  freeSymbols: ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
  freeShowFullDetails: false,
  alertsEnabled: false,
  freeDailyReveals: FREE_DAILY_REVEALS,
  subscriptionDays: DEFAULT_SUBSCRIPTION_DAYS,
  ecocashRecipientNumber: "",
  ecocashRecipientName: "",
  ecocashInstructions: "Pay the stated amount with EcoCash, then upload your receipt. A receipt is not automatic proof of payment. Pro activates only after an admin verifies the funds.",
};

export const DEFAULT_SIGNALS_SETTINGS: SignalsUserSettings = {
  marginUSDT: 1,
  leverage: 20,
  marginMode: "ISOLATED",
  takerFeeRate: 0.0005,
  venue: "Binance USDT-M Futures",
  mode: "MANUAL",
  scanMode: "100",
  watchlist: [],
};

export function clampSettings(input: Partial<SignalsUserSettings>): SignalsUserSettings {
  const margin = Number(input.marginUSDT);
  const leverage = Number(input.leverage);
  const mode = input.marginMode === "CROSS" ? "CROSS" : "ISOLATED";
  const scanMode = input.scanMode === "15" || input.scanMode === "50" || input.scanMode === "100" || input.scanMode === "all" || input.scanMode === "custom"
    ? input.scanMode
    : DEFAULT_SIGNALS_SETTINGS.scanMode;
  const watchlist = Array.isArray(input.watchlist)
    ? [...new Set(input.watchlist.map((item) => String(item).toUpperCase()).filter((item) => isValidSymbol(item)))].slice(0, 100)
    : [];
  return {
    marginUSDT: Number.isFinite(margin) ? Math.min(10_000, Math.max(1, margin)) : DEFAULT_SIGNALS_SETTINGS.marginUSDT,
    leverage: Number.isFinite(leverage) ? Math.min(125, Math.max(1, Math.round(leverage))) : DEFAULT_SIGNALS_SETTINGS.leverage,
    marginMode: mode,
    takerFeeRate: DEFAULT_SIGNALS_SETTINGS.takerFeeRate,
    venue: DEFAULT_SIGNALS_SETTINGS.venue,
    mode: "MANUAL",
    scanMode,
    watchlist,
  };
}

export function sanitizeConfig(input: Partial<SignalsConfig>): SignalsConfig {
  const freeSymbols = Array.isArray(input.freeSymbols)
    ? input.freeSymbols.map((symbol) => String(symbol).toUpperCase()).filter((symbol) => isValidSymbol(symbol)).slice(0, 15)
    : DEFAULT_SIGNALS_CONFIG.freeSymbols;
  const price = Number(input.proPriceMonthly);
  const days = Number(input.subscriptionDays);
  const reveals = Number(input.freeDailyReveals);
  return {
    betaMode: input.betaMode !== false,
    billingEnabled: input.billingEnabled === true,
    proPriceMonthly: Number.isFinite(price) && price > 0 ? Number(price.toFixed(2)) : DEFAULT_SIGNALS_CONFIG.proPriceMonthly,
    currency: typeof input.currency === "string" && input.currency.length <= 8 ? input.currency : "USD",
    freeSymbols: freeSymbols.length ? freeSymbols : DEFAULT_SIGNALS_CONFIG.freeSymbols,
    freeShowFullDetails: input.freeShowFullDetails === true,
    alertsEnabled: input.alertsEnabled === true,
    freeDailyReveals: Number.isFinite(reveals) && reveals > 0 ? Math.min(15, Math.round(reveals)) : FREE_DAILY_REVEALS,
    subscriptionDays: Number.isFinite(days) && days > 0 ? Math.min(366, Math.round(days)) : DEFAULT_SUBSCRIPTION_DAYS,
    ecocashRecipientNumber: sanitizePhone(input.ecocashRecipientNumber),
    ecocashRecipientName: sanitizeLine(input.ecocashRecipientName, 80),
    ecocashInstructions: sanitizeLine(input.ecocashInstructions, 400) || DEFAULT_SIGNALS_CONFIG.ecocashInstructions,
  };
}

function sanitizeLine(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "";
}

function sanitizePhone(value: unknown) {
  const raw = sanitizeLine(value, 24);
  if (!raw) return "";
  if (!/^[+\d][\d\s()-]{6,22}$/.test(raw)) return "";
  return raw;
}
