"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { dirBadgeClass, fmt, fmtPrice, signalsFetch } from "@/lib/signals/client";
import type { CoinScan } from "@/lib/signals-engine/types";
import { lifecycleLabel } from "@/lib/signals-engine/lifecycle";
import { FinanceGrid } from "../FinanceGrid";
import SignalChart from "../components/SignalChart";
import { PatternAnalysis, primaryPatternLevels } from "../components/PatternAnalysis";
import { pairLabel, primaryTimeframe, relativeTime } from "../lib/format";

export default function SignalDetailPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = String(params.symbol || "").toUpperCase();
  const [user, setUser] = useState<User | null>(null);
  const [coin, setCoin] = useState<CoinScan | null>(null);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [allowance, setAllowance] = useState<{ remaining?: number; used?: number; limit?: number } | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user || !symbol) return;
    void signalsFetch(`/api/signals/scanner?symbol=${encodeURIComponent(symbol)}`, user).then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Signal unavailable.");
        return;
      }
      setCoin(body.coin);
      setLocked(Boolean(body.coin?.locked));
      setAllowance(body.access?.allowance || null);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Signal unavailable."));
  }, [symbol, user]);

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
        <h1 className="text-xl font-bold">Sign in to view this signal</h1>
        <Link href={`/login?returnUrl=/signals/${symbol}`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-bold text-[#0B1220]">Login</Link>
      </section>
    );
  }

  if (error) {
    return <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>;
  }

  if (!coin) {
    return <p className="text-sm text-slate-400">Loading {pairLabel(symbol)}…</p>;
  }

  async function reveal() {
    if (!user) return;
    setRevealing(true);
    try {
      const response = await signalsFetch("/api/signals/reveal", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) {
        setError(body.error || "Could not reveal this signal.");
        return;
      }
      const next = await signalsFetch(`/api/signals/scanner?symbol=${encodeURIComponent(symbol)}`, user);
      const payload = await next.json();
      setCoin(payload.coin);
      setLocked(Boolean(payload.coin?.locked));
      setAllowance(payload.access?.allowance || null);
    } finally {
      setRevealing(false);
    }
  }

  if (locked) {
    return (
      <section className="rounded-[24px] border border-white/10 bg-[#0B1220] p-6">
        <h1 className="text-xl font-bold">{pairLabel(symbol)}</h1>
        <p className="mt-2 text-sm text-slate-300">Complete entry, stop and target stay locked on the Free plan until you reveal this watchlist coin or upgrade.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(allowance?.remaining ?? 0) > 0 && (
            <button type="button" disabled={revealing} onClick={() => void reveal()} className="inline-flex min-h-11 items-center rounded-xl bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220] disabled:opacity-50">
              {revealing ? "Revealing…" : "Reveal this signal"}
            </button>
          )}
          <Link href="/signals/pay" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold">Upgrade to Pro</Link>
        </div>
      </section>
    );
  }

  const setup = coin.direction === "WAIT" ? null : coin.setup;
  const tick = setup?.tickSize ?? coin.filters?.tickSize;
  const prec = setup?.pricePrecision ?? coin.filters?.pricePrecision;
  const tf = coin.timeframes.find((item) => item.interval === "1h") || coin.timeframes[0];

  return (
    <div className="space-y-4">
      <Link href="/signals" className="text-sm text-[#FBB03B]">← Back to Signals</Link>
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-4">
        <div>
          <h1 className="text-2xl font-bold">{pairLabel(coin.symbol)}</h1>
          <p className="text-xs text-slate-500">Last analyzed {relativeTime(coin.analyzedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-sm font-bold ${dirBadgeClass(coin.direction)}`}>{coin.direction}</span>
          {coin.lifecycle && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{lifecycleLabel(coin.lifecycle.status)}</span>}
        </div>
      </header>

      {!setup && (
        <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No confirmed setup. WAIT is analysis only — there is no entry, stop or take-profit to trade.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Current price", fmtPrice(coin.price, tick, prec)],
          ["24h change", coin.changePct == null ? "—" : `${coin.changePct > 0 ? "+" : ""}${coin.changePct.toFixed(2)}%`],
          ["Frozen original", coin.originalEntry != null ? fmtPrice(coin.originalEntry, tick, prec) : "—"],
          ["Entry", setup ? fmtPrice(setup.entry, tick, prec) : "No confirmed setup"],
          ["Stop loss", setup ? fmtPrice(setup.stop, tick, prec) : "No confirmed setup"],
          ["Take profit", setup ? fmtPrice(setup.target, tick, prec) : "No confirmed setup"],
          ["Gross R/R", setup?.grossRiskReward != null ? `1 : ${fmt(setup.grossRiskReward, 2)}` : "—"],
          ["Net R/R", setup ? `1 : ${fmt(setup.netRiskReward ?? setup.riskReward, 2)}` : "—"],
          ["Estimated fees", setup ? `$${fmt(setup.estimatedFeesUSDT, 2)}` : "—"],
          ["Pattern", coin.pattern],
          ["Timeframe", primaryTimeframe(coin)],
          ["Status", coin.lifecycle ? lifecycleLabel(coin.lifecycle.status) : coin.direction === "WAIT" ? "WAIT" : "WAITING FOR ENTRY"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3">
            <p className="text-[11px] uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
        <h2 className="font-bold">Chart</h2>
        <div className="mt-3">
          <SignalChart
            user={user}
            symbol={coin.symbol}
            locked={false}
            entry={setup?.entry ?? coin.originalEntry}
            stop={setup?.stop}
            target={setup?.target}
            support={primaryPatternLevels(coin).support ?? coin.timeframes[0]?.support}
            resistance={primaryPatternLevels(coin).resistance ?? coin.timeframes[0]?.resistance}
            neckline={primaryPatternLevels(coin).neckline}
            pattern={coin.pattern}
            lastCandleCloseAt={coin.lastCandleCloseAt}
          />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
          <h2 className="font-bold">Confirmation</h2>
          <p className="mt-2 text-sm text-slate-300">{coin.quality?.patternConfirmation || coin.patternStatus}</p>
          <p className="mt-2 text-xs text-slate-500">Market structure · {tf?.structure || tf?.trend || "—"}</p>
          <p className="mt-1 text-xs text-slate-500">Status · {coin.lifecycle ? lifecycleLabel(coin.lifecycle.status) : coin.direction === "WAIT" ? "WAIT" : "WAITING FOR ENTRY"}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
          <h2 className="font-bold">Evidence</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-emerald-300">Supporting</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-400">{(coin.quality?.supporting || []).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-300">Contradictory</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-400">{(coin.quality?.contradictory || ["None recorded."]).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </article>
      </section>

      <PatternAnalysis coin={coin} />
      {setup && (
        <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
          <h2 className="font-bold">Trade finance</h2>
          <div className="mt-3"><FinanceGrid setup={setup} /></div>
        </section>
      )}
    </div>
  );
}
