import { isTerminal, type PublishedSignal } from "@/lib/signals-engine/lifecycle";
import {
  buildSetup,
  geometryValid,
  MIN_NET_RISK_REWARD,
  passesPublicationRr,
  roundToTick,
} from "@/lib/signals-engine/trading";
import { selectNearSetups } from "@/lib/signals-engine/near-setups";
import { scannerCounts } from "@/lib/signals-engine/universe";
import type { CoinScan, ScannerResponse, SymbolFilters, TradeSetup } from "@/lib/signals-engine/types";
import type { OfficialSignal } from "@/lib/signals/official-types";
import { publishedFromOfficial } from "@/lib/signals/official-store";

export type OfficialLiveExclusion = {
  id: string;
  symbol: string;
  reasons: string[];
};

const STATUS_RANK: Record<string, number> = {
  ACTIVE: 3,
  TRIGGERED: 2,
  WAITING_FOR_ENTRY: 1,
};

function emptyFilters(symbol: string, tickSize = 0.01): SymbolFilters {
  return {
    symbol,
    status: "TRADING",
    contractType: "PERPETUAL",
    tickSize,
    stepSize: 0.001,
    minQty: 0.001,
    minNotional: 5,
    available: true,
    reason: "",
    pricePrecision: Math.max(0, decimalsOf(tickSize)),
  };
}

function decimalsOf(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const text = String(value);
  if (/e-/i.test(text)) return Number(text.split(/e-/i)[1]) || 0;
  const idx = text.indexOf(".");
  return idx < 0 ? 0 : text.length - idx - 1;
}

/** Infer a tick that preserves frozen official levels (avoids collapsing SHIB-like prices to 0.01). */
export function inferTickSize(entry: number, stop: number, target: number): number {
  const decimals = Math.min(8, Math.max(decimalsOf(entry), decimalsOf(stop), decimalsOf(target), 2));
  return Number((10 ** -decimals).toFixed(decimals));
}

export function rawGrossRiskReward(
  direction: "LONG" | "SHORT",
  entry: number,
  stop: number,
  target: number,
): number {
  if (!geometryValid(direction, entry, stop, target)) return 0;
  const risk = direction === "LONG" ? entry - stop : stop - entry;
  const reward = direction === "LONG" ? target - entry : entry - target;
  if (!(risk > 0)) return 0;
  return reward / risk;
}

function filtersForOfficialLevels(
  record: OfficialSignal,
  live?: Partial<CoinScan> | null,
): SymbolFilters {
  const entry = record.originalEntry;
  const stop = record.stop;
  const target = record.target;
  const candidate = live?.filters;
  if (candidate?.tickSize && candidate.tickSize > 0) {
    const roundedEntry = roundToTick(entry, candidate.tickSize);
    const roundedStop = roundToTick(stop, candidate.tickSize);
    const roundedTarget = roundToTick(target, candidate.tickSize);
    if (geometryValid(record.direction, roundedEntry, roundedStop, roundedTarget)) {
      return candidate;
    }
  }
  const tick = inferTickSize(entry, stop, target);
  return {
    ...(candidate || emptyFilters(record.symbol, tick)),
    symbol: record.symbol,
    tickSize: tick,
    pricePrecision: Math.max(candidate?.pricePrecision ?? 0, decimalsOf(tick)),
    available: candidate?.available !== false,
  };
}

/**
 * Rebuild fee-aware setup from frozen levels without destroying price precision.
 * Returns null when geometry/sizing cannot produce a positive gross R/R.
 */
export function setupFromOfficialRecord(
  record: OfficialSignal,
  live?: Partial<CoinScan> | null,
): TradeSetup | null {
  if (record.direction !== "LONG" && record.direction !== "SHORT") return null;
  if (![record.originalEntry, record.stop, record.target].every((n) => Number.isFinite(n) && n > 0)) {
    return null;
  }
  if (!geometryValid(record.direction, record.originalEntry, record.stop, record.target)) {
    return null;
  }
  const filters = filtersForOfficialLevels(record, live);
  return buildSetup({
    direction: record.direction,
    entry: record.originalEntry,
    stop: record.stop,
    target: record.target,
    filters,
    marginUSDT: record.marginUSDT > 0 ? record.marginUSDT : 1,
    leverage: record.leverage > 0 ? record.leverage : 20,
    marginMode: record.marginMode,
  });
}

/**
 * Classify whether an official Firestore/file record may appear under Official Live Signals.
 * Does not invent new trades or rewrite malformed levels.
 */
export function classifyOfficialLiveRecord(
  record: OfficialSignal,
  nowMs = Date.now(),
  live?: Partial<CoinScan> | null,
): { ok: true; setup: TradeSetup } | { ok: false; reasons: string[] } {
  const reasons: string[] = [];
  const symbol = String(record.symbol || "").toUpperCase();
  if (!/^[A-Z0-9]{5,25}$/.test(symbol)) reasons.push("symbol is invalid");
  if (record.direction !== "LONG" && record.direction !== "SHORT") {
    reasons.push("direction is not LONG or SHORT");
  }
  if (isTerminal(record.lifecycleStatus)) {
    reasons.push(`lifecycle is terminal (${record.lifecycleStatus})`);
  }

  const openedAt = Date.parse(record.openedAt);
  const expiresAt = Date.parse(record.expiresAt);
  if (!Number.isFinite(openedAt)) reasons.push("openedAt is invalid");
  if (!Number.isFinite(expiresAt)) reasons.push("expiresAt is invalid");
  if (Number.isFinite(expiresAt) && expiresAt <= nowMs) {
    reasons.push(`past expiresAt (${record.expiresAt}) — not a current live signal`);
  }

  const entry = record.originalEntry;
  const stop = record.stop;
  const target = record.target;
  if (![entry, stop, target].every((n) => Number.isFinite(n) && n > 0)) {
    reasons.push("entry/stop/target missing or non-finite");
  } else if (record.direction === "LONG" || record.direction === "SHORT") {
    if (!geometryValid(record.direction, entry, stop, target)) {
      reasons.push(
        record.direction === "LONG"
          ? "LONG geometry invalid (need stop < entry < target)"
          : "SHORT geometry invalid (need target < entry < stop)",
      );
    }
  }

  const gross = rawGrossRiskReward(record.direction, entry, stop, target);
  if (!(gross > 0)) reasons.push("gross R/R is not positive");

  // Always evaluate fee-aware publication floor when geometry allows — even for expired rows (audit).
  let setup: TradeSetup | null = null;
  if (
    (record.direction === "LONG" || record.direction === "SHORT")
    && Number.isFinite(entry) && entry > 0
    && Number.isFinite(stop) && stop > 0
    && Number.isFinite(target) && target > 0
    && geometryValid(record.direction, entry, stop, target)
  ) {
    setup = setupFromOfficialRecord(record, live);
  }
  if (!setup) {
    if (!(gross > 0) && !reasons.some((r) => r.includes("rebuild") || r.includes("geometry"))) {
      reasons.push("could not rebuild executable setup from frozen levels");
    }
  } else {
    if (!(setup.grossRiskReward > 0)) reasons.push("rebuilt gross R/R is not positive");
    if (!passesPublicationRr(setup.netRiskReward)) {
      reasons.push(
        `net R/R 1:${Number(setup.netRiskReward).toFixed(2)} below official floor 1:${MIN_NET_RISK_REWARD}`,
      );
    }
    if (
      setup.entry === setup.stop
      || setup.entry === setup.target
      || setup.stop === setup.target
    ) {
      reasons.push("rebuilt levels collapsed (entry/stop/target not distinct)");
    }
  }

  if (reasons.length) return { ok: false, reasons };
  return { ok: true, setup: setup! };
}

export function isDisplayableOfficialLive(
  record: OfficialSignal,
  nowMs = Date.now(),
  live?: Partial<CoinScan> | null,
): boolean {
  return classifyOfficialLiveRecord(record, nowMs, live).ok;
}

/**
 * One current official live card per symbol.
 * Prefers ACTIVE > TRIGGERED > WAITING, then newest openedAt among valid records.
 */
export function dedupeOfficialLiveRecords(records: OfficialSignal[]): OfficialSignal[] {
  const best = new Map<string, OfficialSignal>();
  for (const record of records) {
    const key = record.symbol.toUpperCase();
    const prev = best.get(key);
    if (!prev) {
      best.set(key, record);
      continue;
    }
    const rank = STATUS_RANK[record.lifecycleStatus] || 0;
    const prevRank = STATUS_RANK[prev.lifecycleStatus] || 0;
    if (rank > prevRank) {
      best.set(key, record);
      continue;
    }
    if (rank < prevRank) continue;
    const opened = Date.parse(record.openedAt) || 0;
    const prevOpened = Date.parse(prev.openedAt) || 0;
    if (opened >= prevOpened) best.set(key, record);
  }
  return [...best.values()].sort(
    (a, b) => (Date.parse(b.openedAt) || 0) - (Date.parse(a.openedAt) || 0),
  );
}

export function selectDisplayableOfficialLive(
  activeOfficial: OfficialSignal[],
  boardCoins: CoinScan[] = [],
  nowMs = Date.now(),
): { selected: OfficialSignal[]; excluded: OfficialLiveExclusion[] } {
  const bySymbol = new Map(boardCoins.map((coin) => [coin.symbol.toUpperCase(), coin]));
  const excluded: OfficialLiveExclusion[] = [];
  const valid: OfficialSignal[] = [];

  for (const record of activeOfficial) {
    const live = bySymbol.get(record.symbol.toUpperCase()) || null;
    const verdict = classifyOfficialLiveRecord(record, nowMs, live);
    if (!verdict.ok) {
      excluded.push({ id: record.id, symbol: record.symbol, reasons: verdict.reasons });
      continue;
    }
    valid.push(record);
  }

  const selected = dedupeOfficialLiveRecords(valid);
  const selectedIds = new Set(selected.map((item) => item.id));
  for (const record of valid) {
    if (!selectedIds.has(record.id)) {
      excluded.push({
        id: record.id,
        symbol: record.symbol,
        reasons: ["duplicate symbol — superseded by newer/higher-priority lifecycle record"],
      });
    }
  }
  return { selected, excluded };
}

/**
 * Rebuild a displayable CoinScan from a validated official signal.
 */
export function coinScanFromOfficial(
  record: OfficialSignal,
  live?: Partial<CoinScan> | null,
): CoinScan {
  const published = publishedFromOfficial(record);
  const setup = setupFromOfficialRecord(record, live);
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
    filters: setup ? filtersForOfficialLevels(record, live) : live?.filters,
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
  const filters = live?.filters || emptyFilters(published.symbol, inferTickSize(published.entry, published.stop, published.target));
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
 * Attach Official Live cards without rewriting Top 50 scan directions/counts.
 * Near Setups stay derived from the pure scan board (WAIT coins only).
 */
export function mergeOfficialLiveIntoResponse(
  response: ScannerResponse,
  activeOfficial: OfficialSignal[],
  nowMs = Date.now(),
): ScannerResponse {
  const scanCounts = scannerCounts(response.coins || []);
  const { selected, excluded } = selectDisplayableOfficialLive(
    activeOfficial,
    response.coins || [],
    nowMs,
  );
  const bySymbol = new Map((response.coins || []).map((coin) => [coin.symbol.toUpperCase(), coin]));
  const officialLive = selected.map((record) =>
    coinScanFromOfficial(record, bySymbol.get(record.symbol.toUpperCase()) || null),
  );

  return {
    ...response,
    // Keep Top 50 board + counts pure — official lifecycle is a separate layer.
    counts: scanCounts,
    officialLive,
    officialLiveExcluded: excluded,
    nearSetups: selectNearSetups(response.coins || []),
  };
}
