import { isTerminal, type PublishedSignal } from "@/lib/signals-engine/lifecycle";
import { buildSetup } from "@/lib/signals-engine/trading";
import { selectNearSetups } from "@/lib/signals-engine/near-setups";
import { scannerCounts } from "@/lib/signals-engine/universe";
import type { CoinScan, ScannerResponse, SymbolFilters } from "@/lib/signals-engine/types";
import type { OfficialSignal } from "@/lib/signals/official-types";
import { publishedFromOfficial } from "@/lib/signals/official-store";

function emptyFilters(symbol: string): SymbolFilters {
  return {
    symbol,
    status: "TRADING",
    contractType: "PERPETUAL",
    tickSize: 0.01,
    stepSize: 0.001,
    minQty: 0.001,
    minNotional: 5,
    available: true,
    reason: "",
    pricePrecision: 2,
  };
}

/**
 * Rebuild a displayable CoinScan from a persisted official signal.
 * Used so ACTIVE/WAITING official signals stay on /signals even when the
 * latest Top 50 TA pass returns WAIT for that symbol.
 */
export function coinScanFromOfficial(
  record: OfficialSignal,
  live?: Partial<CoinScan> | null,
): CoinScan {
  const published = publishedFromOfficial(record);
  const filters = live?.filters || emptyFilters(record.symbol);
  const setup = buildSetup({
    direction: record.direction,
    entry: record.originalEntry,
    stop: record.stop,
    target: record.target,
    filters,
    marginUSDT: record.marginUSDT || 1,
    leverage: record.leverage || 20,
    marginMode: record.marginMode,
  });
  return {
    symbol: record.symbol,
    available: live?.available !== false,
    price: live?.price ?? record.lastPrice,
    changePct: live?.changePct ?? null,
    quoteVolume: live?.quoteVolume ?? null,
    priceUpdatedAt: live?.priceUpdatedAt ?? record.lastPriceAt,
    stale: live?.stale ?? false,
    trend: live?.trend ?? (record.direction === "SHORT" ? "BEARISH" : "BULLISH"),
    direction: record.direction,
    pattern: record.pattern,
    patternStatus: record.patternStatus as CoinScan["patternStatus"],
    timeframes: live?.timeframes || [],
    filters,
    setup,
    entryConditions: record.entryConditions,
    reason: live?.reason || "Official published signal. Levels are frozen from first validation.",
    nextStep: published.lifecycle.nextStep,
    lastCandleCloseAt: record.lastCandleCloseAt,
    analyzedAt: record.openedAt,
    originalEntry: record.originalEntry,
    lifecycle: published.lifecycle,
    quality: live?.quality,
    context: live?.context ?? null,
    scanState: live?.scanState && live.scanState !== "pending" ? live.scanState : "ready",
  };
}

export function coinScanFromPublished(
  published: PublishedSignal,
  live?: Partial<CoinScan> | null,
): CoinScan {
  const filters = live?.filters || emptyFilters(published.symbol);
  const setup = buildSetup({
    direction: published.direction,
    entry: published.entry,
    stop: published.stop,
    target: published.target,
    filters,
  });
  return {
    symbol: published.symbol,
    available: live?.available !== false,
    price: live?.price ?? published.entry,
    changePct: live?.changePct ?? null,
    quoteVolume: live?.quoteVolume ?? null,
    priceUpdatedAt: live?.priceUpdatedAt ?? null,
    stale: live?.stale ?? false,
    trend: live?.trend ?? (published.direction === "SHORT" ? "BEARISH" : "BULLISH"),
    direction: published.direction,
    pattern: published.pattern,
    patternStatus: published.patternStatus,
    timeframes: live?.timeframes || [],
    filters,
    setup,
    entryConditions: published.entryConditions,
    reason: published.reason,
    nextStep: published.nextStep,
    lastCandleCloseAt: published.lastCandleCloseAt,
    analyzedAt: published.lifecycle.openedAt,
    originalEntry: published.entry,
    lifecycle: published.lifecycle,
    quality: live?.quality,
    context: live?.context ?? null,
    scanState: "ready",
  };
}

/**
 * Overlay active official signals onto the Top 50 board.
 * Does not invent new trades — only resurfaces already-published official rows.
 * Near Setups stay derived from WAIT coins after the overlay.
 */
export function mergeOfficialLiveIntoResponse(
  response: ScannerResponse,
  activeOfficial: OfficialSignal[],
): ScannerResponse {
  const liveOnly = activeOfficial.filter((item) => !isTerminal(item.lifecycleStatus));
  if (!liveOnly.length) {
    return {
      ...response,
      officialLive: response.officialLive || [],
    };
  }

  const bySymbol = new Map(response.coins.map((coin) => [coin.symbol.toUpperCase(), coin]));
  const officialLive: CoinScan[] = [];

  for (const record of liveOnly) {
    const key = record.symbol.toUpperCase();
    const board = bySymbol.get(key) || null;
    const materialized = coinScanFromOfficial(record, board);
    officialLive.push(materialized);

    const boardIsOfficial =
      board
      && (board.direction === "LONG" || board.direction === "SHORT")
      && board.setup
      && board.lifecycle
      && !isTerminal(board.lifecycle.status);

    if (boardIsOfficial) {
      // Keep board analysis/price, but never drop frozen official levels.
      bySymbol.set(key, {
        ...board!,
        direction: record.direction,
        setup: materialized.setup,
        originalEntry: record.originalEntry,
        lifecycle: materialized.lifecycle,
        pattern: record.pattern || board!.pattern,
        patternStatus: (record.patternStatus as CoinScan["patternStatus"]) || board!.patternStatus,
        scanState: board!.scanState === "pending" ? "ready" : board!.scanState,
      });
    } else {
      bySymbol.set(key, {
        ...(board || materialized),
        ...materialized,
        price: board?.price ?? materialized.price,
        changePct: board?.changePct ?? materialized.changePct,
        quoteVolume: board?.quoteVolume ?? materialized.quoteVolume,
        priceUpdatedAt: board?.priceUpdatedAt ?? materialized.priceUpdatedAt,
        timeframes: board?.timeframes?.length ? board.timeframes : materialized.timeframes,
        quality: board?.quality ?? materialized.quality,
        context: board?.context ?? materialized.context,
      });
    }
  }

  const coins: CoinScan[] = [];
  const seen = new Set<string>();
  for (const coin of response.coins) {
    const next = bySymbol.get(coin.symbol.toUpperCase()) || coin;
    coins.push(next);
    seen.add(coin.symbol.toUpperCase());
  }
  for (const coin of officialLive) {
    const key = coin.symbol.toUpperCase();
    if (!seen.has(key)) {
      coins.push(coin);
      seen.add(key);
    }
  }

  return {
    ...response,
    coins,
    officialLive,
    counts: scannerCounts(coins),
    // Near Setups must stay WAIT-only informational — recompute after overlay.
    nearSetups: selectNearSetups(coins),
  };
}
