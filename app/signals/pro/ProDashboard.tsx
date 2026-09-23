"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { fmt, signalsFetch } from "@/lib/signals/client";
import { SCAN_INTERVALS, type CoinScan } from "@/lib/signals-engine/types";
import SignalChart from "../components/SignalChart";
import SignalCard from "../components/SignalCard";
import { ScannerSkeletons } from "../components/ScannerSkeletons";
import PatternShowcase from "../components/PatternShowcase";
import { PatternAnalysis, primaryPatternLevels } from "../components/PatternAnalysis";
import { ObservedBars, SourceBadge } from "../components/ObservedBars";
import LatestActivity from "../components/LatestActivity";
import ScannerHealthPanel from "../components/ScannerHealthPanel";
import SignalsAdSlot from "../components/SignalsAdSlot";
import SignalsHero from "../components/SignalsHero";
import SignalsPromoBanner from "../components/SignalsPromoBanner";
import SummaryCards from "../components/SummaryCards";
import NearSetupsPanel from "../components/NearSetupsPanel";
import OfficialLiveSignals from "../components/OfficialLiveSignals";
import { pairLabel } from "../lib/format";
import { isActionableSetup, matchesStatusFilter } from "../lib/status";
import type { NearSetup } from "@/lib/signals-engine/near-setups";

type ScanResponse = {
  error?: string;
  stale?: boolean;
  warnings?: string[];
  pricesUpdatedAt?: string;
  fetchedAt?: string;
  coins?: CoinScan[];
  nearSetups?: NearSetup[];
  officialLive?: CoinScan[];
  universe?: { mode: string; eligible: number; selected: number };
  progress?: { scanned: number; failed: number; skipped: number; pending: number; running: boolean; fresh?: number; stale?: number; queueBacklog?: number };
  counts?: { long: number; short: number; wait: number; invalid: number; expired: number; pending: number };
  health?: {
    priceFeed: string;
    analysisFeed: string;
    lastScanAt: string | null;
    lastPriceAt: string | null;
    monitoring: string;
    lastCycleAt?: string | null;
    lastCycleDurationMs?: number | null;
    lastFullUniverseAt?: string | null;
    lastFullUniverseDurationMs?: number | null;
    requestWeightUsed?: number | null;
    requestWeightLimit?: number;
    queueBacklog?: number;
    workerStatus?: string;
    freshCount?: number;
    staleCount?: number;
    failedCount?: number;
    pendingCount?: number;
    neverScannedCount?: number;
    selectedCount?: number;
    analyzedCount?: number;
    priceUpdatedCount?: number;
    analysisDurationMs?: number | null;
    coverageNote?: string;
  };
};

const TABS = ["signals", "scanner", "charts", "patterns", "history", "subscription"] as const;
type Tab = (typeof TABS)[number];
const STATUS_TABS = [
  { id: "SETUPS", label: "Setups" },
  { id: "LONG", label: "LONG" },
  { id: "SHORT", label: "SHORT" },
  { id: "WAIT", label: "WAIT" },
  { id: "PENDING", label: "Pending" },
  { id: "STALE", label: "Stale" },
  { id: "EXPIRED", label: "Expired" },
  { id: "INVALIDATED", label: "Invalidated" },
] as const;
const PAGE_SIZE = 12;

export default function ProDashboard({ user, expiresAt }: { user: User; expiresAt?: string | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const tab = (TABS.includes(params.get("tab") as Tab) ? params.get("tab") : "signals") as Tab;
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"15" | "50" | "100" | "all" | "custom">("50");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("SETUPS");
  const [tfFilter, setTfFilter] = useState("ALL");
  const [patternQuery, setPatternQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "volume" | "change">("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string>("BTCUSDT");
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<Record<string, unknown> | null>(null);
  const [sparks, setSparks] = useState<Record<string, number[]>>({});
  const busy = useRef(false);

  const setTab = (next: Tab) => {
    const url = next === "signals" ? "/signals" : `/signals?tab=${next}`;
    router.replace(url, { scroll: false });
  };

  const loadScan = useCallback(async (force = false) => {
    if (busy.current) return;
    busy.current = true;
    setScanning(true);
    try {
      const response = await signalsFetch(`/api/signals/scanner?mode=${mode}${force ? "&force=1" : ""}`, user);
      const body = await response.json();
      if (!response.ok) throw Error(body.error || "Scanner failed");
      setScan(body);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scanner failed");
    } finally {
      busy.current = false;
      setScanning(false);
    }
  }, [mode, user]);

  useEffect(() => {
    void loadScan(tab === "scanner");
    const timer = window.setInterval(() => void loadScan(false), 30000);
    return () => window.clearInterval(timer);
  }, [loadScan, tab]);

  useEffect(() => {
    if (history) return;
    void signalsFetch("/api/signals/history", user).then(async (response) => {
      setHistory(await response.json());
    });
  }, [history, user]);

  useEffect(() => {
    void fetch("/api/signals/ticker", { cache: "no-store" }).then(async (response) => {
      const body = await response.json() as { rows?: Array<{ symbol: string; sparkline?: number[] }> };
      const next: Record<string, number[]> = {};
      for (const row of body.rows || []) next[row.symbol] = row.sparkline || [];
      setSparks(next);
    }).catch(() => undefined);
  }, []);

  const coins = scan?.coins || [];
  useEffect(() => {
    if (!coins.find((coin) => coin.symbol === selected) && coins[0]) {
      setSelected(coins[0].symbol);
    }
  }, [coins, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    const pattern = patternQuery.trim().toUpperCase();
    return coins.filter((coin) => {
      if (!matchesStatusFilter(coin, status)) return false;
      if (q && !coin.symbol.includes(q) && !coin.symbol.replace("USDT", "").includes(q)) return false;
      if (tfFilter !== "ALL" && !coin.timeframes.some((item) => item.interval === tfFilter)) return false;
      if (pattern && !coin.pattern.toUpperCase().includes(pattern)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "volume") return (b.quoteVolume || 0) - (a.quoteVolume || 0);
      if (sortBy === "change") return Math.abs(b.changePct || 0) - Math.abs(a.changePct || 0);
      return (Date.parse(b.analyzedAt) || 0) - (Date.parse(a.analyzedAt) || 0);
    });
  }, [coins, patternQuery, query, sortBy, status, tfFilter]);

  useEffect(() => {
    setPage(1);
  }, [status, query, tfFilter, patternQuery, sortBy, mode]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedCoin = coins.find((coin) => coin.symbol === selected) || pageItems[0] || coins[0] || null;
  const scanned = scan?.progress?.scanned ?? 0;
  const selectedCount = scan?.universe?.selected ?? coins.length;
  const progressPct = selectedCount ? Math.min(100, Math.round((scanned / selectedCount) * 100)) : 0;

  const validated = coins.filter((coin) => isActionableSetup(coin));
  const officialLive = (scan?.officialLive || []).filter((coin) => isActionableSetup(coin));
  const nearCount = scan?.nearSetups?.length ?? 0;

  return (
    <div className="space-y-5">
      <SignalsHero health={scan?.health} plan="pro" />
      <SignalsPromoBanner variant="pro" health={scan?.health} />
      <div className="md:hidden">
        <SignalsAdSlot placement="signals-mobile" />
      </div>
      <header className="pw-signals-card rounded-[24px] px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">Pippinway Signals Pro</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">Validated setups, clearly labeled</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Unlimited reveals. The default universe is the Top 50 USDT-M perpetuals by 24h quote volume. Not every selected coin is a trade.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-300">PRO ACTIVE</p>
            {expiresAt && <p className="text-xs text-slate-400">Expires {new Date(expiresAt).toLocaleDateString()}</p>}
          </div>
        </div>
        {(scanning || scan?.progress?.running) && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Scanning {scanned}/{selectedCount || "—"}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#FBB03B]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
        {scan?.stale && <p className="mt-3 text-sm text-amber-200">Price or scan data is stale. Do not treat pending coins as confirmed setups.</p>}
      </header>

      <SummaryCards items={[
        { label: "Top 50 selected", value: selectedCount, tone: "gold" },
        { label: "Scan LONG", value: scan?.counts?.long ?? 0, tone: "long" },
        { label: "Scan SHORT", value: scan?.counts?.short ?? 0, tone: "short" },
        { label: "Scan WAIT", value: scan?.counts?.wait ?? 0, tone: "wait" },
        { label: "Official active", value: officialLive.length, tone: "long" },
        { label: "Near Setups", value: nearCount, tone: "muted" },
        { label: "Pending", value: scan?.counts?.pending ?? scan?.progress?.pending ?? 0 },
      ]} />

      {(tab === "signals" || tab === "scanner") && (
        <>
          <OfficialLiveSignals items={officialLive} stale={scan?.stale} sparks={sparks} />
          <NearSetupsPanel
            items={scan?.nearSetups}
            onSelect={(symbol) => {
              setSelected(symbol);
              if (tab !== "signals") setTab("signals");
            }}
          />
        </>
      )}

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

      {tab === "signals" && (
        <section id="live-signals" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatus(item.id)}
                className={`min-h-10 rounded-full px-4 text-sm font-semibold ${status === item.id ? "bg-[#FBB03B] text-[#0B1220]" : "border border-white/10 text-slate-200"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coin" className="min-h-11 min-w-[160px] flex-1 rounded-2xl border border-white/10 bg-[#0B1220] px-4 text-sm" />
            <select value={tfFilter} onChange={(event) => setTfFilter(event.target.value)} className="min-h-11 rounded-2xl border border-white/10 bg-[#0B1220] px-3 text-sm">
              <option value="ALL">All timeframes</option>
              {SCAN_INTERVALS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input value={patternQuery} onChange={(event) => setPatternQuery(event.target.value)} placeholder="Pattern" className="min-h-11 w-32 rounded-2xl border border-white/10 bg-[#0B1220] px-3 text-sm" />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="min-h-11 rounded-2xl border border-white/10 bg-[#0B1220] px-3 text-sm">
              <option value="newest">Newest</option>
              <option value="volume">Volume</option>
              <option value="change">24h move</option>
            </select>
          </div>
          {!coins.length ? <ScannerSkeletons count={6} /> : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {pageItems.map((coin) => (
                <SignalCard
                  key={coin.symbol}
                  coin={coin}
                  stale={scan?.stale}
                  sparkline={sparks[coin.symbol]}
                  ctaLabel={coin.direction === "WAIT" || !coin.setup ? "View Analysis" : "View Signal"}
                />
              ))}
            </div>
          )}
          {!!coins.length && status === "SETUPS" && !validated.length && (
            <p className="rounded-[22px] border border-white/10 bg-[#0B1220] px-4 py-6 text-sm text-slate-300">
              No validated setup available right now. WAIT, pending and stale coins are not treated as trades.
            </p>
          )}
          {!!coins.length && !filtered.length && status !== "SETUPS" && (
            <p className="rounded-[22px] border border-white/10 bg-[#0B1220] px-4 py-6 text-sm text-slate-300">
              No coins match these filters. Unscanned or pending coins are not treated as valid signals.
            </p>
          )}
          {pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{filtered.length} coins · page {page} of {pages}</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="min-h-10 rounded-full border border-white/10 px-4 text-sm disabled:opacity-40">Previous</button>
                <button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="min-h-10 rounded-full border border-white/10 px-4 text-sm disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
          </div>
          <aside className="space-y-4">
            <div className="hidden xl:block">
              <SignalsAdSlot placement="signals-pro" />
            </div>
            <ScannerHealthPanel health={scan?.health} selected={selectedCount} />
            <LatestActivity items={((history?.live as Array<Record<string, unknown>> | undefined) || coins.filter((coin) => coin.lifecycle).slice(0, 8)).map((item) => ({
              id: String((item as { id?: string }).id || (item as { symbol?: string }).symbol),
              symbol: String((item as { symbol?: string }).symbol || ""),
              direction: String((item as { direction?: string }).direction || ""),
              lifecycleStatus: String((item as { lifecycleStatus?: string; lifecycle?: { status?: string } }).lifecycleStatus || (item as { lifecycle?: { status?: string } }).lifecycle?.status || ""),
              pnlUSDT: (item as { pnlUSDT?: number | null }).pnlUSDT,
            }))} />
          </aside>
        </section>
      )}

      {tab === "scanner" && (
        <section className="space-y-4">
          <ScannerHealthPanel health={scan?.health} selected={selectedCount} />
          <div className="flex flex-wrap gap-2">
            {(["15", "50", "100", "all", "custom"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setMode(item)} className={`min-h-10 rounded-full px-3 text-sm font-bold ${mode === item ? "bg-[#FBB03B] text-[#0B1220]" : "border border-white/10 text-slate-300"}`}>
                {item === "all" ? "All Coins" : item === "custom" ? "Custom" : item === "50" ? "Top 50" : `${item} Coins`}
              </button>
            ))}
            <button type="button" disabled={scanning} onClick={() => void loadScan(true)} className="min-h-10 rounded-full bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220] disabled:opacity-50">{scanning ? "Scanning…" : "Refresh"}</button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              ["Eligible", scan?.universe?.eligible ?? "—"],
              ["Top 50 selected", scan?.universe?.selected ?? coins.length],
              ["Analyzed", scan?.health?.analyzedCount != null ? `${scan.health.analyzedCount}/${scan.health.selectedCount ?? scan?.universe?.selected ?? 50}` : (scan?.progress?.scanned ?? 0)],
              ["Price update", scan?.health?.lastPriceAt ? new Date(scan.health.lastPriceAt).toLocaleTimeString() : "—"],
              ["Updated quotes", scan?.health?.priceUpdatedCount ?? "—"],
              ["Last analysis", scan?.health?.lastScanAt ? new Date(scan.health.lastScanAt).toLocaleTimeString() : "—"],
              ["Fresh", scan?.health?.freshCount ?? scan?.progress?.fresh ?? "—"],
              ["Stale", scan?.health?.staleCount ?? scan?.progress?.stale ?? "—"],
              ["Pending", scan?.progress?.pending ?? scan?.health?.pendingCount ?? 0],
              ["Failed", scan?.health?.failedCount ?? scan?.progress?.failed ?? 0],
              ["Queue", scan?.health?.queueBacklog ?? scan?.progress?.queueBacklog ?? "—"],
              ["LONG", scan?.counts?.long ?? 0],
              ["SHORT", scan?.counts?.short ?? 0],
              ["WAIT", scan?.counts?.wait ?? 0],
              ["Invalid/Expired", (scan?.counts?.invalid ?? 0) + (scan?.counts?.expired ?? 0)],
              ["Cycle", scan?.health?.lastCycleDurationMs != null ? `${scan.health.lastCycleDurationMs} ms` : "—"],
              ["Full pass", (scan?.health?.analysisDurationMs ?? scan?.health?.lastFullUniverseDurationMs) != null ? `${Math.round(((scan?.health?.analysisDurationMs ?? scan?.health?.lastFullUniverseDurationMs) as number) / 1000)}s` : "not yet"],
              ["Weight", scan?.health?.requestWeightUsed != null ? `${scan.health.requestWeightUsed}/${scan.health.requestWeightLimit || 2400}` : "—"],
              ["Worker", scan?.health?.workerStatus || scan?.health?.monitoring || "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#0B1220] px-3 py-3">
                <p className="text-[10px] uppercase text-slate-500">{label}</p>
                <p className="text-lg font-bold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Health {scan?.health ? `${scan.health.priceFeed}/${scan.health.analysisFeed}` : "—"} · last scan {scan?.health?.lastScanAt ? new Date(scan.health.lastScanAt).toLocaleString() : "—"} · last cycle {scan?.health?.lastCycleAt ? new Date(scan.health.lastCycleAt).toLocaleTimeString() : "—"} · last full-universe pass {scan?.health?.lastFullUniverseAt ? new Date(scan.health.lastFullUniverseAt).toLocaleString() : "not measured yet"}
          </p>
          {scan?.health?.coverageNote && <p className="text-xs text-amber-200">{scan.health.coverageNote}</p>}
        </section>
      )}

      {tab === "charts" && selectedCoin && (
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-[#0B1220] p-4">
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="min-h-11 rounded-2xl border border-white/10 bg-[#0B1220] px-3 text-sm">
            {coins.map((coin) => <option key={coin.symbol} value={coin.symbol}>{pairLabel(coin.symbol)}</option>)}
          </select>
          <SignalChart
            user={user}
            symbol={selectedCoin.symbol}
            locked={false}
            entry={selectedCoin.setup?.entry ?? selectedCoin.originalEntry}
            stop={selectedCoin.setup?.stop}
            target={selectedCoin.setup?.target}
            support={primaryPatternLevels(selectedCoin).support ?? selectedCoin.timeframes[0]?.support}
            resistance={primaryPatternLevels(selectedCoin).resistance ?? selectedCoin.timeframes[0]?.resistance}
            neckline={primaryPatternLevels(selectedCoin).neckline}
            pattern={selectedCoin.pattern}
            lastCandleCloseAt={selectedCoin.lastCandleCloseAt}
          />
        </section>
      )}

      {tab === "patterns" && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">Detected now</h2>
            <p className="text-xs text-slate-500">Algorithmically detected on the current scan. Not educational filler.</p>
            <PatternAnalysis coin={selectedCoin} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Developing patterns</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {coins.filter((coin) => coin.patternStatus === "FORMING").slice(0, 12).map((coin) => (
                <li key={coin.symbol}>{pairLabel(coin.symbol)} · {coin.pattern} · forming</li>
              ))}
              {!coins.some((coin) => coin.patternStatus === "FORMING") && <li>No forming patterns in this scan.</li>}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold">Educational pattern library</h2>
            <p className="text-xs text-slate-500">Diagrams only. These are not live detections.</p>
            <PatternShowcase />
          </div>
        </section>
      )}

      {tab === "history" && <HistoryPanel data={history} />}
      {tab === "subscription" && (
        <section className="space-y-4">
          <p className="text-sm text-slate-300">Pro is already active on this account. Payments stay EcoCash-only and still need admin verification.</p>
          <SignalsPromoBanner variant="pro" health={scan?.health} />
          <Link href="/signals/payments" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#FBB03B]">View payment history</Link>
        </section>
      )}
    </div>
  );
}

function HistoryPanel({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return <p className="text-sm text-slate-400">Loading history…</p>;
  if (data.locked) {
    return <p className="text-sm text-slate-400">{String(data.note || "History is locked.")}</p>;
  }
  const performance = data.performance as { waiting?: number; triggered?: number; targetHits?: number; stopHits?: number; missed?: number; expired?: number; invalidated?: number; observedSample?: number; brokerageVerified?: number } | undefined;
  const live = (data.live as Array<Record<string, unknown>> | undefined) || [];
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SourceBadge kind="observed" />
        <SourceBadge kind="brokerage" />
      </div>
      {performance && (
        <ObservedBars
          items={[
            { label: "Target hit", value: performance.targetHits ?? 0, color: "#10b981" },
            { label: "Stop hit", value: performance.stopHits ?? 0, color: "#f43f5e" },
            { label: "Expired", value: performance.expired ?? 0, color: "#64748b" },
            { label: "Invalidated", value: performance.invalidated ?? 0, color: "#a855f7" },
            { label: "Missed", value: performance.missed ?? 0, color: "#94a3b8" },
          ]}
          empty="No official lifecycle events stored yet."
        />
      )}
      <p className="text-xs text-slate-500">Observed sample {performance?.observedSample ?? 0} · brokerage verified {performance?.brokerageVerified ?? 0}. Hypothetical or observed results are not brokerage-verified fills.</p>
      <ul className="space-y-2">
        {live.slice(0, 40).map((item) => (
          <li key={String(item.id)} className="rounded-2xl border border-white/10 bg-[#0B1220] px-3 py-2 text-sm">
            {String(item.symbol)} · {String(item.direction)} · {String(item.lifecycleStatus || item.outcome)} · {item.pnlUSDT != null ? `pnl $${fmt(Number(item.pnlUSDT), 2)}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
