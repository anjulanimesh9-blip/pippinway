import { describe, expect, it } from "vitest";
import { FIXTURE_PRICES, fixtureFilters } from "./exchange-fixtures";
import {
  SIGNAL_TTL_MS,
  advanceLifecycle,
  createLifecycle,
  inEntryZone,
  lifecycleAllowsFreshEntry,
  reconcilePublishedSignal,
} from "./lifecycle";
import { buildSetup } from "./trading";
import { SCAN_SYMBOLS, type CoinScan } from "./types";

const SYMBOLS = [...SCAN_SYMBOLS];

function openedAt(offsetMs = 0) {
  return new Date(Date.parse("2026-09-22T00:00:00.000Z") + offsetMs).toISOString();
}

function freshCoin(symbol: string, direction: "LONG" | "SHORT" | "WAIT", livePrice: number, entry = FIXTURE_PRICES[symbol]): CoinScan {
  const filters = fixtureFilters(symbol);
  const setup =
    direction === "WAIT"
      ? null
      : buildSetup({
          direction,
          entry,
          stop: direction === "LONG" ? entry * 0.99 : entry * 1.01,
          target: direction === "LONG" ? entry * 1.02 : entry * 0.98,
          filters,
          marginUSDT: 100,
          leverage: 20,
        });
  return {
    symbol,
    available: true,
    price: livePrice,
    priceUpdatedAt: openedAt(),
    stale: false,
    trend: direction === "SHORT" ? "BEARISH" : "BULLISH",
    direction,
    pattern: "None",
    patternStatus: "UNCONFIRMED",
    timeframes: [],
    filters,
    setup,
    entryConditions: "Wait for original entry.",
    reason: "test",
    nextStep: "test",
    lastCandleCloseAt: openedAt(),
    analyzedAt: openedAt(),
    originalEntry: setup?.entry,
  };
}

describe.each(SYMBOLS)("%s lifecycle", (symbol) => {
  const entry = FIXTURE_PRICES[symbol];

  it("starts WAITING FOR ENTRY and keeps the original entry", () => {
    const result = reconcilePublishedSignal(freshCoin(symbol, "LONG", entry * 1.001), null, openedAt());
    expect(result.coin.lifecycle?.status).toBe("WAITING_FOR_ENTRY");
    expect(result.coin.originalEntry).toBe(entry);
    expect(result.coin.setup?.entry).toBe(entry);
    expect(result.coin.lifecycle?.fillConfirmed).toBe(false);
  });

  it("marks MISSED ENTRY when price has already run toward the target", () => {
    const result = reconcilePublishedSignal(freshCoin(symbol, "LONG", entry * 1.012), null, openedAt());
    expect(result.coin.lifecycle?.status).toBe("MISSED_ENTRY");
    expect(result.coin.setup?.entry).toBe(entry);
    expect(result.coin.setup?.executable).toBe(false);
    expect(result.coin.setup?.executableReason).toContain("NOT EXECUTABLE");
  });

  it("does not treat a price cross as a confirmed fill", () => {
    const first = reconcilePublishedSignal(freshCoin(symbol, "SHORT", entry * 1.001), null, openedAt());
    const away = { ...first.coin, price: entry * 1.006 };
    const left = reconcilePublishedSignal(away, first.published, openedAt(60_000));
    const back = reconcilePublishedSignal({ ...left.coin, price: entry }, left.published, openedAt(120_000));
    expect(back.coin.lifecycle?.status === "TRIGGERED" || back.coin.lifecycle?.status === "ACTIVE").toBe(true);
    expect(back.coin.lifecycle?.fillConfirmed).toBe(false);
    expect(back.coin.setup?.entry).toBe(entry);
  });

  it("expires instead of rewriting the entry after the TTL", () => {
    const first = reconcilePublishedSignal(freshCoin(symbol, "LONG", entry), null, openedAt());
    const later = reconcilePublishedSignal(
      { ...first.coin, price: entry * 1.001, lastCandleCloseAt: openedAt() },
      first.published,
      openedAt(SIGNAL_TTL_MS + 1000),
    );
    expect(later.coin.lifecycle?.status).toBe("EXPIRED");
    expect(later.coin.setup?.entry).toBe(entry);
    expect(later.coin.setup?.executable).toBe(false);
  });

  it("keeps a published WAITING signal when a later scan flips direction (pattern changes do not invalidate)", () => {
    const first = reconcilePublishedSignal(freshCoin(symbol, "LONG", entry), null, openedAt());
    const flipped = reconcilePublishedSignal(
      { ...freshCoin(symbol, "SHORT", entry * 0.999), lastCandleCloseAt: first.coin.lastCandleCloseAt },
      first.published,
      openedAt(30_000),
    );
    expect(flipped.coin.lifecycle?.status).not.toBe("INVALIDATED");
    expect(flipped.coin.setup?.entry).toBe(entry);
    expect(flipped.coin.direction).toBe("LONG");
  });

  it("keeps an expired signal on the same candle instead of publishing a fresh one", () => {
    const first = reconcilePublishedSignal(freshCoin(symbol, "LONG", entry * 1.012), null, openedAt());
    expect(first.coin.lifecycle?.status).toBe("MISSED_ENTRY");
    const again = reconcilePublishedSignal(
      freshCoin(symbol, "LONG", entry * 1.02),
      first.published,
      openedAt(5_000),
    );
    expect(again.coin.setup?.entry).toBe(entry);
    expect(again.coin.lifecycle?.status).toBe("MISSED_ENTRY");
    expect(again.coin.setup?.executable).toBe(false);
  });
});

describe("lifecycle helpers", () => {
  it("does not assume a fill from an entry-zone touch", () => {
    expect(inEntryZone(100, 100.1, 0.1)).toBe(true);
    const lifecycle = createLifecycle({
      originalEntry: 100,
      openedAt: openedAt(),
      lastCandleCloseAt: openedAt(),
      entryConditions: "test",
    });
    const advanced = advanceLifecycle({
      lifecycle: { ...lifecycle, seenAwayFromEntry: true },
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      livePrice: 100,
      now: openedAt(1000),
      conditionsHold: true,
    });
    expect(advanced.status).toBe("TRIGGERED");
    expect(advanced.fillConfirmed).toBe(false);
  });

  it("does not invalidate a frozen published signal just because a later scan fails the 1:3 gate", () => {
    const first = reconcilePublishedSignal(freshCoin("ETHUSDT", "LONG", FIXTURE_PRICES.ETHUSDT * 1.001), null, openedAt());
    expect(first.published).toBeTruthy();
    const later = reconcilePublishedSignal({
      ...first.coin,
      direction: "WAIT",
      setup: null,
      reason: "Net risk/reward is 1:1.90. Structure does not support a defensible 1:3 target after fees. Targets were not stretched to manufacture the ratio.",
    }, first.published, openedAt(60_000));
    expect(later.published).toBeTruthy();
    expect(later.coin.originalEntry).toBe(FIXTURE_PRICES.ETHUSDT);
    expect(later.coin.lifecycle?.status).not.toBe("INVALIDATED");
  });

  it("blocks ACTIVE and terminal states from looking like fresh entries", () => {
    const setup = buildSetup({
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      filters: fixtureFilters("ETHUSDT"),
      marginUSDT: 100,
      leverage: 20,
    });
    const waiting = createLifecycle({ originalEntry: 100, openedAt: openedAt(), lastCandleCloseAt: openedAt(), entryConditions: "x" });
    expect(lifecycleAllowsFreshEntry(waiting, 100, setup)).toBe(true);
    expect(lifecycleAllowsFreshEntry({ ...waiting, status: "ACTIVE" }, 100.5, setup)).toBe(false);
    expect(lifecycleAllowsFreshEntry({ ...waiting, status: "MISSED_ENTRY" }, 101, setup)).toBe(false);
  });
});
