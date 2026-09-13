"use client";

import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { SALON_DEMO, SALON_NAV } from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A]";

export default function SalonNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#C9A07A]/15 bg-[#0B0A09]/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <a
          href="#top"
          className={`flex min-w-0 items-center gap-2 text-[#F3EBE0] ${FOCUS}`}
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9A07A]/40 text-[#C9A07A] md:h-9 md:w-9">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-base leading-tight tracking-tight md:text-lg">
              {SALON_DEMO.shortName}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A07A] md:block">
              Beauty Studio
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Salon">
          {SALON_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm text-[#E8DCC8]/80 transition hover:text-[#C9A07A] ${FOCUS}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#book"
            className={`inline-flex h-10 items-center rounded-full bg-[#C9A07A] px-4 text-sm font-semibold text-[#0B0A09] transition hover:bg-[#D4B08C] ${FOCUS}`}
          >
            Book
          </a>
        </nav>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#F3EBE0] lg:hidden ${FOCUS}`}
          aria-expanded={open}
          aria-controls="salon-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open ? (
        <div
          id="salon-mobile-nav"
          className="border-t border-[#C9A07A]/15 px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {SALON_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm text-[#F3EBE0] hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#C9A07A] text-sm font-semibold text-[#0B0A09]"
            >
              Book Now
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
