import { describe, expect, it } from "vitest";
import { applyReveal, allowanceFromRecord, utcDate, utcResetAt } from "./quota";

describe("free daily reveal quota", () => {
  it("counts unique symbols and ignores repeats on the same UTC day", () => {
    const first = applyReveal(null, "u1", "BTCUSDT", 4, Date.parse("2026-09-22T10:00:00Z"));
    expect(first.consumed).toBe(true);
    expect(first.allowance.used).toBe(1);
    const again = applyReveal(first.record, "u1", "btcusdt", 4, Date.parse("2026-09-22T23:00:00Z"));
    expect(again.consumed).toBe(false);
    expect(again.already).toBe(true);
    expect(again.allowed).toBe(true);
    expect(again.allowance.used).toBe(1);
  });

  it("blocks the fifth unique signal and resets after 00:00 UTC", () => {
    let record = null as ReturnType<typeof applyReveal>["record"] | null;
    for (const symbol of ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]) {
      const next = applyReveal(record, "u1", symbol, 4, Date.parse("2026-09-22T12:00:00Z"));
      expect(next.allowed).toBe(true);
      record = next.record;
    }
    const fifth = applyReveal(record, "u1", "XRPUSDT", 4, Date.parse("2026-09-22T23:59:00Z"));
    expect(fifth.allowed).toBe(false);
    expect(fifth.allowance.used).toBe(4);
    const nextDay = applyReveal(record, "u1", "XRPUSDT", 4, Date.parse("2026-09-23T00:00:00Z"));
    expect(nextDay.allowed).toBe(true);
    expect(nextDay.allowance.used).toBe(1);
    expect(utcDate(Date.parse("2026-09-23T00:00:00Z"))).toBe("2026-09-23");
    expect(utcResetAt("2026-09-22")).toBe("2026-09-23T00:00:00.000Z");
  });

  it("does not treat empty pending records as used allowance", () => {
    const allowance = allowanceFromRecord(null, 4, Date.parse("2026-09-22T01:00:00Z"));
    expect(allowance.used).toBe(0);
    expect(allowance.remaining).toBe(4);
  });
});
