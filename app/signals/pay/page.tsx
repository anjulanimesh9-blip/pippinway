"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { signalsFetch } from "@/lib/signals/client";

type PaymentConfig = {
  proPriceMonthly: number;
  currency: string;
  subscriptionDays: number;
  ecocashRecipientNumber: string;
  ecocashRecipientName: string;
  ecocashInstructions: string;
};

export default function SignalsPayPage() {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) return;
    void signalsFetch("/api/signals/payments", user).then(async (response) => {
      const body = await response.json();
      if (response.ok) {
        setConfig(body.config);
        const open = (body.payments || []).find((item: { status: string }) => item.status === "PENDING" || item.status === "NEEDS_REVIEW");
        if (open) setStatus(open.status === "NEEDS_REVIEW" ? "Needs review" : "Pending Verification");
      }
    });
  }, [user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await signalsFetch("/api/signals/payments", user, { method: "POST", body: form });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Payment request failed.");
      return;
    }
    setStatus("Pending Verification");
    setMessage(body.note);
    event.currentTarget.reset();
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
        <h2 className="text-xl font-bold">Pay with EcoCash</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to submit a Pro payment request.</p>
        <Link href="/login?returnUrl=/signals/pay" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220]">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-3xl border border-[#FBB03B]/30 bg-[#0B1220] p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#FBB03B]">Pippinway Signals Pro</p>
        <h1 className="mt-2 text-2xl font-bold">EcoCash payment request</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pay outside the website, then upload your receipt. A screenshot is not automatic proof of payment. Pro activates only after an admin verifies the EcoCash funds.
        </p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-3"><dt className="text-slate-500">Plan</dt><dd className="font-semibold">Signals Pro</dd></div>
          <div className="rounded-xl bg-white/5 p-3"><dt className="text-slate-500">Price</dt><dd className="font-semibold">${config?.proPriceMonthly ?? 4.99} {config?.currency || "USD"} / month</dd></div>
          <div className="rounded-xl bg-white/5 p-3"><dt className="text-slate-500">Recipient name</dt><dd className="font-semibold">{config?.ecocashRecipientName || "Not configured yet"}</dd></div>
          <div className="rounded-xl bg-white/5 p-3"><dt className="text-slate-500">EcoCash number</dt><dd className="font-semibold">{config?.ecocashRecipientNumber || "Admin must set this number"}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-slate-300">{config?.ecocashInstructions}</p>
        <p className="mt-3 text-xs text-slate-500">Use your Pippinway email or UID as the payment reference so the admin can match the transfer. Duration is {config?.subscriptionDays || 30} days after approval. Renewal is not automatic.</p>
        {status && <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">Status: {status}</p>}
      </section>
      <form onSubmit={(event) => void submit(event)} className="space-y-3 rounded-3xl border border-white/10 bg-[#0B1220] p-6">
        <h2 className="font-bold">Upload payment evidence</h2>
        <label className="block text-sm">Transaction reference
          <input name="transactionRef" required minLength={6} className="mt-1 w-full rounded-xl bg-[#050910] px-3 py-2" />
        </label>
        <label className="block text-sm">Amount paid
          <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={config?.proPriceMonthly ?? 4.99} className="mt-1 w-full rounded-xl bg-[#050910] px-3 py-2" />
        </label>
        <label className="block text-sm">Payment date
          <input name="paymentDate" type="date" required className="mt-1 w-full rounded-xl bg-[#050910] px-3 py-2" />
        </label>
        <label className="block text-sm">Sender phone <span className="text-slate-500">(optional)</span>
          <input name="senderPhone" className="mt-1 w-full rounded-xl bg-[#050910] px-3 py-2" />
        </label>
        <label className="block text-sm">Notes <span className="text-slate-500">(optional)</span>
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-xl bg-[#050910] px-3 py-2" />
        </label>
        <label className="block text-sm">Receipt screenshot (JPEG, PNG or WebP, max 5MB)
          <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-1 w-full text-sm" />
        </label>
        <button type="submit" disabled={pending || !config?.ecocashRecipientNumber} className="min-h-11 w-full rounded-full bg-[#FBB03B] font-bold text-[#0B1220] disabled:opacity-50">
          {pending ? "Submitting…" : "Submit for verification"}
        </button>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {message && <p className="text-sm text-emerald-300">{message}</p>}
        <Link href="/signals/payments" className="block text-center text-sm text-[#FBB03B]">View payment history</Link>
      </form>
    </div>
  );
}
