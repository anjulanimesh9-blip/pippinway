"use client";

import LiveMonitorBadge from "./LiveMonitorBadge";
import { lastMonitorAt, nextCycleLabel, type MonitorHealth } from "../lib/health";

type Health = MonitorHealth & {
  lastFullUniverseAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseDurationMs?: number | null;
  analysisDurationMs?: number | null;
  queueBacklog?: number | null;
  failedCount?: number | null;
  pendingCount?: number | null;
  freshCount?: number | null;
  selectedCount?: number | null;
  analyzedCount?: number | null;
  priceUpdatedCount?: number | null;
  coverageNote?: string | null;
  lastBinanceStatus?: number | null;
  lastBinanceKind?: string | null;
  lastBinanceReason?: string | null;
  lastBinancePath?: string | null;
  binanceCircuitOpen?: boolean;
  eligibleUniverse?: number | null;
  hotUniverseSelected?: number | null;
  hotUniverseAnalyzed?: number | null;
  coldUniverseSize?: number | null;
  coldUniverseAnalyzed?: number | null;
  fullUniverseCoverageCount?: number | null;
  fullUniverseCoveragePct?: number | null;
  currentColdBatch?: string | null;
  lastFullEligibleUniverseAt?: string | null;
  nextExpectedFullEligibleUniverseAt?: string | null;
  lastColdBatchAt?: string | null;
  lastColdBatchDurationMs?: number | null;
  requestWeightUsed?: number | null;
  requestWeightLimit?: number | null;
  top100RankedAt?: string | null;
  nextAnalysisAt?: string | null;
};

function stamp(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function ScannerHealthPanel({ health, selected }: { health?: Health | null; selected?: number }) {
  const last = lastMonitorAt(health);
  const selectedCount = health?.selectedCount ?? selected ?? null;
  const analyzedCount = health?.analyzedCount ?? null;
  const updated = health?.priceUpdatedCount;
  const analysisMs = health?.analysisDurationMs ?? health?.lastFullUniverseDurationMs ?? null;
  const hasCoverage = health?.eligibleUniverse != null || health?.fullUniverseCoverageCount != null;
  return (
    <section className="pw-signals-card rounded-[24px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">Scanner health</p>
          <h2 className="mt-1 text-lg font-bold">Real backend timestamps only</h2>
        </div>
        <LiveMonitorBadge health={health} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 xl:grid-cols-4">
        <div><dt className="text-[11px] uppercase text-slate-500">Eligible contracts</dt><dd className="mt-1 font-semibold tabular-nums">{health?.eligibleUniverse ?? "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Top 100 selected / analyzed</dt><dd className="mt-1 font-semibold tabular-nums">{selectedCount != null && analyzedCount != null ? `${analyzedCount} / ${selectedCount}` : selectedCount != null ? `— / ${selectedCount}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Top-100 ranking time</dt><dd className="mt-1 font-semibold">{stamp(health?.top100RankedAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Analysis timestamp</dt><dd className="mt-1 font-semibold">{stamp(health?.lastFullUniverseAt ?? health?.lastCycleAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Next analysis</dt><dd className="mt-1 font-semibold">{stamp(health?.nextAnalysisAt) !== "—" ? stamp(health?.nextAnalysisAt) : nextCycleLabel(health)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Analysis duration</dt><dd className="mt-1 font-semibold tabular-nums">{analysisMs != null ? `${analysisMs} ms` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Request weight</dt><dd className="mt-1 font-semibold tabular-nums">{health?.requestWeightUsed != null ? `${health.requestWeightUsed}/${health.requestWeightLimit || 2400}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Worker / circuit</dt><dd className="mt-1 font-semibold">{`${health?.workerStatus || health?.monitoring || "—"}${health?.binanceCircuitOpen ? " · circuit open" : " · circuit closed"}`}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Last price stamp</dt><dd className="mt-1 font-semibold">{stamp(health?.lastPriceAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Updated in last cycle</dt><dd className="mt-1 font-semibold tabular-nums">{updated != null ? `${updated}${selectedCount ? ` / ${selectedCount}` : ""}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Fresh / pending / failed</dt><dd className="mt-1 font-semibold tabular-nums">{`${health?.freshCount ?? "—"} / ${health?.pendingCount ?? "—"} / ${health?.failedCount ?? "—"}`}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Last full Top 100 pass</dt><dd className="mt-1 font-semibold">{stamp(health?.lastFullUniverseAt)}</dd></div>
      </dl>
      {hasCoverage && (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3 xl:grid-cols-4">
          <div><dt className="text-[11px] uppercase text-slate-500">Eligible universe</dt><dd className="mt-1 font-semibold tabular-nums">{health?.eligibleUniverse ?? "—"}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Hot analyzed</dt><dd className="mt-1 font-semibold tabular-nums">{health?.hotUniverseAnalyzed != null ? `${health.hotUniverseAnalyzed}/${health.hotUniverseSelected ?? 50}` : "—"}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Cold analyzed</dt><dd className="mt-1 font-semibold tabular-nums">{health?.coldUniverseAnalyzed != null && health?.coldUniverseSize != null ? `${health.coldUniverseAnalyzed}/${health.coldUniverseSize}` : "—"}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Full coverage</dt><dd className="mt-1 font-semibold tabular-nums">{health?.fullUniverseCoverageCount != null && health?.eligibleUniverse != null ? `${health.fullUniverseCoverageCount}/${health.eligibleUniverse}${health.fullUniverseCoveragePct != null ? ` (${health.fullUniverseCoveragePct}%)` : ""}` : "—"}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Cold batch</dt><dd className="mt-1 font-semibold tabular-nums">{health?.currentColdBatch || "—"}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Last full eligible</dt><dd className="mt-1 font-semibold">{stamp(health?.lastFullEligibleUniverseAt)}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Next full eligible ETA</dt><dd className="mt-1 font-semibold">{stamp(health?.nextExpectedFullEligibleUniverseAt)}</dd></div>
          <div><dt className="text-[11px] uppercase text-slate-500">Last cold batch</dt><dd className="mt-1 font-semibold">{health?.lastColdBatchDurationMs != null ? `${health.lastColdBatchDurationMs} ms · ${stamp(health.lastColdBatchAt)}` : stamp(health?.lastColdBatchAt)}</dd></div>
        </dl>
      )}
      {health?.coverageNote && <p className="mt-3 text-xs text-amber-200">{health.coverageNote}</p>}
      {(health?.lastBinanceReason || health?.binanceCircuitOpen) && (
        <p className="mt-3 text-xs text-amber-200">
          {health.binanceCircuitOpen ? "Binance circuit open" : "Last Binance failure"}
          {health.lastBinanceStatus != null ? ` · HTTP ${health.lastBinanceStatus}` : health.lastBinanceKind ? ` · ${health.lastBinanceKind}` : ""}
          {health.lastBinancePath ? ` · ${health.lastBinancePath}` : ""}
          {health.lastBinanceReason ? ` · ${health.lastBinanceReason}` : ""}
        </p>
      )}
      {last === 0 && <p className="mt-3 text-xs text-slate-400">No completed monitoring cycle has been recorded on this process yet.</p>}
    </section>
  );
}
