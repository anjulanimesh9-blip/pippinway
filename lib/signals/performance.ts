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
  ambiguous: number;
  targetHits: number;
  stopHits: number;
  wins: number;
  losses: number;
  resolved: number;
  /** null until at least one TARGET_HIT or STOP_HIT exists */
  winRate: number | null;
  winRateLabel: string;
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

/** Dedupe identical frozen setups so republishes do not inflate win rate. */
function uniqueResolvedSignals(records: OfficialSignal[]): OfficialSignal[] {
  const seen = new Set<string>();
  const out: OfficialSignal[] = [];
  for (const record of records) {
    if (record.lifecycleStatus !== "TARGET_HIT" && record.lifecycleStatus !== "STOP_HIT") continue;
    const key = `${record.symbol}|${record.direction}|${record.originalEntry}|${record.stop}|${record.target}|${record.pattern}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(record);
  }
  return out;
}

export function reportFrom(records: OfficialSignal[], outcomes: ObservedOutcome[]): PerformanceReport {
  const uniqueHits = uniqueResolvedSignals(records);
  const wins = uniqueHits.filter((item) => item.lifecycleStatus === "TARGET_HIT").length;
  const losses = uniqueHits.filter((item) => item.lifecycleStatus === "STOP_HIT").length;
  const resolved = wins + losses;
  const winRate = resolved > 0 ? wins / resolved : null;

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
    ambiguous: count(records, "AMBIGUOUS"),
    targetHits: wins,
    stopHits: losses,
    wins,
    losses,
    resolved,
    winRate,
    winRateLabel:
      winRate == null
        ? "No resolved official TARGET/STOP outcomes yet"
        : `${(winRate * 100).toFixed(1)}% (${wins} wins / ${resolved} resolved signals)`,
    sampleSize: records.length,
    observedSample: observedHits.length,
    hypotheticalGrossPnl: Number(gross.toFixed(4)),
    hypotheticalNetPnl: Number(net.toFixed(4)),
    maxDrawdownUSDT: observedHits.length ? Number(drawdown.toFixed(4)) : null,
    brokerageVerified: 0,
    fillConfirmed: records.filter((item) => item.fillConfirmed).length,
    sources: {
      backtest: "Walk-forward educational sample only. Never shown as Official Live win rate.",
      forwardObserved: "Official published signals resolved to TARGET_HIT or STOP_HIT. AMBIGUOUS / EXPIRED / INVALIDATED are excluded.",
      brokerageVerified: "No execution venue is connected. Verified fills remain zero.",
    },
    note: "Official win rate uses TARGET_HIT / (TARGET_HIT + STOP_HIT) only. Unfilled, missed, expired and invalidated signals are not counted as verified wins. Educational/backtest percentages are separate and are never labeled as live product performance.",
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
