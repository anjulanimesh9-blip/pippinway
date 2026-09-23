import { TERMINAL_OFFICIAL, type OfficialSignal, type ObservedOutcome } from "@/lib/signals/official-types";
import { getOfficialStore } from "@/lib/signals/official-store";

export type PerformanceReport = {
  published: number;
  waiting: number;
  triggered: number;
  active: number;
  missed: number;
  expired: number;
  invalidated: number;
  targetHits: number;
  stopHits: number;
  sampleSize: number;
  observedSample: number;
  hypotheticalGrossPnl: number;
  hypotheticalNetPnl: number;
  maxDrawdownUSDT: number | null;
  brokerageVerified: number;
  fillConfirmed: number;
  sources: {
    backtest: string;
    forwardObserved: string;
    brokerageVerified: string;
  };
  note: string;
};

function count(records: OfficialSignal[], status: OfficialSignal["lifecycleStatus"]) {
  return records.filter((item) => item.lifecycleStatus === status).length;
}

export function reportFrom(records: OfficialSignal[], outcomes: ObservedOutcome[]): PerformanceReport {
  const observedHits = outcomes.filter((item) => item.kind === "TARGET_HIT" || item.kind === "STOP_HIT");
  const chronological = [...observedHits].sort((a, b) => a.at.localeCompare(b.at));
  let equity = 0;
  let peak = 0;
  let drawdown = 0;
  for (const item of chronological) {
    equity += item.hypotheticalNetPnl || 0;
    peak = Math.max(peak, equity);
    drawdown = Math.max(drawdown, peak - equity);
  }
  const gross = observedHits.reduce((sum, item) => sum + (item.hypotheticalGrossPnl || 0), 0);
  const net = observedHits.reduce((sum, item) => sum + (item.hypotheticalNetPnl || 0), 0);
  return {
    published: records.length,
    waiting: count(records, "WAITING_FOR_ENTRY"),
    triggered: count(records, "TRIGGERED") + records.filter((item) => item.observedTrigger).length,
    active: count(records, "ACTIVE"),
    missed: count(records, "MISSED_ENTRY"),
    expired: count(records, "EXPIRED"),
    invalidated: count(records, "INVALIDATED"),
    targetHits: count(records, "TARGET_HIT"),
    stopHits: count(records, "STOP_HIT"),
    sampleSize: records.length,
    observedSample: observedHits.length,
    hypotheticalGrossPnl: Number(gross.toFixed(4)),
    hypotheticalNetPnl: Number(net.toFixed(4)),
    maxDrawdownUSDT: observedHits.length ? Number(drawdown.toFixed(4)) : null,
    brokerageVerified: 0,
    fillConfirmed: records.filter((item) => item.fillConfirmed).length,
    sources: {
      backtest: "Walk-forward 1H closed-candle sample. Separate from live official records.",
      forwardObserved: "Official published signals and later price-path observations. A target or stop print is not a brokerage fill.",
      brokerageVerified: "No execution venue is connected. Verified fills remain zero.",
    },
    note: "Unfilled, missed, expired and invalidated signals are not counted as verified wins. Hypothetical P/L uses stored quantity and fees only after an observed target or stop, and stays unconfirmed.",
  };
}

export async function getOfficialPerformance(): Promise<PerformanceReport> {
  const store = getOfficialStore();
  return reportFrom(await store.listSignals(), await store.outcomes());
}

export function activeCount(records: OfficialSignal[]) {
  return records.filter((item) => !TERMINAL_OFFICIAL.includes(item.lifecycleStatus)).length;
}

export function expiredCount(records: OfficialSignal[]) {
  return records.filter((item) => item.lifecycleStatus === "EXPIRED" || item.lifecycleStatus === "MISSED_ENTRY" || item.lifecycleStatus === "INVALIDATED").length;
}
