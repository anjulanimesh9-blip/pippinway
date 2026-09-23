"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import Footer from "@/app/components/homepage/Footer/Footer";
import "./signals.css";

const LINKS = [
  { href: "/signals", tab: "signals", label: "Signals" },
  { href: "/signals?tab=scanner", tab: "scanner", label: "Scanner" },
  { href: "/signals?tab=charts", tab: "charts", label: "Charts" },
  { href: "/signals?tab=patterns", tab: "patterns", label: "Patterns" },
  { href: "/signals/history", tab: "history", label: "History" },
  { href: "/signals/pay", tab: "subscription", label: "Subscription" },
];

function SignalsNav() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab") || "signals";

  return (
    <nav className="sticky top-0 z-30 flex flex-wrap gap-2 bg-[#050910]/95 py-2 backdrop-blur" aria-label="Signals">
      {LINKS.map((link) => {
        const onSignals = pathname === "/signals" || pathname === "/signals/";
        const active = link.href === "/signals/history"
          ? pathname.startsWith("/signals/history")
          : link.href === "/signals/pay"
            ? pathname.startsWith("/signals/pay") || pathname.startsWith("/signals/payments")
            : onSignals && tab === link.tab;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold ${
              active ? "bg-[#FBB03B] text-[#0B1220]" : "border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function SignalsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pw-signals min-h-screen overflow-x-hidden bg-[#050910] text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-[1600px] px-3 pb-32 pt-4 sm:px-5 lg:px-8">
        <Suspense fallback={<div className="h-12" />}>
          <SignalsNav />
        </Suspense>
        <div className="mt-5 max-w-full">{children}</div>
        <p className="mt-10 max-w-4xl text-xs leading-5 text-slate-500">
          Pippinway Signals is educational decision support. Futures trading can lose more than the planned stop.
          A price touch is not a brokerage-confirmed fill. Counts, prices and timestamps come from live market data
          and official records only. No win rate or profit is promised.
        </p>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
