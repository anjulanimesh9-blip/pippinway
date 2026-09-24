"use client";

import type { CoinScan } from "@/lib/signals-engine/types";
import SignalCard from "./SignalCard";
import { isActionableSetup } from "../lib/status";

type OfficialPerf = {
  wins?: number;
  losses?: number;
  resolved?: number;
  active?: number;
  ambiguous?: number;
  winRate?: number | null;
  winRateLabel?: string;
};

/**
 * Official live signals — current validated publications with frozen Entry/SL/TP.
 * Educational/backtest win rates are never shown here.
 */
export default function OfficialLiveSignals({
  items,
  stale,
  sparks,
  performance,
}: {
  items?: CoinScan[] | null;
  stale?: boolean;
  sparks?: Record<string, number[]>;
  performance?: OfficialPerf | null;
}) {
  const rows = (items || []).filter((coin) => isActionableSetup(coin) && coin.setup);
  const resolved = performance?.resolved ?? 0;
  const winLabel =
    performance?.winRate == null || resolved <= 0
      ? "Win rate — (no resolved TARGET/STOP yet)"
      : `Win rate ${performance.winRateLabel || `${((performance.winRate || 0) * 100).toFixed(1)}%`}`;

  return (
    <section
      id="official-live-signals"
      className="pw-signals-card rounded-[24px] px-5 py-5 sm:px-6"
      aria-labelledby="official-live-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">Live board</p>
          <h2 id="official-live-heading" className="mt-1 text-2xl font-bold tracking-tight">
            Official Live Signals
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Validated LONG/SHORT publications with frozen Entry / SL / TP. Later WAIT scans do not erase an active trade outcome.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
          {rows.length} active
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Wins</dt>
          <dd className="mt-1 font-bold tabular-nums text-emerald-300">{performance?.wins ?? 0}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Losses</dt>
          <dd className="mt-1 font-bold tabular-nums text-rose-300">{performance?.losses ?? 0}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Resolved</dt>
          <dd className="mt-1 font-bold tabular-nums">{resolved}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Active</dt>
          <dd className="mt-1 font-bold tabular-nums">{performance?.active ?? rows.length}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Ambiguous</dt>
          <dd className="mt-1 font-bold tabular-nums">{performance?.ambiguous ?? 0}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1220]/80 px-3 py-2 sm:col-span-2 lg:col-span-1">
          <dt className="text-[10px] uppercase tracking-wide text-slate-500">Official win rate</dt>
          <dd className="mt-1 text-xs font-semibold leading-snug text-[#FBB03B]">{winLabel}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-slate-500">
        Official win rate = TARGET_HIT / (TARGET_HIT + STOP_HIT). Educational and backtest percentages are never shown as the live product rate.
      </p>

      {!rows.length ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-[#0B1220]/80 px-4 py-6 text-sm text-slate-300">
          No validated live signals right now. WAIT-only Top 100 scans do not invent trades. Near Setups below are watching only.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((coin) => (
            <SignalCard
              key={`official-${coin.symbol}-${coin.lifecycle?.openedAt || coin.analyzedAt}`}
              coin={coin}
              stale={stale}
              sparkline={sparks?.[coin.symbol]}
              ctaLabel="View Signal"
            />
          ))}
        </div>
      )}
    </section>
  );
}
