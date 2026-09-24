"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { dirClass, fmt, fmtPrice, signalsFetch } from "@/lib/signals/client";
import { CoinLogo } from "../components/CoinLogo";
import { ObservedBars, SourceBadge } from "../components/ObservedBars";
import { VisualBand } from "../components/VisualBand";

type HistoryResponse = {
  locked?: boolean;
  note?: string;
  live?: Array<{
    id: string;
    symbol: string;
    direction: string;
    pattern: string;
    entry: number;
    openedAt: string;
    outcome: string;
    pnlUSDT?: number | null;
    marginUSDT?: number;
    leverage?: number;
    quantity?: number;
    notionalUSDT?: number;
    totalFeesUSDT?: number;
    executable?: boolean;
    snapshotPreserved?: boolean;
    lifecycleStatus?: string;
    fillConfirmed?: boolean;
    originalEntry?: number;
    tickSize?: number;
    pricePrecision?: number;
  }>;
  liveStats?: {
    wins: number;
    losses: number;
    closedSample: number;
    winRate: number | null;
    profitFactor: number | null;
    maxDrawdownUSDT: number | null;
    note: string;
  };
  backtestStats?: {
    wins: number;
    losses: number;
    closedSample: number;
    winRate: number | null;
    profitFactor: number | null;
    note: string;
  };
  sources?: Record<string, string>;
  backtestSampleNote?: string;
  performance?: {
    published: number;
    waiting: number;
    triggered: number;
    active?: number;
    missed: number;
    expired: number;
    invalidated: number;
    ambiguous?: number;
    targetHits: number;
    stopHits: number;
    wins?: number;
    losses?: number;
    resolved?: number;
    winRate?: number | null;
    winRateLabel?: string;
    observedSample: number;
    hypotheticalGrossPnl: number;
    hypotheticalNetPnl: number;
    maxDrawdownUSDT: number | null;
    brokerageVerified: number;
    note: string;
    sources?: Record<string, string>;
  };
};

export default function SignalsHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void (async () => {
      try {
        const response = await signalsFetch("/api/signals/history", user);
        const body = await response.json();
        if (!response.ok) throw Error(body.error || "History failed");
        setData(body);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "History failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0B1220] p-6">
        <h2 className="text-xl font-bold">Sign in to view history</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Official records, lifecycle counts and observed performance use your Pippinway account. Nothing is invented for this page.
        </p>
        <Link href="/login?returnUrl=/signals/history" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]">
          Sign in
        </Link>
      </section>
    );
  }

  if (data?.locked) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0F172A] p-6">
        <h2 className="text-xl font-bold">Pro history</h2>
        <p className="mt-2 text-sm text-gray-400">{data.note}</p>
        <Link href="/signals/pricing" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#FBB03B] px-4 text-sm font-semibold text-[#0B1220]">
          View plans
        </Link>
      </section>
    );
  }

  const performance = data?.performance;
  const lifecycleBars = performance
    ? [
        { label: "Waiting", value: performance.waiting ?? 0, color: "#FBB03B" },
        { label: "Triggered", value: performance.triggered, color: "#3B82F6" },
        { label: "Target hit", value: performance.targetHits, color: "#10b981" },
        { label: "Stop hit", value: performance.stopHits, color: "#f43f5e" },
        { label: "Ambiguous", value: performance.ambiguous ?? 0, color: "#eab308" },
        { label: "Missed", value: performance.missed, color: "#94a3b8" },
        { label: "Expired", value: performance.expired, color: "#64748b" },
        { label: "Invalidated", value: performance.invalidated, color: "#a855f7" },
      ]
    : [];

  return (
    <section className="space-y-5">
      <VisualBand
        src="/signals/history-network.png"
        alt="Abstract gold data-network artwork used as a history page introduction"
        eyebrow="Official record"
        title="Signal history and performance"
      >
        <p>
          Observed scanner outputs and walk-forward backtests only. Unfilled or open signals are not counted as wins.
          Closed P/L uses the original quantity and fee snapshot. No 95% accuracy claim. Artwork on this page is decorative.
        </p>
      </VisualBand>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
      {loading && !data && <div className="h-24 animate-pulse rounded-2xl bg-white/5" />}

      {performance && (
        <article className="rounded-3xl border border-[#FBB03B]/30 bg-[#0F172A] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBB03B]">Official Live win rate</p>
          <p className="mt-2 text-2xl font-extrabold">
            {performance.winRate == null || !(performance.resolved)
              ? "—"
              : performance.winRateLabel || `${((performance.winRate || 0) * 100).toFixed(1)}%`}
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Wins {performance.wins ?? performance.targetHits ?? 0} · Losses {performance.losses ?? performance.stopHits ?? 0} · Resolved {performance.resolved ?? 0} · Active {performance.active ?? 0} · Ambiguous {performance.ambiguous ?? 0}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            TARGET_HIT / (TARGET_HIT + STOP_HIT) only. Educational live history and backtest percentages above are separate and are never labeled as the live product win rate.
          </p>
        </article>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-sky-500/20 bg-[#0F172A] p-5">
          <SourceBadge kind="backtested" />
          <p className="mt-3 text-2xl font-extrabold tabular-nums">{data?.backtestStats?.closedSample ?? 0}</p>
          <p className="text-xs text-gray-400">Closed backtest sample (educational)</p>
          <p className="mt-2 text-sm text-gray-300">
            Win rate {data?.backtestStats?.winRate == null ? "—" : `${(data.backtestStats.winRate * 100).toFixed(1)}%`}
          </p>
          <p className="mt-3 text-xs text-gray-500">{data?.sources?.backtest || data?.backtestStats?.note || "Historical walk-forward only — not Official Live."}</p>
        </article>
        <article className="rounded-3xl border border-amber-500/20 bg-[#0F172A] p-5">
          <SourceBadge kind="observed" />
          <p className="mt-3 text-2xl font-extrabold tabular-nums">{data?.liveStats?.closedSample ?? 0}</p>
          <p className="text-xs text-gray-400">Observed closed sample</p>
          <p className="mt-2 text-sm text-gray-300">
            {data?.liveStats?.wins ?? 0} / {data?.liveStats?.losses ?? 0} wins / losses
          </p>
          <p className="mt-3 text-xs text-gray-500">{data?.sources?.paper || data?.liveStats?.note || "Scanner observations, not brokerage fills."}</p>
        </article>
        <article className="rounded-3xl border border-emerald-500/20 bg-[#0F172A] p-5">
          <SourceBadge kind="brokerage" />
          <p className="mt-3 text-2xl font-extrabold tabular-nums">{performance?.brokerageVerified ?? 0}</p>
          <p className="text-xs text-gray-400">Brokerage-verified fills</p>
          <p className="mt-2 text-sm text-gray-300">Fills stay unconfirmed unless a brokerage record exists.</p>
          <p className="mt-3 text-xs text-gray-500">{data?.sources?.live || "No invented live-trade results."}</p>
        </article>
      </div>

      {performance && (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#0F172A] p-5">
            <h3 className="font-bold">Lifecycle counts</h3>
            <p className="mt-1 text-xs text-gray-500">Official published records only. Empty bars mean nothing has been stored yet.</p>
            <div className="mt-4">
              <ObservedBars items={lifecycleBars} empty="No official lifecycle events have been stored yet." />
            </div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#0F172A] p-5">
            <h3 className="font-bold">Observed totals</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Official published" value={String(performance.published)} />
              <Stat label="Observed sample" value={String(performance.observedSample)} />
              <Stat label="Hyp. net P/L" value={`$${fmt(performance.hypotheticalNetPnl, 3)}`} />
              <Stat label="Max drawdown" value={performance.maxDrawdownUSDT == null ? "—" : `$${fmt(performance.maxDrawdownUSDT, 3)}`} />
            </div>
            {performance.note && <p className="mt-3 text-xs text-gray-500">{performance.note}</p>}
          </article>
        </div>
      )}

      <article className="rounded-3xl border border-white/10 bg-[#0F172A] p-5">
        <h3 className="font-bold">Official records</h3>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="py-2">When</th>
                <th>Coin</th>
                <th>Side</th>
                <th>Pattern</th>
                <th>Entry</th>
                <th>Qty / notional</th>
                <th>Snapshot</th>
                <th>P/L</th>
                <th>Lifecycle</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {(data?.live || []).slice(0, 30).map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-2">{new Date(item.openedAt).toLocaleString()}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <CoinLogo symbol={item.symbol} size={22} />
                      {item.symbol}
                    </span>
                  </td>
                  <td className={dirClass(item.direction)}>{item.direction}</td>
                  <td>{item.pattern}</td>
                  <td className="tabular-nums">{fmtPrice(item.entry, item.tickSize, item.pricePrecision)}</td>
                  <td>{item.quantity != null ? `${fmt(item.quantity, 6)} / $${fmt(item.notionalUSDT, 2)}` : "—"}</td>
                  <td>{item.snapshotPreserved ? `${item.marginUSDT} USDT · ${item.leverage}x · fees $${fmt(item.totalFeesUSDT, 4)}` : "legacy row"}</td>
                  <td>{item.pnlUSDT == null ? "—" : `$${fmt(item.pnlUSDT, 4)}`}</td>
                  <td>{item.lifecycleStatus ? item.lifecycleStatus.split("_").join(" ") : "—"}{item.fillConfirmed === false ? " · unconfirmed" : ""}</td>
                  <td>{item.outcome}{item.executable === false ? " · not executable" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {(data?.live || []).slice(0, 30).map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CoinLogo symbol={item.symbol} size={28} />
                  <strong>{item.symbol.replace("USDT", "")}</strong>
                </div>
                <span className={`text-xs font-bold ${dirClass(item.direction)}`}>{item.direction}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">{new Date(item.openedAt).toLocaleString()}</p>
              <p className="mt-1 text-sm">{item.pattern} · {item.outcome}</p>
              <p className="mt-1 text-sm tabular-nums">Entry {fmtPrice(item.entry, item.tickSize, item.pricePrecision)}</p>
              <p className="text-sm">{item.pnlUSDT == null ? "P/L —" : `P/L $${fmt(item.pnlUSDT, 4)}`}</p>
              <p className="mt-1 text-xs text-amber-200">{item.lifecycleStatus ? item.lifecycleStatus.split("_").join(" ") : "—"}{item.fillConfirmed === false ? " · unconfirmed" : ""}</p>
            </article>
          ))}
        </div>
        {!(data?.live || []).length && !loading && <p className="mt-3 text-sm text-gray-500">No official records stored yet. Nothing is invented for this table.</p>}
      </article>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0B1220] p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
