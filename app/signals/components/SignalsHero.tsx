"use client";

import Image from "next/image";
import Link from "next/link";
import { Activity, Clock3, Layers } from "lucide-react";
import LiveMonitorBadge from "./LiveMonitorBadge";
import { monitorIsLive, type MonitorHealth } from "../lib/health";

export default function SignalsHero({
  health,
  plan,
}: {
  health?: MonitorHealth | null;
  plan?: "guest" | "free" | "pro";
}) {
  const live = monitorIsLive(health);
  return (
    <section className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-[#FBB03B]/20 bg-[#070d1a] sm:min-h-[340px]">
      <Image
        src="/signals/hero-bitcoin.png"
        alt="Stylized gold coin in front of a dark candlestick chart"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-[82%_center] opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050910] via-[#050910]/80 to-[#050910]/20" />
      <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FBB03B]">Pippinway Signals</p>
        <h1 className="mt-3 max-w-3xl text-[2rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[52px]">
          Live Binance Futures market analysis
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200">
            <Layers className="h-3.5 w-3.5 text-[#FBB03B]" /> Top 100 • Pattern Analysis • Every 5 Minutes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200">
            <Clock3 className="h-3.5 w-3.5 text-[#FBB03B]" /> {live ? "Market monitoring every minute" : "Monitoring status is shown honestly"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200">
            <Activity className="h-3.5 w-3.5 text-[#FBB03B]" /> Validated trading setups
          </span>
        </div>
        <div className="mt-6">
          <LiveMonitorBadge health={health} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signals#live-signals" className="inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]">
            View signals
          </Link>
          {plan !== "pro" && (
            <Link href="/signals/pay" className="inline-flex min-h-11 items-center rounded-full border border-[#FBB03B]/50 px-5 text-sm font-semibold text-[#FBB03B]">
              Upgrade to Pro
            </Link>
          )}
        </div>
        <p className="mt-5 max-w-2xl text-xs leading-5 text-slate-400">
          Educational decision support only. Futures can lose more than the planned stop. A price touch is not a brokerage-confirmed fill. No win rate or profit is promised.
        </p>
      </div>
    </section>
  );
}
