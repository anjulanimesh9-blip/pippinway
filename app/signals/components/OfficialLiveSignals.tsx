"use client";

import type { CoinScan } from "@/lib/signals-engine/types";
import SignalCard from "./SignalCard";
import { isActionableSetup } from "../lib/status";

/**
 * Official live signals — only genuine validated current publications.
 * Never shows Near Setups or stale/malformed Firestore leftovers.
 */
export default function OfficialLiveSignals({
  items,
  stale,
  sparks,
}: {
  items?: CoinScan[] | null;
  stale?: boolean;
  sparks?: Record<string, number[]>;
}) {
  const rows = (items || []).filter(
    (coin) => isActionableSetup(coin) && coin.setup && (coin.setup.netRiskReward ?? 0) >= 3,
  );
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
            Current validated LONG/SHORT publications with net R/R ≥ 1:3. Stale or malformed history rows are excluded.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
          {rows.length} active
        </span>
      </div>

      {!rows.length ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-[#0B1220]/80 px-4 py-6 text-sm text-slate-300">
          No validated live signals right now. WAIT-only Top 50 scans do not invent trades. Near Setups below are watching only.
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
