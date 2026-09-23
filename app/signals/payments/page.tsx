"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { signalsFetch } from "@/lib/signals/client";

type Row = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  transactionRef: string;
  paymentDate: string;
  createdAt: string;
  subscriptionExpires: string | null;
};

export default function SignalsPaymentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [plan, setPlan] = useState("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) return;
    void signalsFetch("/api/signals/payments", user).then(async (response) => {
      const body = await response.json();
      if (!response.ok) return;
      setRows(body.payments || []);
      setPlan(body.plan || "free");
      setExpiresAt(body.subscription?.expiresAt || null);
    });
  }, [user]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Payment history</h1>
        <p className="mt-1 text-sm text-slate-400">
          Current plan: {plan === "pro" ? "Pro" : "Free"}
          {expiresAt ? ` · expires ${new Date(expiresAt).toLocaleString()}` : ""}.
          Receipts are evidence only. They are not automatic verification.
        </p>
      </div>
      {!rows.length ? (
        <p className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-sm text-slate-400">No EcoCash requests yet. <Link href="/signals/pay" className="text-[#FBB03B]">Pay with EcoCash</Link></p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{row.transactionRef}</strong>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">{row.status.replace("_", " ")}</span>
              </div>
              <p className="mt-2 text-slate-400">${row.amount} {row.currency} · paid {row.paymentDate} · submitted {new Date(row.createdAt).toLocaleString()}</p>
              {row.subscriptionExpires && <p className="text-xs text-[#FBB03B]">Pro expiry {new Date(row.subscriptionExpires).toLocaleString()}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
