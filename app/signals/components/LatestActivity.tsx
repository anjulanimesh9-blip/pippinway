"use client";

import { fmt } from "@/lib/signals/client";

type ActivityItem = {
  id?: string;
  symbol?: string;
  direction?: string;
  lifecycleStatus?: string;
  outcome?: string;
  pnlUSDT?: number | null;
};

export default function LatestActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="pw-signals-card rounded-[24px] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">Latest activity</p>
      <h2 className="mt-1 text-lg font-bold">Official records only</h2>
      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.slice(0, 8).map((item, index) => (
            <li key={String(item.id || `${item.symbol}-${index}`)} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm">
              <span className="font-semibold">{item.symbol} · {item.direction}</span>
              <span className="text-slate-400">{item.lifecycleStatus || item.outcome}</span>
              {item.pnlUSDT != null && <span className="tabular-nums">{fmt(Number(item.pnlUSDT), 2)}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No official activity stored yet. This panel stays empty instead of inventing trades.</p>
      )}
    </section>
  );
}
