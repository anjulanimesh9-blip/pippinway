"use client";

import type { ReactNode } from "react";

export type SummaryItem = { label: string; value: ReactNode; hint?: string; tone?: "gold" | "long" | "short" | "wait" | "muted" };

const TONE: Record<NonNullable<SummaryItem["tone"]>, string> = {
  gold: "text-[#FBB03B]",
  long: "text-emerald-300",
  short: "text-rose-300",
  wait: "text-amber-200",
  muted: "text-slate-200",
};

export default function SummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {items.map((item) => (
        <article key={item.label} className="pw-signals-card rounded-2xl px-3 py-3 sm:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${TONE[item.tone || "muted"]}`}>{item.value}</p>
          {item.hint && <p className="mt-1 text-[11px] text-slate-500">{item.hint}</p>}
        </article>
      ))}
    </div>
  );
}
