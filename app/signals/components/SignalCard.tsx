"use client";

import Link from "next/link";
import { changeClass, dirBadgeClass, fmt, fmtChange, fmtPrice } from "@/lib/signals/client";
import { lifecycleLabel } from "@/lib/signals-engine/lifecycle";
import type { CoinScan } from "@/lib/signals-engine/types";
import { CoinLogo } from "./CoinLogo";
import Sparkline from "./Sparkline";
import { pairLabel, primaryTimeframe, relativeTime } from "../lib/format";
import { hasValidatedSetup } from "../lib/status";

type SignalCardProps = {
  coin: CoinScan;
  stale?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  sparkline?: number[];
};

export default function SignalCard({ coin, stale, ctaHref, ctaLabel, sparkline }: SignalCardProps) {
  const setup = hasValidatedSetup(coin) ? coin.setup : null;
  const tick = setup?.tickSize ?? coin.filters?.tickSize;
  const prec = setup?.pricePrecision ?? coin.filters?.pricePrecision;
  const waiting = coin.direction === "WAIT" || !setup;
  const accent = coin.direction === "LONG"
    ? "border-l-emerald-400"
    : coin.direction === "SHORT"
      ? "border-l-rose-400"
      : "border-l-amber-400";
  const href = ctaHref || `/signals/${coin.symbol}`;
  const label = ctaLabel || (waiting ? "View Analysis" : "View Signal");
  const life = coin.lifecycle ? lifecycleLabel(coin.lifecycle.status) : null;

  return (
    <article className={`pw-signals-card flex h-full flex-col rounded-[22px] border-l-4 p-5 ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CoinLogo symbol={coin.symbol} size={44} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold tracking-tight">{pairLabel(coin.symbol)}</h3>
            <p className="text-xs text-slate-500">{coin.symbol}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${dirBadgeClass(coin.direction)}`}>
          {coin.direction}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Live price</p>
          <p className="text-xl font-semibold tabular-nums">{fmtPrice(coin.price, tick, prec)}</p>
        </div>
        <div className="min-w-[96px] flex-1 text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">24h change</p>
          <p className={`text-sm font-semibold tabular-nums ${changeClass(coin.changePct)}`}>{fmtChange(coin.changePct)}</p>
          {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} up={(coin.changePct || 0) >= 0} />}
        </div>
      </div>

      {setup ? (
        <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-wide text-slate-500">
          <div>
            <dt>Entry</dt>
            <dd className="mt-1 text-base font-semibold normal-case tabular-nums text-white">{fmtPrice(setup.entry, tick, prec)}</dd>
          </div>
          <div>
            <dt>Stop</dt>
            <dd className="mt-1 text-base font-semibold normal-case tabular-nums text-white">{fmtPrice(setup.stop, tick, prec)}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd className="mt-1 text-base font-semibold normal-case tabular-nums text-white">{fmtPrice(setup.target, tick, prec)}</dd>
          </div>
        </dl>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-3 py-3">
          <p className="text-sm font-semibold text-amber-100">No confirmed setup</p>
          <p className="mt-1 text-xs text-slate-400">{coin.reason || "WAIT is market context, not a trade. Entry, stop and target stay hidden until a validated LONG or SHORT exists."}</p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
        <p>Net R/R <strong className="mt-0.5 block text-white">{setup ? `1 : ${fmt(setup.netRiskReward ?? setup.riskReward, 2)}` : "—"}</strong></p>
        <p>Gross R/R <strong className="mt-0.5 block text-white">{setup?.grossRiskReward != null ? `1 : ${fmt(setup.grossRiskReward, 2)}` : "—"}</strong></p>
        <p>Timeframe <strong className="mt-0.5 block text-white">{primaryTimeframe(coin)}</strong></p>
        <p>Pattern <strong className="mt-0.5 block text-white">{coin.pattern || "—"}</strong></p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full border px-2.5 py-1 font-bold ${dirBadgeClass(coin.direction)}`}>Direction {coin.direction}</span>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-slate-300">Status {life || (waiting ? "WAIT" : "WAITING FOR ENTRY")}</span>
      </div>

      {coin.originalEntry != null && setup && coin.originalEntry !== setup.entry && (
        <p className="mt-3 text-xs text-slate-500">Frozen original entry {fmtPrice(coin.originalEntry, tick, prec)} · live {fmtPrice(coin.price, tick, prec)}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Published {relativeTime(coin.lifecycle?.openedAt || coin.analyzedAt)} · Price {relativeTime(coin.priceUpdatedAt)} · Analysis {relativeTime(coin.analyzedAt)}
      </p>
      {(stale || coin.stale) && (
        <p className="mt-2 text-xs font-semibold text-amber-200">Stale market data — do not treat this as a fresh fill.</p>
      )}
      {coin.scanState === "pending" && (
        <p className="mt-2 text-xs text-slate-400">This coin has not finished scanning. No valid signal yet.</p>
      )}

      <Link href={href} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220]">
        {label}
      </Link>
    </article>
  );
}
