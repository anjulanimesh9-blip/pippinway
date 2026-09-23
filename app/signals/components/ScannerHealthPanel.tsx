"use client";

import LiveMonitorBadge from "./LiveMonitorBadge";
import { lastMonitorAt, nextCycleLabel, type MonitorHealth } from "../lib/health";

type Health = MonitorHealth & {
  lastFullUniverseAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseDurationMs?: number | null;
  queueBacklog?: number | null;
  failedCount?: number | null;
  pendingCount?: number | null;
  priceUpdatedCount?: number | null;
  coverageNote?: string | null;
};

function stamp(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function ScannerHealthPanel({ health, selected }: { health?: Health | null; selected?: number }) {
  const last = lastMonitorAt(health);
  const updated = health?.priceUpdatedCount;
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
        <div><dt className="text-[11px] uppercase text-slate-500">Cycle duration</dt><dd className="mt-1 font-semibold tabular-nums">{health?.lastCycleDurationMs != null ? `${health.lastCycleDurationMs} ms` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Updated in last cycle</dt><dd className="mt-1 font-semibold tabular-nums">{updated != null ? `${updated}${selected ? ` / ${selected}` : ""}` : "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Pending queue</dt><dd className="mt-1 font-semibold tabular-nums">{health?.queueBacklog ?? health?.pendingCount ?? "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Failed</dt><dd className="mt-1 font-semibold tabular-nums">{health?.failedCount ?? "—"}</dd></div>
        <div><dt className="text-[11px] uppercase text-slate-500">Next expected cycle</dt><dd className="mt-1 font-semibold">{nextCycleLabel(health)}</dd></div>
      </dl>
      {health?.coverageNote && <p className="mt-3 text-xs text-amber-200">{health.coverageNote}</p>}
      {last === 0 && <p className="mt-3 text-xs text-slate-400">No completed monitoring cycle has been recorded on this process yet.</p>}
    </section>
  );
}
