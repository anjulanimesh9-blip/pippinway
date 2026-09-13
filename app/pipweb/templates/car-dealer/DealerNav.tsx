"use client";

import { useState } from "react";
import { Car, Menu, X } from "lucide-react";
import { DEALER_DEMO, DEALER_NAV } from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";

export default function DealerNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-[#0E1014]/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <a
          href="#top"
          className={`flex min-w-0 items-center gap-2 text-[#F5F7FA] ${FOCUS}`}
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6] text-white md:h-9 md:w-9">
            <Car className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight tracking-tight md:text-base">
              {DEALER_DEMO.shortName}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#60A5FA] md:block">
              Motors
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Dealership">
          {DEALER_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm text-white/70 transition hover:text-[#60A5FA] ${FOCUS}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#vehicles"
            className={`inline-flex h-10 items-center rounded-lg bg-[#3B82F6] px-4 text-sm font-semibold text-white transition hover:bg-[#2563EB] ${FOCUS}`}
          >
            View Cars
          </a>
        </nav>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#F5F7FA] lg:hidden ${FOCUS}`}
          aria-expanded={open}
          aria-controls="dealer-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open ? (
        <div
          id="dealer-mobile-nav"
          className="border-t border-white/10 px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {DEALER_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm text-[#F5F7FA] hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#vehicles"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-semibold text-white"
            >
              View Cars
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
