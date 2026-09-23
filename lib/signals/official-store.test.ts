import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { OfficialSignalStore, officialFromPublished } from "./official-store";
import { MemoryOfficialRemote } from "./firestore-official";
import { reportFrom } from "./performance";
import { CALCULATION_VERSION, officialSignalId } from "./official-types";
import type { PublishedSignal } from "@/lib/signals-engine/lifecycle";
import { SCAN_SYMBOLS, type CoinScan } from "@/lib/signals-engine/types";

function store(remote: MemoryOfficialRemote | null = null) {
  return new OfficialSignalStore(path.join(mkdtempSync(path.join(tmpdir(), "signals-")), "official.json"), remote);
}

function published(symbol: string): PublishedSignal {
  return {
    symbol,
    direction: "LONG",
    entry: 100,
    stop: 99,
    target: 102,
    lastCandleCloseAt: "2026-09-22T00:00:00.000Z",
    pattern: "None",
    patternStatus: "UNCONFIRMED",
    entryConditions: "test",
    reason: "test",
    nextStep: "test",
    lifecycle: {
      status: "WAITING_FOR_ENTRY",
      fillConfirmed: false,
      observedTrigger: false,
      seenAwayFromEntry: false,
      originalEntry: 100,
      openedAt: "2026-09-22T00:00:00.000Z",
      expiresAt: "2026-09-22T04:00:00.000Z",
      lastCandleCloseAt: "2026-09-22T00:00:00.000Z",
      triggerObservedAt: null,
      closedAt: null,
      note: "test",
      nextStep: "test",
    },
  };
}

function coin(symbol: string): CoinScan {
  return {
    symbol,
    available: true,
    price: 100.1,
    priceUpdatedAt: "2026-09-22T00:00:05.000Z",
    stale: false,
    trend: "BULLISH",
    direction: "LONG",
    pattern: "None",
    patternStatus: "UNCONFIRMED",
    timeframes: [],
    setup: {
      direction: "LONG",
      executable: true,
      executableReason: "ok",
      validationReasons: [],
      marginUSDT: 1,
      allocatedMarginUSDT: 1,
      requiredMarginUSDT: 1,
      leverage: 20,
      marginMode: "ISOLATED",
      notionalUSDT: 20,
      quantity: 0.2,
      entry: 100,
      stop: 99,
      target: 102,
      riskReward: 2,
      grossRiskReward: 2,
      netRiskReward: 1.8,
      estimatedProfitUSDT: 0.4,
      estimatedLossUSDT: 0.22,
      estimatedFeesUSDT: 0.02,
      entryFeeUSDT: 0.01,
      exitFeeUSDT: 0.01,
      totalFeesUSDT: 0.02,
      grossProfitUSDT: 0.4,
      grossLossUSDT: 0.2,
      netProfitUSDT: 0.38,
      netLossUSDT: 0.22,
      tickSize: 0.01,
      stepSize: 0.01,
      minNotional: 5,
      minQty: 0.01,
      liquidationEstimateUSDT: null,
      liquidationRisk: "UNAVAILABLE",
      liquidationNote: "unavailable",
    },
    entryConditions: "test",
    reason: "test",
    nextStep: "test",
    lastCandleCloseAt: "2026-09-22T00:00:00.000Z",
    analyzedAt: "2026-09-22T00:00:00.000Z",
    originalEntry: 100,
  };
}

describe("official store persistence", () => {
  it("creates idempotently and never overwrites frozen prices", async () => {
    const db = store();
    const first = officialFromPublished(coin("XLMUSDT"), published("XLMUSDT"));
    const created = await db.upsertCreate(first);
    const again = await db.upsertCreate({ ...first, originalEntry: 999, stop: 1, target: 2, quantity: 99 });
    expect(created.created).toBe(true);
    expect(again.created).toBe(false);
    expect(again.record.originalEntry).toBe(100);
    expect(again.record.stop).toBe(99);
    expect(again.record.target).toBe(102);
    expect(again.record.quantity).toBe(0.2);
    expect(again.record.calculationVersion).toBe(CALCULATION_VERSION);
    expect(db.frozenFieldsIntact(first, again.record)).toBe(true);
  });

  it("restores after a memory reset using the same signal id", async () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "signals-")), "official.json");
    const db = new OfficialSignalStore(file, null);
    const record = officialFromPublished(coin("BTCUSDT"), published("BTCUSDT"));
    await db.upsertCreate(record);
    db.resetMemory();
    const restored = await db.get(record.id);
    expect(restored?.originalEntry).toBe(100);
    expect(restored?.id).toBe(officialSignalId({
      symbol: "BTCUSDT",
      interval: "15m",
      direction: "LONG",
      entry: 100,
      openedAt: "2026-09-22T00:00:00.000Z",
    }));
  });

  it.each([...SCAN_SYMBOLS])("stores a unique official id for %s", async (symbol) => {
    const db = store();
    const record = officialFromPublished(coin(symbol), published(symbol));
    const first = await db.upsertCreate(record);
    const second = await db.upsertCreate(record);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(record.id.startsWith(`${symbol}-15m-LONG-`)).toBe(true);
  });

  it("records lifecycle events without flipping fillConfirmed", async () => {
    const db = store();
    const record = officialFromPublished(coin("ETHUSDT"), published("ETHUSDT"));
    await db.upsertCreate(record);
    const updated = await db.updateLifecycle({
      id: record.id,
      status: "MISSED_ENTRY",
      observedTrigger: false,
      lastPrice: 101.2,
      lastPriceAt: "2026-09-22T00:01:00.000Z",
      closedAt: "2026-09-22T00:01:00.000Z",
      note: "Missed. Not a fill.",
    });
    expect(updated.changed).toBe(true);
    expect(updated.record?.fillConfirmed).toBe(false);
    expect(updated.record?.originalEntry).toBe(100);
    const events = await db.eventsFor(record.id);
    expect(events[0]?.toStatus).toBe("MISSED_ENTRY");
    expect(events[0]?.fillConfirmed).toBe(false);
  });
});

describe("official performance", () => {
  it("does not count unfilled signals as verified wins", async () => {
    const db = store();
    const waiting = officialFromPublished(coin("ADAUSDT"), published("ADAUSDT"));
    await db.upsertCreate(waiting);
    await db.recordOutcome({
      signalId: waiting.id,
      kind: "TARGET_HIT",
      at: "2026-09-22T00:10:00.000Z",
      price: 102,
      fillConfirmed: false,
      brokerageVerified: false,
      hypotheticalGrossPnl: 0.4,
      hypotheticalNetPnl: 0.38,
    });
    const report = reportFrom(await db.listSignals(), await db.outcomes());
    expect(report.brokerageVerified).toBe(0);
    expect(report.fillConfirmed).toBe(0);
    expect(report.hypotheticalNetPnl).toBeCloseTo(0.38, 4);
    expect(report.note).toContain("not counted as verified wins");
  });
});

describe("hybrid Firestore official store", () => {
  it("writes official records to the remote backend and restores after a local memory reset", async () => {
    const remote = new MemoryOfficialRemote();
    const file = path.join(mkdtempSync(path.join(tmpdir(), "signals-")), "official.json");
    const db = new OfficialSignalStore(file, remote);
    const record = officialFromPublished(coin("SOLUSDT"), published("SOLUSDT"));
    await db.upsertCreate(record);
    expect(remote.signals.has(record.id)).toBe(true);
    expect(remote.signals.get(record.id)?.originalEntry).toBe(100);
    db.resetMemory();
    const restored = await db.get(record.id);
    expect(restored?.originalEntry).toBe(100);
    expect(restored?.id).toBe(record.id);
  });

  it("keeps the first frozen snapshot when a duplicate create is attempted remotely", async () => {
    const remote = new MemoryOfficialRemote();
    const db = store(remote);
    const first = officialFromPublished(coin("DOGEUSDT"), published("DOGEUSDT"));
    await db.upsertCreate(first);
    const again = await db.upsertCreate({ ...first, originalEntry: 55, stop: 1, target: 9, quantity: 88 });
    expect(again.created).toBe(false);
    expect(again.record.originalEntry).toBe(100);
    expect(remote.signals.get(first.id)?.originalEntry).toBe(100);
  });
});
