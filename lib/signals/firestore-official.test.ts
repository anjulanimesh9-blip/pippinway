import { describe, expect, it } from "vitest";
import {
  decodeFirestoreValue,
  encodeFirestoreValue,
  fromFirestoreFields,
  mergeOfficialSnapshots,
  toFirestoreFields,
} from "./firestore-official";
import { emptyHealth, officialSignalId } from "./official-types";

describe("Firestore official field codec", () => {
  it("round-trips official signal numbers, booleans and nulls", () => {
    const record = {
      id: officialSignalId({
        symbol: "BTCUSDT",
        interval: "15m",
        direction: "LONG",
        entry: 100,
        openedAt: "2026-09-22T00:00:00.000Z",
      }),
      originalEntry: 100.25,
      fillConfirmed: false,
      lastPrice: null,
      quantity: 0.2,
    };
    const fields = toFirestoreFields(record);
    const decoded = fromFirestoreFields(fields);
    expect(decoded.originalEntry).toBe(100.25);
    expect(decoded.fillConfirmed).toBe(false);
    expect(decoded.lastPrice).toBeNull();
    expect(decoded.quantity).toBe(0.2);
    expect(encodeFirestoreValue(true)).toEqual({ booleanValue: true });
    expect(decodeFirestoreValue({ integerValue: "20" })).toBe(20);
  });
});

describe("official snapshot merge", () => {
  it("never overwrites the original entry, stop, target or finance snapshot", () => {
    const id = "XLMUSDT-15m-LONG-100.00000-2026-09-22T00:00";
    const local = {
      signals: [
        {
          id,
          originalEntry: 100,
          stop: 99,
          target: 102,
          quantity: 0.2,
          marginUSDT: 1,
          leverage: 20,
          marginMode: "ISOLATED" as const,
          totalFeesUSDT: 0.02,
          notionalUSDT: 20,
          requiredMarginUSDT: 1,
          calculationVersion: "pw-signals-v2",
          openedAt: "2026-09-22T00:00:00.000Z",
          createdAt: "2026-09-22T00:00:00.000Z",
          lifecycleStatus: "WAITING_FOR_ENTRY" as const,
          lastPrice: 100.1,
          lastPriceAt: "2026-09-22T00:00:05.000Z",
          closedAt: null,
          observedTrigger: false,
          updatedAt: "2026-09-22T00:00:05.000Z",
          fillConfirmed: false as const,
          brokerageVerified: false as const,
          snapshotFrozen: true as const,
        },
      ],
      events: [],
      outcomes: [],
      health: emptyHealth("file"),
    };
    const remote = {
      signals: [
        {
          ...local.signals[0],
          originalEntry: 999,
          stop: 1,
          target: 2,
          quantity: 99,
          lifecycleStatus: "TRIGGERED" as const,
          lastPrice: 100.2,
          updatedAt: "2026-09-22T00:01:00.000Z",
        },
      ],
      events: [],
      outcomes: [],
      health: { ...emptyHealth("firestore"), updatedAt: "2026-09-22T00:01:00.000Z" },
    };
    const merged = mergeOfficialSnapshots(local as never, remote as never);
    expect(merged.signals[0].originalEntry).toBe(100);
    expect(merged.signals[0].stop).toBe(99);
    expect(merged.signals[0].target).toBe(102);
    expect(merged.signals[0].quantity).toBe(0.2);
    expect(merged.signals[0].lifecycleStatus).toBe("TRIGGERED");
  });
});
