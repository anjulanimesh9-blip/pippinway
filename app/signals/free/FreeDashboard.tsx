"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { signalsFetch } from "@/lib/signals/client";
import type { CoinScan } from "@/lib/signals-engine/types";
import type { FreeEligibleCoin } from "@/lib/signals/free-daily";
import EligibleCoinCard from "../components/EligibleCoinCard";
import LatestActivity from "../components/LatestActivity";
import ScannerHealthPanel from "../components/ScannerHealthPanel";
import SignalCard from "../components/SignalCard";
import SignalsAdSlot from "../components/SignalsAdSlot";
import SignalsHero from "../components/SignalsHero";
import SignalsPromoBanner from "../components/SignalsPromoBanner";
import SummaryCards from "../components/SummaryCards";
import NearSetupsPanel from "../components/NearSetupsPanel";
import UpgradePanel from "../components/UpgradePanel";
import UtcCountdown from "../components/UtcCountdown";
import { ScannerSkeletons } from "../components/ScannerSkeletons";
import type { NearSetup } from "@/lib/signals-engine/near-setups";

type DailyPayload = {
  error?: string;
  pending?: boolean;
  signals?: CoinScan[];
  eligible?: FreeEligibleCoin[];
  nearSetups?: NearSetup[];
  resetAt?: string;
  stale?: boolean;
  allowance?: { used: number; limit: number; remaining: number; resetAt: string };
  subscription?: { expired?: boolean; expiresAt?: string | null };
  config?: { proPriceMonthly?: number; currency?: string; freeDailyReveals?: number };
  health?: {
    lastCycleAt?: string | null;
    lastPriceAt?: string | null;
    lastScanAt?: string | null;
    monitoring?: string | null;
    workerStatus?: string | null;
    lastCycleDurationMs?: number | null;
    lastFullUniverseAt?: string | null;
    queueBacklog?: number | null;
    failedCount?: number | null;
    coverageNote?: string | null;
  };
};

const PRO_TABS = new Set(["scanner", "charts", "patterns"]);

export default function FreeDashboard({ user, initial }: { user: User; initial?: DailyPayload | Record<string, unknown> | null }) {
  const tab = useSearchParams().get("tab") || "signals";
  const [data, setData] = useState<DailyPayload | null>((initial as DailyPayload) || null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string>("");
  const [showMore, setShowMore] = useState(false);

  async function load() {
    const response = await signalsFetch("/api/signals/daily", user);
    const body = await response.json() as DailyPayload;
    if (!response.ok) {
      setError(body.error || "Could not load today's signals.");
      return;
    }
    setData(body);
    setError("");
  }

  useEffect(() => {
    let active = true;
    void load();
    const timer = window.setInterval(() => {
      if (active) void load();
    }, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  async function reveal(symbol: string) {
    setBusy(symbol);
    try {
      const response = await signalsFetch("/api/signals/reveal", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) {
        setError(body.error || "Could not reveal that signal.");
        return;
      }
      await load();
    } finally {
      setBusy("");
    }
  }

  const used = data?.allowance?.used ?? 0;
  const limit = data?.allowance?.limit ?? 4;
  const remaining = data?.allowance?.remaining ?? Math.max(0, limit - used);
  const revealed = data?.signals || [];
  const eligible = data?.eligible || [];
  const expired = data?.subscription?.expired;
  const price = data?.config?.proPriceMonthly ?? 4.99;
  const primaryRevealed = revealed.slice(0, 2);
  const extraRevealed = revealed.slice(2);
  const lockedFill = eligible.slice(0, Math.max(0, 2 - primaryRevealed.length));
  const extraLocked = eligible.slice(lockedFill.length);

  if (PRO_TABS.has(tab)) {
    return (
      <div className="space-y-6">
        <SignalsHero health={data?.health} plan="free" />
        <header className="pw-signals-card rounded-[24px] px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">Free plan</p>
          <h2 className="mt-1 text-2xl font-bold capitalize">{tab}</h2>
          <p className="mt-2 text-sm text-slate-400">Scanner, charts and patterns stay on Pro. Free members reveal up to {limit} complete signals each UTC day.</p>
        </header>
        <UpgradePanel price={price} expired={expired} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SignalsHero health={data?.health} plan="free" />
      <SignalsPromoBanner variant="free" health={data?.health} />
      <div className="md:hidden">
        <SignalsAdSlot placement="signals-mobile" />
      </div>

      <section id="live-signals" className="pw-signals-card rounded-[24px] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">Today&apos;s Free Signals</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{used}/{limit} reveals used</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Two cards are shown first as a layout choice. A reveal is used only when you tap Reveal Signal. Reopening a revealed coin does not use another reveal.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-200">FREE PLAN</span>
        </div>
        {expired && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Your Pro subscription has expired. You are on the Free plan until you renew.
          </p>
        )}
      </section>

      <SummaryCards items={[
        { label: "Reveals used", value: `${used}/${limit}`, tone: "gold" },
        { label: "Remaining", value: remaining, tone: "muted" },
        { label: "Revealed now", value: revealed.length, tone: "long" },
        { label: "Locked watchlist", value: eligible.length, tone: "wait" },
        { label: "Resets in", value: <UtcCountdown resetAt={data?.resetAt || data?.allowance?.resetAt} />, hint: "00:00 UTC" },
      ]} />

      <NearSetupsPanel items={data?.nearSetups} />

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

      {!data && !error ? (
        <ScannerSkeletons count={4} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h3 className="text-lg font-bold">Primary slots</h3>
                <p className="text-xs text-slate-500">Locked cards never show entry, stop or target.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {primaryRevealed.map((coin) => (
                  <SignalCard key={coin.symbol} coin={coin} stale={data?.stale} />
                ))}
                {lockedFill.map((coin) => (
                  <EligibleCoinCard
                    key={coin.symbol}
                    coin={coin}
                    remaining={remaining}
                    busy={busy === coin.symbol}
                    onReveal={(symbol) => void reveal(symbol)}
                  />
                ))}
                {!primaryRevealed.length && !lockedFill.length && (
                  <p className="rounded-[22px] border border-white/10 bg-[#0B1220] px-4 py-8 text-center text-sm text-slate-300 md:col-span-2">
                    No validated Free watchlist coins are available right now. WAIT is not used as a substitute signal.
                  </p>
                )}
              </div>
            </section>

            {(extraRevealed.length > 0 || extraLocked.length > 0) && (
              <section>
                {!showMore ? (
                  <button
                    type="button"
                    onClick={() => setShowMore(true)}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm font-semibold"
                  >
                    Access up to {Math.min(2, extraLocked.length + extraRevealed.length)} more reveal{Math.min(2, extraLocked.length + extraRevealed.length) === 1 ? "" : "s"}
                  </button>
                ) : (
                  <>
                    <h3 className="mb-3 text-lg font-bold">Additional Free coins</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {extraRevealed.map((coin) => (
                        <SignalCard key={coin.symbol} coin={coin} stale={data?.stale} />
                      ))}
                      {extraLocked.map((coin) => (
                        <EligibleCoinCard
                          key={coin.symbol}
                          coin={coin}
                          remaining={remaining}
                          busy={busy === coin.symbol}
                          onReveal={(symbol) => void reveal(symbol)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {remaining <= 0 && (
              <p className="rounded-[22px] border border-white/10 bg-[#0B1220] px-4 py-4 text-sm text-slate-300">
                Today&apos;s 4 free signal reveals have been used. Resets at 00:00 UTC.
              </p>
            )}

            <UpgradePanel price={price} expired={expired} />
          </div>
          <aside className="space-y-4">
            <div className="hidden md:block">
              <SignalsAdSlot placement="signals-free" />
            </div>
            <ScannerHealthPanel health={data?.health} />
            <LatestActivity items={revealed.map((coin) => ({
              symbol: coin.symbol,
              direction: coin.direction,
              lifecycleStatus: coin.lifecycle?.status,
            }))} />
          </aside>
        </div>
      )}
    </div>
  );
}
