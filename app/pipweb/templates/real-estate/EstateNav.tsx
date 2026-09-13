"use client";

import { useState } from "react";
import { Home, Menu, X } from "lucide-react";
import { ESTATE_DEMO, ESTATE_NAV } from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A54]";

export default function EstateNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#E8DFD2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <a href="#top" className={`flex min-w-0 items-center gap-2 text-[#2C2A26] ${FOCUS}`}>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1F7A54] text-white md:h-9 md:w-9">
            <Home className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight tracking-tight md:text-base">
              {ESTATE_DEMO.shortName}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1F7A54] md:block">
              Properties
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Real estate">
          {ESTATE_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm text-[#6B6560] transition hover:text-[#1F7A54] ${FOCUS}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#viewing"
            className={`inline-flex h-10 items-center rounded-full bg-[#1F7A54] px-4 text-sm font-semibold text-white hover:bg-[#196348] ${FOCUS}`}
          >
            Book a Viewing
          </a>
        </nav>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#2C2A26] lg:hidden ${FOCUS}`}
          aria-expanded={open}
          aria-controls="estate-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open ? (
        <div id="estate-mobile-nav" className="border-t border-[#E8DFD2] px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {ESTATE_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm text-[#2C2A26] hover:bg-[#FAF8F4]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#viewing"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1F7A54] text-sm font-semibold text-white"
            >
              Book a Viewing
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
