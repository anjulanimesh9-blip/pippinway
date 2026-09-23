"use client";

import { PATTERN_CATALOG } from "@/lib/signals-engine/pattern-catalog";

type PatternLevels = {
  support?: number;
  resistance?: number;
  neckline?: number;
};

type AnalysisCoin = {
  pattern: string;
  patternStatus: string;
  direction: string;
  reason: string;
  nextStep: string;
  quality?: {
    supporting: string[];
    contradictory: string[];
    timeframeVotes: Array<{ interval: string; vote: string; note: string }>;
    executionEligible: boolean;
    dataFreshness: string;
  };
  timeframes: Array<{
    interval: string;
    trend: string;
    patterns: Array<{
      name: string;
      status: string;
      bias?: string;
      evidence: string[];
      invalidation?: string;
      volumeConfirmed?: boolean;
      levels?: PatternLevels;
    }>;
  }>;
};

export function PatternAnalysis({
  coin,
  locked,
}: {
  coin: AnalysisCoin | null;
  locked?: boolean;
}) {
  const rows = (coin?.timeframes || []).flatMap((tf) =>
    tf.patterns.map((pattern) => ({
      interval: tf.interval,
      name: pattern.name,
      status: pattern.status,
      bias: pattern.bias || "NEUTRAL",
      evidence: pattern.evidence,
      invalidation: pattern.invalidation || "",
      volumeConfirmed: pattern.volumeConfirmed,
    })),
  );
  const votes = coin?.quality?.timeframeVotes || [];
  const allAgree = votes.length > 1 && votes.every((item) => item.vote === "SUPPORT");
  const checklist = [
    { ok: Boolean(rows.some((item) => item.status === "CONFIRMED")), label: "Stage A: confirmed geometric pattern or volume breakout on a closed candle" },
    { ok: Boolean(rows.some((item) => item.volumeConfirmed)), label: "Volume confirmation on the break candle" },
    { ok: votes.some((item) => item.vote === "SUPPORT"), label: "At least one higher-or-signal timeframe supports the idea" },
    { ok: allAgree, label: allAgree ? "All listed timeframes support" : "Not all timeframes agree — conflicts are listed" },
    { ok: coin?.quality?.executionEligible === true, label: "Stage B execution filters passed. A pattern is not automatically a trade." },
  ];

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#0B1220] p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">Pattern Analysis</p>
        <h3 className="mt-1 text-lg font-bold">Detected patterns and confirmation checklist</h3>
        <p className="mt-1 text-xs text-slate-400">
          Educational-only patterns from the 29-pattern sheet are listed below but never published as trades.
        </p>
      </div>
      {locked ? (
        <p className="rounded-xl border border-[#FBB03B]/30 bg-[#FBB03B]/10 p-3 text-sm text-[#FBB03B]">
          Full pattern analysis is included with Pro.
        </p>
      ) : !coin ? (
        <p className="text-sm text-slate-400">Select a coin to inspect live Binance pattern geometry.</p>
      ) : (
        <>
          <p className="text-sm text-slate-300">{coin.pattern} · {coin.patternStatus} · {coin.direction}</p>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-xs">
                <span className={item.ok ? "text-emerald-300" : "text-amber-300"}>{item.ok ? "✓" : "•"}</span>
                <span className="text-slate-300">{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-5">
            {votes.map((vote) => (
              <div key={vote.interval} className="rounded-xl bg-white/5 p-2 text-[11px]">
                <p className="font-bold uppercase">{vote.interval}</p>
                <p className={vote.vote === "SUPPORT" ? "text-emerald-300" : vote.vote === "CONTRADICT" ? "text-rose-300" : "text-slate-400"}>{vote.vote}</p>
                <p className="mt-1 text-slate-500">{vote.note}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {rows.length ? rows.map((row) => (
              <article key={`${row.interval}-${row.name}`} className="rounded-xl border border-white/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm">{row.name}</strong>
                  <span className="text-[11px] text-slate-400">{row.interval.toUpperCase()} · {row.status} · {row.bias}</span>
                </div>
                <ul className="mt-2 list-disc pl-4 text-[11px] text-slate-400">
                  {row.evidence.slice(0, 4).map((line: string) => <li key={line}>{line}</li>)}
                </ul>
                <p className="mt-2 text-[11px] text-amber-200">{row.invalidation}</p>
              </article>
            )) : <p className="text-sm text-slate-500">No geometric pattern met the detector rules on this scan. WAIT is valid.</p>}
          </div>
          <p className="text-xs text-slate-500">{coin.nextStep}</p>
        </>
      )}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">29-pattern sheet</h4>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {PATTERN_CATALOG.map((item) => (
            <p key={item.name} className="text-[11px] text-slate-400">
              <span className={item.detector === "implemented" ? "text-emerald-300" : "text-slate-500"}>
                {item.detector === "implemented" ? "Live detector" : "Educational only"}
              </span>
              {" · "}
              {item.name}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function primaryPatternLevels(coin: AnalysisCoin | null): PatternLevels {
  if (!coin) return {};
  const ranked = ["4h", "1h", "15m", "5m", "1m"];
  const frames = [...coin.timeframes].sort((a, b) => ranked.indexOf(a.interval) - ranked.indexOf(b.interval));
  for (const frame of frames) {
    const confirmed = frame.patterns.find((item) => item.status === "CONFIRMED" && item.levels);
    if (confirmed?.levels) return confirmed.levels;
  }
  for (const frame of frames) {
    const forming = frame.patterns.find((item) => item.levels);
    if (forming?.levels) return forming.levels;
  }
  return {};
}
