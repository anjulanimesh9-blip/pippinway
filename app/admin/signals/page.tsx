"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import { SIGNALS_COMPLIANCE_CHECKLIST } from "@/lib/signals/compliance";
import { DEFAULT_SIGNALS_CONFIG, sanitizeConfig } from "@/lib/signals/config";
import { signalsFetch } from "@/lib/signals/client";
import { ObservedBars, SourceBadge } from "@/app/signals/components/ObservedBars";

type AdminPayload = {
  config?: typeof DEFAULT_SIGNALS_CONFIG;
  health?: {
    stale: boolean;
    error?: string;
    fetchedAt: string;
    lastSuccessAt?: string | null;
    lastPriceAt?: string | null;
    lastScanAt?: string | null;
    availablePairs: number;
    totalPairs: number;
    monitoring?: string;
    writeErrors?: number;
    lastWriteError?: string | null;
    activeCount?: number;
    expiredCount?: number;
    backend?: string;
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
    validatedLong?: number;
    validatedShort?: number;
    waitCount?: number;
    rejectedCount?: number;
    coverageNote?: string;
  };
  performance?: {
    published: number;
    waiting: number;
    triggered: number;
    missed: number;
    expired: number;
    invalidated: number;
    targetHits: number;
    stopHits: number;
    observedSample: number;
    hypotheticalNetPnl: number;
    hypotheticalGrossPnl: number;
    maxDrawdownUSDT: number | null;
    brokerageVerified: number;
    note: string;
  };
  users?: Array<{
    id: string;
    email?: string;
    signalsMembership?: string;
    signalsProExpiresAt?: string | null;
    signalsProStartedAt?: string | null;
  }>;
  usersError?: string | null;
  firestoreAdminConfigured?: boolean;
  billingBackend?: "firestore" | "local-file";
  usersBackend?: string;
  investigation?: Array<{
    id: string;
    symbol: string;
    interval: string;
    openedAt: string;
    originalEntry: number;
    stop: number;
    target: number;
    pattern: string;
    lifecycleStatus: string;
    fillConfirmed: boolean;
    investigation?: {
      qualityLabel?: string;
      supporting: string[];
      contradictory: string[];
      marketAtPublication: { price: number | null; volumeRatio?: number | null; btcTrend?: string | null; fundingRate?: number | null };
    } | null;
  }>;
  history?: {
    liveStats?: { closedSample: number; winRate: number | null; wins: number; losses: number; netPnlUSDT?: number };
    backtestStats?: { closedSample: number; winRate: number | null };
    live?: Array<{
      id: string;
      symbol: string;
      direction: string;
      outcome: string;
      openedAt: string;
      pnlUSDT?: number | null;
      executable?: boolean;
      marginUSDT?: number;
      leverage?: number;
      quantity?: number;
      lifecycleStatus?: string;
      originalEntry?: number;
    }>;
  };
};

function healthTone(health?: AdminPayload["health"]) {
  if (!health) return { label: "Waiting", className: "border-white/10 bg-white/5 text-gray-300", bar: "bg-white/20" };
  if (health.monitoring === "error" || health.stale) {
    return { label: "Attention", className: "border-rose-500/30 bg-rose-500/10 text-rose-100", bar: "bg-rose-400" };
  }
  if (health.monitoring === "offline" || health.monitoring === "idle") {
    return { label: "Idle", className: "border-amber-500/30 bg-amber-500/10 text-amber-100", bar: "bg-amber-400" };
  }
  return { label: "Live", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100", bar: "bg-emerald-400" };
}

export default function AdminSignalsPage() {
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [users, setUsers] = useState<Array<{
    id: string;
    email?: string;
    signalsMembership?: string;
    signalsProExpiresAt?: string | null;
  }>>([]);
  const [usersError, setUsersError] = useState("");
  const [paymentsError, setPaymentsError] = useState("");
  const [billingBackend, setBillingBackend] = useState<"firestore" | "local-file" | "">("");
  const [firestoreAdminConfigured, setFirestoreAdminConfigured] = useState<boolean | null>(null);
  const [price, setPrice] = useState(String(DEFAULT_SIGNALS_CONFIG.proPriceMonthly));
  const [freeSymbols, setFreeSymbols] = useState(DEFAULT_SIGNALS_CONFIG.freeSymbols.join(","));
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [betaMode, setBetaMode] = useState(true);
  const [ecocashName, setEcocashName] = useState("");
  const [ecocashNumber, setEcocashNumber] = useState("");
  const [ecocashInstructions, setEcocashInstructions] = useState("");
  const [subscriptionDays, setSubscriptionDays] = useState("30");
  const [payments, setPayments] = useState<Array<{
    id: string;
    uid: string;
    email: string;
    status: string;
    amount: number;
    currency: string;
    transactionRef: string;
    paymentDate: string;
    createdAt: string;
    adminNote?: string;
  }>>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const response = await signalsFetch("/api/signals/admin", user);
        const body = await response.json() as AdminPayload & { error?: string };
        if (!response.ok) {
          setMessage(body.error || `Admin overview failed (${response.status}).`);
        } else {
          setPayload(body);
          const config = sanitizeConfig(body.config || {});
          setPrice(String(config.proPriceMonthly));
          setFreeSymbols(config.freeSymbols.join(","));
          setBillingEnabled(config.billingEnabled);
          setBetaMode(config.betaMode);
          setEcocashName(config.ecocashRecipientName || "");
          setEcocashNumber(config.ecocashRecipientNumber || "");
          setEcocashInstructions(config.ecocashInstructions || "");
          setSubscriptionDays(String(config.subscriptionDays || 30));
          setUsers(body.users || []);
          setUsersError(body.usersError || "");
          setFirestoreAdminConfigured(body.firestoreAdminConfigured ?? null);
          if (body.billingBackend) setBillingBackend(body.billingBackend);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Admin overview failed.");
      }
      try {
        const pay = await signalsFetch("/api/signals/payments/admin", user);
        const body = await pay.json() as { payments?: typeof payments; error?: string; backend?: "firestore" | "local-file" };
        if (!pay.ok) {
          setPaymentsError(body.error || `Payment requests failed (${pay.status}).`);
          setPayments([]);
        } else {
          setPayments(body.payments || []);
          setPaymentsError("");
          if (body.backend) setBillingBackend(body.backend);
          setUsers((current) => {
            const map = new Map(current.map((item) => [item.id, item]));
            for (const item of body.payments || []) {
              if (!map.has(item.uid)) {
                map.set(item.uid, {
                  id: item.uid,
                  email: item.email,
                  signalsMembership: item.status === "APPROVED" ? "pro" : "free",
                });
              }
            }
            return [...map.values()];
          });
        }
      } catch (error) {
        setPaymentsError(error instanceof Error ? error.message : "Payment requests failed.");
      }
    });
    return unsub;
  }, []);

  async function saveConfig() {
    const user = auth.currentUser;
    if (!user) return;
    const config = sanitizeConfig({
      betaMode,
      billingEnabled,
      proPriceMonthly: Number(price),
      freeSymbols: freeSymbols.split(",").map((item) => item.trim().toUpperCase()),
      currency: "USD",
      ecocashRecipientName: ecocashName,
      ecocashRecipientNumber: ecocashNumber,
      ecocashInstructions,
      subscriptionDays: Number(subscriptionDays),
    });
    try {
      const response = await signalsFetch("/api/signals/admin", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveConfig", config }),
      });
      const body = await response.json() as { error?: string; config?: typeof config };
      if (!response.ok) {
        setMessage(body.error || "Failed to save Signals settings.");
        return;
      }
      setPayload((current) => current ? { ...current, config: body.config || config } : current);
      setMessage("Signals settings saved. Billing stays off unless you explicitly enable it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save Signals settings.");
    }
  }

  async function decide(paymentId: string, action: "APPROVE" | "REJECT" | "REQUEST_REVIEW") {
    const user = auth.currentUser;
    if (!user) return;
    if (action === "APPROVE") {
      const confirmed = window.confirm("Confirm that you independently verified the EcoCash payment was received. This will activate Pro for this user.");
      if (!confirmed) return;
    }
    const note = window.prompt("Optional admin note") || "";
    const response = await signalsFetch("/api/signals/payments/admin", user, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, action, adminNote: note, confirmReceived: action === "APPROVE" }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Decision failed");
      return;
    }
    setPayments((current) => current.map((item) => (item.id === paymentId ? { ...item, ...body.payment } : item)));
    setMessage(body.idempotent ? "Already processed. Pro was not extended again." : `${action} saved.`);
  }

  async function setPlan(userId: string, plan: "free" | "pro") {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const response = await signalsFetch("/api/signals/admin", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPlan", userId, plan }),
      });
      const body = await response.json() as { error?: string; signalsProExpiresAt?: string | null };
      if (!response.ok) {
        setMessage(body.error || "Failed to update membership.");
        return;
      }
      setUsers((current) => current.map((item) => (
        item.id === userId
          ? { ...item, signalsMembership: plan, signalsProExpiresAt: body.signalsProExpiresAt || null }
          : item
      )));
      setMessage(plan === "pro" ? "Pro granted with subscription expiry." : "User returned to Free.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update membership.");
    }
  }

  const tone = healthTone(payload?.health);
  const pairPct = payload?.health?.totalPairs
    ? Math.round((payload.health.availablePairs / payload.health.totalPairs) * 100)
    : 0;

  return (
    <div className="space-y-6 p-4 text-white lg:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Pippinway Signals</h1>
        <p className="text-sm text-gray-400">Overview, subscriptions, pricing, scanner health, and launch compliance. Paid checkout stays disabled until approved.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Scanner health</h2>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
        </div>
        {(payload?.health?.stale || payload?.health?.monitoring === "offline" || payload?.health?.monitoring === "error" || payload?.health?.monitoring === "idle") && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {payload?.health?.monitoring === "offline" || payload?.health?.monitoring === "idle"
              ? "Scanner monitor is offline or idle. Published cards are not being refreshed until a server worker, cron, or Cloud Function tick runs."
              : "Scanner data is stale or the last market update failed. Do not treat cards as live until the next successful market update."}
          </p>
        )}
        <p className="mt-3 text-sm text-gray-300">
          {payload?.health
            ? `${payload.health.availablePairs}/${payload.health.totalPairs} pairs · monitor ${payload.health.monitoring || "unknown"} · last success ${payload.health.lastSuccessAt || payload.health.fetchedAt}`
            : "Waiting for admin token…"}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div className={`h-full ${tone.bar}`} style={{ width: `${pairPct}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          {[
            ["Eligible pairs", payload?.health?.totalPairs ?? "—"],
            ["Fresh", payload?.health?.freshCount ?? "—"],
            ["Stale", payload?.health?.staleCount ?? "—"],
            ["Pending", payload?.health?.pendingCount ?? payload?.health?.neverScannedCount ?? "—"],
            ["Failed", payload?.health?.failedCount ?? "—"],
            ["Queue", payload?.health?.queueBacklog ?? "—"],
            ["LONG", payload?.health?.validatedLong ?? "—"],
            ["SHORT", payload?.health?.validatedShort ?? "—"],
            ["WAIT", payload?.health?.waitCount ?? "—"],
            ["Cycle ms", payload?.health?.lastCycleDurationMs ?? "—"],
            ["Full pass ms", payload?.health?.lastFullUniverseDurationMs ?? "—"],
            ["Weight", payload?.health?.requestWeightUsed != null ? `${payload.health.requestWeightUsed}/${payload.health.requestWeightLimit || 2400}` : "—"],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-500">{label}</p>
              <p className="text-sm font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Last price {payload?.health?.lastPriceAt || "—"} · last scan {payload?.health?.lastScanAt || "—"} ·
          last cycle {payload?.health?.lastCycleAt || "—"} · last full pass {payload?.health?.lastFullUniverseAt || "—"} ·
          worker {payload?.health?.workerStatus || payload?.health?.monitoring || "—"} ·
          active {payload?.health?.activeCount ?? "—"} · expired/missed {payload?.health?.expiredCount ?? "—"} ·
          backend {payload?.health?.backend || "file"}
        </p>
        {payload?.health?.coverageNote && (
          <p className="mt-2 text-xs text-slate-400">{payload.health.coverageNote}</p>
        )}
        {payload?.health?.writeErrors ? (
          <p className="mt-2 text-sm text-rose-300">Database write errors: {payload.health.writeErrors} · {payload.health.lastWriteError}</p>
        ) : null}
        {payload?.health?.error && <p className="text-sm text-rose-300">{payload.health.error}</p>}
      </section>

      {payload?.performance && (
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
          <h2 className="font-bold">Official observed performance</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <SourceBadge kind="backtested" />
            <SourceBadge kind="observed" />
            <SourceBadge kind="brokerage" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ObservedBars
              items={[
                { label: "Waiting", value: payload.performance.waiting ?? 0, color: "#FBB03B" },
                { label: "Triggered", value: payload.performance.triggered, color: "#3B82F6" },
                { label: "Target hit", value: payload.performance.targetHits, color: "#10b981" },
                { label: "Stop hit", value: payload.performance.stopHits, color: "#f43f5e" },
                { label: "Missed", value: payload.performance.missed, color: "#94a3b8" },
                { label: "Expired", value: payload.performance.expired, color: "#64748b" },
                { label: "Invalidated", value: payload.performance.invalidated, color: "#a855f7" },
              ]}
              empty="No official lifecycle events stored yet."
            />
            <div className="grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
              <p>Published {payload.performance.published}</p>
              <p>Observed sample {payload.performance.observedSample}</p>
              <p>Hyp. net P/L ${payload.performance.hypotheticalNetPnl}</p>
              <p>Hyp. gross P/L ${payload.performance.hypotheticalGrossPnl}</p>
              <p>Max drawdown {payload.performance.maxDrawdownUSDT ?? "—"}</p>
              <p>Brokerage verified {payload.performance.brokerageVerified}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">{payload.performance.note}</p>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <h2 className="font-bold">Free / Pro feature management</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Pro price / month
            <input value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
          <label className="text-sm">
            Free symbols
            <input value={freeSymbols} onChange={(event) => setFreeSymbols(event.target.value)} className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={betaMode} onChange={(event) => setBetaMode(event.target.checked)} />
            Beta mode
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={billingEnabled} onChange={(event) => setBillingEnabled(event.target.checked)} />
            Enable paid billing (keep off until compliance)
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">EcoCash recipient name
            <input value={ecocashName} onChange={(event) => setEcocashName(event.target.value)} className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
          <label className="text-sm">EcoCash recipient number
            <input value={ecocashNumber} onChange={(event) => setEcocashNumber(event.target.value)} placeholder="Set by admin only" className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
          <label className="text-sm sm:col-span-2">Payment instructions
            <textarea value={ecocashInstructions} onChange={(event) => setEcocashInstructions(event.target.value)} className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
          <label className="text-sm">Subscription days
            <input value={subscriptionDays} onChange={(event) => setSubscriptionDays(event.target.value)} className="mt-1 w-full rounded-lg bg-[#0B1220] px-3 py-2" />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">Do not invent an EcoCash number. Card checkout stays off. Receipts are never automatic proof of payment.</p>
        <button type="button" onClick={() => void saveConfig()} className="mt-3 min-h-11 rounded-xl bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]">
          Save Signals settings
        </button>
        {message && (
          <p className={`mt-2 text-sm ${/fail|denied|error|required/i.test(message) ? "text-rose-300" : "text-emerald-300"}`}>
            {message}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <h2 className="font-bold">PipSignal Payments</h2>
        <p className="mt-2 text-xs text-gray-500">Verify the EcoCash transfer independently before approving. Approval is idempotent and a duplicate transaction reference cannot grant Pro twice.</p>
        {billingBackend === "local-file" && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Firebase Admin credentials are not configured. Place the downloaded service-account JSON at %LOCALAPPDATA%\pippinway\firebase-adminsdk.json (outside git), keep GOOGLE_APPLICATION_CREDENTIALS pointed at that path, then restart the dev server. Until then, payment records stay on the local file store.
          </p>
        )}
        {paymentsError && (
          <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{paymentsError}</p>
        )}
        <div className="mt-3 space-y-3">
          {payments.length ? payments.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{item.email || item.uid}</strong>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{item.status}</span>
              </div>
              <p className="mt-1 text-gray-400">${item.amount} {item.currency} · ref {item.transactionRef} · paid {item.paymentDate} · submitted {new Date(item.createdAt).toLocaleString()}</p>
              <p className="text-xs text-gray-500">UID {item.uid}</p>
              <AdminReceipt id={item.id} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="min-h-9 rounded-lg bg-[#FBB03B] px-3 text-[#0B1220]" onClick={() => void decide(item.id, "APPROVE")}>Approve</button>
                <button type="button" className="min-h-9 rounded-lg bg-white/10 px-3" onClick={() => void decide(item.id, "REJECT")}>Reject</button>
                <button type="button" className="min-h-9 rounded-lg bg-white/10 px-3" onClick={() => void decide(item.id, "REQUEST_REVIEW")}>Request Review</button>
              </div>
            </article>
          )) : <p className="text-sm text-gray-500">No EcoCash requests yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <h2 className="font-bold">User subscriptions</h2>
        {firestoreAdminConfigured === false && (
          <p className="mt-2 text-xs text-amber-200">Service-account listing of /users is unavailable. Full directory reads stay server-side.</p>
        )}
        {usersError && (
          <p className={`mt-2 rounded-lg border px-3 py-2 text-sm ${/GOOGLE_APPLICATION_CREDENTIALS|FIREBASE_SERVICE_ACCOUNT/i.test(usersError) ? "border-amber-500/30 bg-amber-500/10 text-amber-100" : "border-rose-500/30 bg-rose-500/10 text-rose-100"}`}>{usersError}</p>
        )}
        <div className="mt-3 max-h-80 overflow-auto text-sm">
          {users.slice(0, 80).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2">
              <span>{item.email || item.id}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.signalsMembership === "pro" ? "bg-[#FBB03B]/15 text-[#FBB03B]" : "text-gray-400"}`}>
                {item.signalsMembership || "free"}
                {item.signalsProExpiresAt ? ` · exp ${item.signalsProExpiresAt.slice(0, 10)}` : ""}
              </span>
              <div className="flex gap-2">
                <button type="button" className="min-h-9 rounded-lg bg-white/10 px-2 py-1" onClick={() => void setPlan(item.id, "free")}>Free</button>
                <button type="button" className="min-h-9 rounded-lg bg-[#FBB03B] px-2 py-1 text-[#0B1220]" onClick={() => void setPlan(item.id, "pro")}>Grant Pro</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <h2 className="font-bold">Performance report</h2>
        <p className="mt-2 text-sm text-gray-300">
          Observed {payload?.history?.liveStats?.wins ?? 0}/{payload?.history?.liveStats?.losses ?? 0} ·
          sample {payload?.history?.liveStats?.closedSample ?? 0} ·
          net ${payload?.history?.liveStats?.netPnlUSDT ?? 0} ·
          backtest sample {payload?.history?.backtestStats?.closedSample ?? 0}
        </p>
        <p className="mt-2 text-xs text-gray-500">Historical rows keep their original margin, leverage, quantity and fee snapshot. Changing current user settings does not rewrite past P/L.</p>
        <ul className="mt-3 space-y-1 text-xs text-gray-400">
          {(payload?.history?.live || []).slice(0, 12).map((item) => (
            <li key={item.id} className="rounded-lg border border-white/5 px-2 py-1.5">
              {item.openedAt} · {item.symbol} · {item.direction} · {item.outcome}
              {item.quantity != null ? ` · qty ${item.quantity}` : ""}
              {item.marginUSDT != null ? ` · ${item.marginUSDT}USDT/${item.leverage}x` : ""}
              {item.pnlUSDT != null ? ` · pnl $${item.pnlUSDT}` : ""}
              {item.lifecycleStatus ? ` · ${item.lifecycleStatus}` : ""}
              {item.executable === false ? " · NOT EXECUTABLE" : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
        <h2 className="font-bold">Signal Investigation</h2>
        <p className="mt-2 text-xs text-gray-500">
          Failed and closed official records only. Original entry/stop/target stay frozen. XMRUSDT appears only if an original official record exists — missing history is never reconstructed from live prices.
        </p>
        <ul className="mt-3 space-y-2 text-xs text-gray-300">
          {(payload?.investigation || [])
            .filter((item) => ["STOP_HIT", "EXPIRED", "INVALIDATED", "MISSED_ENTRY", "TARGET_HIT"].includes(item.lifecycleStatus) || item.investigation)
            .slice(0, 20)
            .map((item) => (
              <li key={item.id} className="rounded-lg border border-white/5 p-2">
                <p className="font-semibold">{item.symbol} · {item.interval} · {item.lifecycleStatus.split("_").join(" ")}</p>
                <p>Opened {item.openedAt} · entry {item.originalEntry} · stop {item.stop} · target {item.target}</p>
                <p>Pattern {item.pattern} · {item.investigation?.qualityLabel || "no quality snapshot"} · fill {item.fillConfirmed ? "confirmed" : "unconfirmed"}</p>
                {item.investigation?.marketAtPublication && (
                  <p className="text-gray-500">
                    At publication: price {item.investigation.marketAtPublication.price ?? "n/a"}
                    {item.investigation.marketAtPublication.btcTrend ? ` · BTC ${item.investigation.marketAtPublication.btcTrend}` : ""}
                    {item.investigation.marketAtPublication.fundingRate != null ? ` · funding ${item.investigation.marketAtPublication.fundingRate}` : ""}
                  </p>
                )}
              </li>
            ))}
        </ul>
        {!(payload?.investigation || []).length && <p className="mt-2 text-sm text-gray-500">No official records are stored yet. Nothing is invented for inspection.</p>}
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-[#111827] p-4">
        <h2 className="font-bold">Pre-launch compliance checklist</h2>
        {SIGNALS_COMPLIANCE_CHECKLIST.map((group) => (
          <div key={group.region} className="mt-3">
            <h3 className="text-sm font-semibold text-[#FBB03B]">{group.region}</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-300">
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function AdminReceipt({ id }: { id: string }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    let url = "";
    void signalsFetch(`/api/signals/payments/${id}/receipt`, user).then(async (response) => {
      if (!response.ok) {
        setError(`Receipt unavailable (${response.status}).`);
        return;
      }
      url = URL.createObjectURL(await response.blob());
      setSrc(url);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Receipt unavailable.");
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  if (error) return <p className="mt-2 text-xs text-rose-300">{error}</p>;
  if (!src) return <p className="mt-2 text-xs text-gray-500">Loading private receipt…</p>;
  return <img src={src} alt="Private EcoCash receipt preview" className="mt-2 max-h-40 rounded-lg border border-white/10" />;
}
