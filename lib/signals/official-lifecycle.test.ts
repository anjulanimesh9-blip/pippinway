import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  advanceLifecycle,
  createLifecycle,
  reconcilePublishedSignal,
  resolveOutcomeFromCandle,
} from "../signals-engine/lifecycle";
import { resolveActiveFromCandles } from "../signals-engine/monitor";
import { buildSetup } from "../signals-engine/trading";
import { fixtureFilters } from "../signals-engine/exchange-fixtures";
import type { CoinScan } from "../signals-engine/types";
import { OfficialSignalStore, officialFromPublished } from "./official-store";
import { reportFrom } from "./performance";
import type { OfficialSignal } from "./official-types";
import type { PublishedSignal } from "../signals-engine/lifecycle";

function openedAt(offsetMs = 0) {
  return new Date(Date.parse("2026-09-24T00:00:00.000Z") + offsetMs).toISOString();
}

function baseLifecycle(entry = 100) {
  return createLifecycle({
    originalEntry: entry,
    openedAt: openedAt(),
    lastCandleCloseAt: openedAt(),
    entryConditions: "test",
  });
}

function activeLifecycle(entry = 100): ReturnType<typeof createLifecycle> {
  return {
    ...baseLifecycle(entry),
    status: "ACTIVE",
    observedTrigger: true,
    seenAwayFromEntry: true,
    triggerObservedAt: openedAt(60_000),
  };
}

function coin(direction: "LONG" | "SHORT" | "WAIT", price: number, entry = 100): CoinScan {
  const filters = fixtureFilters("ETHUSDT");
  const setup =
    direction === "WAIT"
      ? null
      : buildSetup({
          direction,
          entry,
          stop: direction === "LONG" ? entry - 1 : entry + 1,
          target: direction === "LONG" ? entry + 2 : entry - 2,
          filters,
        });
  return {
    symbol: "ETHUSDT",
    available: true,
    price,
    priceUpdatedAt: openedAt(),
    stale: false,
    trend: "MIXED",
    direction,
    pattern: "Double Bottom",
    patternStatus: "CONFIRMED",
    timeframes: [],
    filters,
    setup,
    entryConditions: "test",
    reason: "test",
    nextStep: "test",
    lastCandleCloseAt: openedAt(),
    analyzedAt: openedAt(),
  };
}

function officialFromSetup(direction: "LONG" | "SHORT", status: OfficialSignal["lifecycleStatus"] = "ACTIVE"): OfficialSignal {
  const published: PublishedSignal = {
    symbol: "ETHUSDT",
    direction,
    entry: 100,
    stop: direction === "LONG" ? 99 : 101,
    target: direction === "LONG" ? 102 : 98,
    pattern: "Double Bottom",
    patternStatus: "CONFIRMED",
    entryConditions: "test",
    reason: "test",
    nextStep: "test",
    lastCandleCloseAt: openedAt(),
    lifecycle: {
      ...activeLifecycle(100),
      status,
      openedAt: openedAt(),
      expiresAt: openedAt(4 * 60 * 60_000),
    },
  };
  return officialFromPublished(coin(direction, 100.5), published);
}

describe("candle outcome resolution", () => {
  it("LONG TP via candle high", () => {
    expect(resolveOutcomeFromCandle("LONG", 99, 102, 102.5, 100)).toBe("TARGET_HIT");
  });
  it("LONG SL via candle low", () => {
    expect(resolveOutcomeFromCandle("LONG", 99, 102, 100.5, 98.5)).toBe("STOP_HIT");
  });
  it("SHORT TP via candle low", () => {
    expect(resolveOutcomeFromCandle("SHORT", 101, 98, 100, 97.5)).toBe("TARGET_HIT");
  });
  it("SHORT SL via candle high", () => {
    expect(resolveOutcomeFromCandle("SHORT", 101, 98, 101.5, 99)).toBe("STOP_HIT");
  });
  it("same-candle both sides → AMBIGUOUS", () => {
    expect(resolveOutcomeFromCandle("LONG", 99, 102, 103, 98)).toBe("AMBIGUOUS");
    expect(resolveOutcomeFromCandle("SHORT", 101, 98, 102, 97)).toBe("AMBIGUOUS");
  });
});

describe("advanceLifecycle TP/SL", () => {
  it("LONG reaches TP", () => {
    const advanced = advanceLifecycle({
      lifecycle: activeLifecycle(),
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      livePrice: 101,
      now: openedAt(120_000),
      candleHigh: 102.1,
      candleLow: 100.5,
    });
    expect(advanced.status).toBe("TARGET_HIT");
  });

  it("LONG reaches SL", () => {
    const advanced = advanceLifecycle({
      lifecycle: activeLifecycle(),
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      livePrice: 99.5,
      now: openedAt(120_000),
      candleHigh: 100.2,
      candleLow: 98.8,
    });
    expect(advanced.status).toBe("STOP_HIT");
  });

  it("SHORT reaches TP", () => {
    const advanced = advanceLifecycle({
      lifecycle: activeLifecycle(),
      direction: "SHORT",
      entry: 100,
      stop: 101,
      target: 98,
      livePrice: 99,
      now: openedAt(120_000),
      candleHigh: 100.2,
      candleLow: 97.9,
    });
    expect(advanced.status).toBe("TARGET_HIT");
  });

  it("SHORT reaches SL", () => {
    const advanced = advanceLifecycle({
      lifecycle: activeLifecycle(),
      direction: "SHORT",
      entry: 100,
      stop: 101,
      target: 98,
      livePrice: 100.5,
      now: openedAt(120_000),
      candleHigh: 101.2,
      candleLow: 99.8,
    });
    expect(advanced.status).toBe("STOP_HIT");
  });

  it("same-candle ambiguous", () => {
    const advanced = advanceLifecycle({
      lifecycle: activeLifecycle(),
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      livePrice: 100.5,
      now: openedAt(120_000),
      candleHigh: 103,
      candleLow: 98,
    });
    expect(advanced.status).toBe("AMBIGUOUS");
  });

  it("TRIGGERED/ACTIVE does not TTL-expire", () => {
    const advanced = advanceLifecycle({
      lifecycle: { ...activeLifecycle(), expiresAt: openedAt(1) },
      direction: "LONG",
      entry: 100,
      stop: 99,
      target: 102,
      livePrice: 100.5,
      now: openedAt(10 * 60 * 60_000),
    });
    expect(advanced.status).toBe("ACTIVE");
    expect(advanced.status).not.toBe("EXPIRED");
  });
});

describe("published signal vs later WAIT / Top-100 dropout", () => {
  it("subsequent WAIT does not invalidate ACTIVE signal", () => {
    const first = reconcilePublishedSignal(coin("LONG", 100.1), null, openedAt());
    expect(first.published).toBeTruthy();
    // Force ACTIVE
    const triggered = reconcilePublishedSignal(
      { ...first.coin, price: 100 },
      {
        ...first.published!,
        lifecycle: { ...first.published!.lifecycle, status: "ACTIVE", observedTrigger: true, seenAwayFromEntry: true },
      },
      openedAt(60_000),
    );
    const waitScan = reconcilePublishedSignal(
      { ...coin("WAIT", 100.4), lastCandleCloseAt: openedAt(120_000) },
      triggered.published,
      openedAt(120_000),
    );
    expect(waitScan.coin.lifecycle?.status).toBe("ACTIVE");
    expect(waitScan.coin.direction).toBe("LONG");
    expect(waitScan.coin.setup?.entry).toBe(100);
    expect(waitScan.coin.setup?.stop).toBe(99);
    expect(waitScan.coin.setup?.target).toBe(102);
  });

  it("signal dropped from Top 100 still resolves via candle path helper", () => {
    const record = officialFromSetup("LONG", "ACTIVE");
    const advanced = resolveActiveFromCandles(
      record,
      [{ high: 102.5, low: 100.1, close: 102.2, openTime: Date.parse(openedAt(60_000)) }],
      openedAt(120_000),
      102.2,
    );
    expect(advanced.status).toBe("TARGET_HIT");
  });
});

describe("official store terminal protection + win rate", () => {
  it("terminal outcome cannot be overwritten and duplicate setup does not double-count", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "official-life-"));
    const store = new OfficialSignalStore(path.join(dir, "official.json"), null);
    // Patch global store used by persistReconcile via direct store methods.
    const longHit = officialFromSetup("LONG", "TARGET_HIT");
    longHit.closedAt = openedAt(180_000);
    await store.upsertCreate(longHit);
    await store.recordOutcome({
      signalId: longHit.id,
      kind: "TARGET_HIT",
      at: openedAt(180_000),
      price: 102,
      fillConfirmed: false,
      brokerageVerified: false,
      hypotheticalGrossPnl: 2,
      hypotheticalNetPnl: 1.8,
    });

    const overwrite = await store.updateLifecycle({
      id: longHit.id,
      status: "STOP_HIT",
      observedTrigger: true,
      lastPrice: 98,
      lastPriceAt: openedAt(200_000),
      closedAt: openedAt(200_000),
      note: "should not overwrite",
    });
    expect(overwrite.changed).toBe(false);
    expect(overwrite.record?.lifecycleStatus).toBe("TARGET_HIT");

    // Duplicate identical setup levels should not inflate win rate.
    const dup = { ...longHit, id: longHit.id + "-dup", openedAt: openedAt(1_000) };
    await store.upsertCreate(dup);

    const report = reportFrom(await store.listSignals(), await store.outcomes());
    expect(report.wins).toBe(1);
    expect(report.losses).toBe(0);
    expect(report.resolved).toBe(1);
    expect(report.winRate).toBe(1);
    expect(report.winRateLabel).toContain("100.0%");
    expect(report.ambiguous).toBe(0);
  });

  it("does not display a win-rate percentage until at least one resolved official signal exists", () => {
    const waiting = officialFromSetup("LONG", "WAITING_FOR_ENTRY");
    waiting.lifecycleStatus = "WAITING_FOR_ENTRY";
    waiting.observedTrigger = false;
    const report = reportFrom([waiting], []);
    expect(report.resolved).toBe(0);
    expect(report.winRate).toBeNull();
    expect(report.winRateLabel).toMatch(/No resolved official/i);
  });
});
