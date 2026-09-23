"use client";

import Image from "next/image";
import Link from "next/link";
import LiveMonitorBadge from "./LiveMonitorBadge";
import { monitorIsLive, type MonitorHealth } from "../lib/health";

export default function SignalsPromoBanner({
  variant,
  health,
}: {
  variant: "free" | "pro";
  health?: MonitorHealth | null;
}) {
  const live = monitorIsLive(health);
  return (
    <section className="pw-signals-card relative overflow-hidden rounded-[28px]">
      <Image
        src="/signals/hero-bitcoin.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-right opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050910] via-[#050910]/78 to-transparent" />
      <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FBB03B]">Pippinway Signals</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Live market monitoring</h2>
        <ul className="mt-3 space-y-1 text-sm text-slate-300">
          <li>Top 50 Binance Futures coins</li>
          <li>{live ? "Monitoring cycle every 60 seconds" : "Monitoring cycle is delayed or offline"}</li>
          <li>Validated setups · clear risk management</li>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LiveMonitorBadge health={health} />
          {variant === "free" ? (
            <Link href="/signals/pay" className="inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220]">
              Upgrade to Pro
            </Link>
          ) : (
            <Link href="/signals?tab=scanner" className="inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220]">
              Open scanner
            </Link>
          )}
        </div>
        {variant === "free" && (
          <p className="mt-3 max-w-xl text-xs text-slate-400">
            Free includes four unique complete-signal reveals each UTC day. Opening this page does not use a reveal.
          </p>
        )}
      </div>
    </section>
  );
}
