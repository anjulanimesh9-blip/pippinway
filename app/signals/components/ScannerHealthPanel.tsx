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
        <div><dt className="text-[11px] uppercase text-slate-500">Last cycle</dt><dd className="mt-1 font-semibold">{stamp(health?.lastCycleAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Last price stamp</dt><dd className="mt-1 font-semibold">{stamp(health?.lastPriceAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Last full Top 50 pass</dt><dd className="mt-1 font-semibold">{stamp(health?.lastFullUniverseAt)}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Analysis duration</dt><dd className="mt-1 font-semibold tabular-nums">{analysisMs != null ? `${analysisMs} ms` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Selected / analyzed</dt><dd className="mt-1 font-semibold tabular-nums">{selectedCount != null && analyzedCount != null ? `${analyzedCount} / ${selectedCount}` : selectedCount != null ? `— / ${selectedCount}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Updated in last cycle</dt><dd className="mt-1 font-semibold tabular-nums">{updated != null ? `${updated}${selectedCount ? ` / ${selectedCount}` : ""}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Fresh / pending / failed</dt><dd className="mt-1 font-semibold tabular-nums">{`${health?.freshCount ?? "—"} / ${health?.pendingCount ?? "—"} / ${health?.failedCount ?? "—"}`}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Next expected cycle</dt><dd className="mt-1 font-semibold">{nextCycleLabel(health)}</dd></div>
      </dl>
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
