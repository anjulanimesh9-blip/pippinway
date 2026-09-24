import { describe, expect, it } from "vitest";
import { monitorIsLive, monitorStatusLabel, nextCycleLabel } from "./health";

describe("monitor health labels", () => {
  it("only calls the feed live when the worker is running and recently stamped", () => {
    const now = Date.parse("2026-09-23T02:00:00.000Z");
    expect(monitorIsLive({ workerStatus: "running", lastCycleAt: "2026-09-23T01:59:30.000Z" }, now)).toBe(true);
    expect(monitorIsLive({ workerStatus: "idle", lastCycleAt: "2026-09-23T01:59:30.000Z" }, now)).toBe(false);
    expect(monitorIsLive({ workerStatus: "running", lastCycleAt: "2026-09-23T01:50:00.000Z" }, now)).toBe(false);
    expect(monitorStatusLabel({ workerStatus: "error" }, now)).toBe("Error");
    expect(nextCycleLabel({ lastCycleAt: "2026-09-23T01:59:20.000Z" }, now)).toBe("In 4m");
    expect(nextCycleLabel({ nextAnalysisAt: "2026-09-23T02:00:30.000Z" }, now)).toBe("In 30s");
    expect(nextCycleLabel({ nextAnalysisAt: "2026-09-23T02:05:00.000Z" }, now)).toBe("In 5m");
  });
});
