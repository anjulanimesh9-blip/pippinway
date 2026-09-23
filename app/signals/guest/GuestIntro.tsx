"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeatureRow from "../components/FeatureRow";
import MarketTicker from "../components/MarketTicker";
import SignalsHero from "../components/SignalsHero";
import SignalsPromoBanner from "../components/SignalsPromoBanner";
import UpgradePanel from "../components/UpgradePanel";
import type { MonitorHealth } from "../lib/health";

export default function GuestIntro() {
  const [health, setHealth] = useState<MonitorHealth | null>(null);

  useEffect(() => {
    void fetch("/api/signals/ticker", { cache: "no-store" }).then(async (response) => {
      const body = await response.json() as { health?: MonitorHealth };
      if (response.ok) setHealth(body.health || null);
    }).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <MarketTicker />
      <SignalsHero plan="guest" health={health} />
      <SignalsPromoBanner variant="free" health={health} />
      <section className="pw-signals-card rounded-[28px] px-5 py-8 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FBB03B]">Same Pippinway account</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Sign in to reveal today&apos;s Free signals</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
          Free members get up to four unique complete-signal reveals each UTC day. Pro unlocks the Top 50 scanner, charts, patterns and history. Marketplace and Vibe stay on the same login.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login?returnUrl=/signals" className="inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]">Login</Link>
          <Link href="/register?returnUrl=/signals" className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold">Create Account</Link>
        </div>
      </section>
      <UpgradePanel />
      <FeatureRow />
    </div>
  );
}
