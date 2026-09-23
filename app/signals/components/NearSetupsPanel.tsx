"use client";

import type { NearSetup, NearSetupCategory } from "@/lib/signals-engine/near-setups";
import { pairLabel, relativeTime } from "../lib/format";

const CATEGORY_LABEL: Record<NearSetupCategory, string> = {
  rr_gate: "Passed validation · below R/R floor",
  missing_confirmation: "Missing confirmation",
  mtf_volume_block: "MTF / volume block",
  developing_pattern: "Developing pattern",
};

const WATCH_TONE: Record<NearSetup["bias"], string> = {
  LONG: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  SHORT: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  UNKNOWN: "border-white/15 bg-white/5 text-slate-300",
};

function watchBadge(bias: NearSetup["bias"]) {
  if (bias === "LONG") return "LONG WATCH";
  if (bias === "SHORT") return "SHORT WATCH";
  return "WATCH";
}

function NearSetupCard({
  item,
  onSelect,
}: {
  item: NearSetup;
  onSelect?: (symbol: string) => void;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold tracking-tight">{pairLabel(item.symbol)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{CATEGORY_LABEL[item.category]}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${WATCH_TONE[item.bias]}`}>
            {watchBadge(item.bias)}
          </span>
          <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-100">
            NOT A SIGNAL
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-snug text-slate-300">{item.headline}</p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Waiting for validation
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span>{item.pattern !== "None" ? item.pattern : "No named pattern"}</span>
        <span>·</span>
        <span>{item.patternStatus}</span>
        {item.netRr != null && (
          <>
            <span>·</span>
            <span>
              Net R/R 1:{item.netRr.toFixed(2)}
              {item.netRrGap != null && item.netRrGap > 0
                ? ` (−${item.netRrGap.toFixed(2)} to 1:${item.netRrRequired})`
                : ""}
            </span>
          </>
        )}
      </div>

      {item.blockers[0] && (
        <p className="mt-2 line-clamp-2 text-[11px] text-amber-200/90">{item.blockers[0]}</p>
      )}

      <div className="mt-auto flex items-end justify-between gap-2 pt-3 text-[11px] text-slate-500">
        <span>Score {item.nearSetupScore}</span>
        <span>{relativeTime(item.analyzedAt)}</span>
      </div>
    </>
  );

  const className =
    "flex h-full w-full flex-col rounded-2xl border border-dashed border-white/15 bg-[#0B1220]/80 px-4 py-4 text-left transition hover:border-[#FBB03B]/35";

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(item.symbol)} className={`${className} cursor-pointer`}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}

export default function NearSetupsPanel({
  items,
  onSelect,
}: {
  items?: NearSetup[] | null;
  onSelect?: (symbol: string) => void;
}) {
  const rows = items || [];
  if (!rows.length) return null;

  return (
    <section
      id="near-setups"
      className="pw-signals-card rounded-[24px] px-5 py-5 sm:px-6"
      aria-labelledby="near-setups-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">Watching</p>
          <h2 id="near-setups-heading" className="mt-1 text-2xl font-bold tracking-tight">
            Near Setups
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Markets getting closer to a validated signal
          </p>
        </div>
        <p className="max-w-xs text-right text-[11px] leading-relaxed text-slate-500">
          Informational only. Near Setups are not official LONG/SHORT signals and do not use a Free reveal.
        </p>
      </div>

      <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((item) => (
          <li key={item.symbol}>
            <NearSetupCard item={item} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  );
}
