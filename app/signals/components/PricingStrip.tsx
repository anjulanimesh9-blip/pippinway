"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import { signalsFetch } from "@/lib/signals/client";

export default function PricingStrip() {
  const [price, setPrice] = useState(4.99);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);

  useEffect(() => {
    void fetch("/api/signals/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => {
        if (typeof body.proPriceMonthly === "number") setPrice(body.proPriceMonthly);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    if (!user) {
      setPlan(null);
      return;
    }
    void signalsFetch("/api/signals/prices", user).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json();
      if (body.plan === "pro" || body.plan === "free") setPlan(body.plan);
    });
  }), []);

  return (
    <section id="plans" className="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">
      <article className="rounded-3xl border border-white/10 bg-[#0B1220] p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Free Plan</p>
        <p className="mt-2 text-4xl font-extrabold">$0</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {["Live market overview", "4 complete signals per UTC day", "Educational pattern labels", "15-coin scanner"].map((item) => (
            <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{item}</li>
          ))}
        </ul>
        <Link href="/signals#live-signals" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm font-semibold">
          {plan === "free" ? "Current Plan" : "Open free scanner"}
        </Link>
      </article>
      <article className="rounded-3xl border border-[#FBB03B]/50 bg-[#0B1220] p-6 shadow-[0_0_40px_rgba(251,176,59,0.12)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-[#FBB03B]">Pro Plan</p>
          <span className="rounded-full bg-[#FBB03B] px-2 py-0.5 text-[10px] font-bold text-[#0B1220]">Most Popular</span>
        </div>
        <p className="mt-2 text-4xl font-extrabold">${price}<span className="text-base font-medium text-slate-400"> / month</span></p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {["All available signals", "50 / 100 / All Coins scanners", "Advanced analysis and history", "No daily reveal limit"].map((item) => (
            <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FBB03B]" />{item}</li>
          ))}
        </ul>
        {plan === "pro" ? (
          <p className="mt-6 min-h-11 rounded-full bg-white/10 text-center text-sm font-semibold leading-[44px] text-slate-300">Pro active</p>
        ) : (
          <Link href="/signals/pay" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#FBB03B] text-sm font-bold text-[#0B1220]">
            Pay with EcoCash
          </Link>
        )}
        <p className="mt-2 text-[11px] text-slate-500">Card checkout stays disabled. EcoCash is reviewed by an admin. A receipt is not automatic verification. Pro does not promise profits.</p>
      </article>
      <article className="relative overflow-hidden rounded-3xl border border-[#FBB03B]/20 min-h-[220px]">
        <Image src="/signals/devices.png" alt="Laptop and phone showing candlestick charts, decorative artwork only" fill quality={70} sizes="(max-width: 1024px) 100vw, 360px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold">Trade with Confidence</p>
          <p className="mt-1 text-xs text-slate-300">Real insights. Real opportunities. Manual signals only.</p>
        </div>
      </article>
    </section>
  );
}
