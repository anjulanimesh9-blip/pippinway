import { fixtureFilters } from "@/lib/signals-engine/exchange-fixtures";
import { lifecycleAllowsFreshEntry } from "@/lib/signals-engine/lifecycle";
import { applyTradeSettings } from "@/lib/signals-engine/trading";
import type { CoinScan, ScannerResponse, SymbolFilters } from "@/lib/signals-engine/types";
import type { SignalsAccess } from "@/lib/signals/access";
import type { SignalsUserSettings } from "@/lib/signals/config";

export function filtersFromCoin(coin: CoinScan): SymbolFilters {
  if (coin.filters) {
    return {
      ...coin.filters,
      available: coin.available && coin.filters.available,
      reason: coin.available ? coin.filters.reason : coin.unavailableReason || coin.filters.reason,
    };
  }
  const fixture = fixtureFilters(coin.symbol);
  return {
    symbol: coin.symbol,
    status: coin.available ? "TRADING" : "UNAVAILABLE",
    contractType: fixture.contractType,
    tickSize: coin.setup?.tickSize || fixture.tickSize,
    stepSize: coin.setup?.stepSize || fixture.stepSize,
    minQty: coin.setup?.minQty ?? fixture.minQty,
    minNotional: coin.setup?.minNotional ?? fixture.minNotional,
    available: coin.available,
    reason: coin.unavailableReason,
    maintMarginRatio: coin.setup?.maintMarginRatio ?? fixture.maintMarginRatio,
  };
}

export function applyUserSettings(coins: CoinScan[], settings: SignalsUserSettings): CoinScan[] {
  return coins.map((coin) => {
    if (!coin.setup || coin.direction === "WAIT") return coin;
    let setup = applyTradeSettings(
      coin.setup,
      {
        marginUSDT: settings.marginUSDT,
        leverage: settings.leverage,
        marginMode: settings.marginMode,
        takerFeeRate: settings.takerFeeRate,
      },
      filtersFromCoin(coin),
      coin.direction,
    );
    if (coin.lifecycle && coin.price != null && !lifecycleAllowsFreshEntry(coin.lifecycle, coin.price, setup)) {
      setup = {
        ...setup,
        executable: false,
        executableReason: `NOT EXECUTABLE: ${coin.lifecycle.status.split("_").join(" ")} is not a fresh entry. Original entry ${coin.originalEntry ?? setup.entry} was kept.`,
        validationReasons: [`${coin.lifecycle.status} is not a fresh executable trade.`, ...setup.validationReasons],
      };
    }
    return { ...coin, setup, originalEntry: coin.originalEntry ?? setup.entry };
  });
}

export function educationalCoin(coin: CoinScan, reason: string, nextStep: string): CoinScan {
  return {
    ...coin,
    locked: true,
    setup: null,
    context: null,
    lifecycle: undefined,
    originalEntry: undefined,
    quality: coin.quality ? { ...coin.quality, supporting: ["Educational market overview on the Free plan."], contradictory: [] } : undefined,
    entryConditions: reason,
    nextStep,
    timeframes: coin.timeframes.map((tf) => ({
      ...tf,
      ema50: null,
      ema200: null,
      macd: null,
      atr: null,
      patterns: tf.patterns.map((pattern) => ({
        ...pattern,
        evidence: ["Educational pattern label only until this signal is revealed or you upgrade to Pro."],
      })),
    })),
  };
}

export function gateScanner(scan: ScannerResponse, access: SignalsAccess, options: { revealed?: string[] } = {}): ScannerResponse {
  const { plan, config, settings, subscription } = access;
  const sized = applyUserSettings(scan.coins, settings);
  const isPro = plan === "pro";
  const revealed = new Set((options.revealed || []).map((item) => item.toUpperCase()));
  const coins = sized.map((coin) => {
    if (isPro || config.freeShowFullDetails || revealed.has(coin.symbol)) return { ...coin, locked: false };
    return educationalCoin(
      coin,
      "Full entry, stop, target and analysis require a Free daily reveal or Pro.",
      "Reveal up to 4 unique complete signals each UTC day, or upgrade to Pro.",
    );
  });

  return {
    ...scan,
    settings: {
      ...scan.settings,
      marginUSDT: settings.marginUSDT,
      leverage: settings.leverage,
      marginMode: settings.marginMode,
    },
    coins,
    access: {
      plan,
      betaMode: config.betaMode,
      billingEnabled: config.billingEnabled,
      proPriceMonthly: config.proPriceMonthly,
      currency: config.currency,
      freeSymbols: config.freeSymbols,
      alertsEnabled: config.alertsEnabled && isPro,
      subscription,
      revealed: [...revealed],
    },
  } as ScannerResponse & { access: Record<string, unknown> };
}
