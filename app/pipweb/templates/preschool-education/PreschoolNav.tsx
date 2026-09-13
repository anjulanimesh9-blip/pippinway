"use client";

import { useState } from "react";
import { Menu, Sprout, X } from "lucide-react";
import { PRESCHOOL_DEMO, PRESCHOOL_NAV } from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E86AB]";

export default function PreschoolNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#D8E8F0] bg-[#FFF8F0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <a
          href="#top"
          className={`flex min-w-0 items-center gap-2 text-[#2F3A42] ${FOCUS}`}
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7CB68A] text-white md:h-9 md:w-9">
            <Sprout className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight tracking-tight md:text-base">
              {PRESCHOOL_DEMO.shortName}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2E86AB] md:block">
              Academy
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Preschool">
          {PRESCHOOL_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium text-[#5C6770] transition hover:text-[#2E86AB] ${FOCUS}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#enroll"
            className={`inline-flex h-10 items-center rounded-full bg-[#2E86AB] px-4 text-sm font-semibold text-white transition hover:bg-[#267394] ${FOCUS}`}
          >
            Enroll
          </a>
        </nav>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#2F3A42] lg:hidden ${FOCUS}`}
          aria-expanded={open}
          aria-controls="preschool-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open ? (
        <div
          id="preschool-mobile-nav"
          className="border-t border-[#D8E8F0] px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {PRESCHOOL_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm text-[#2F3A42] hover:bg-[#EAF6FB]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#enroll"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#2E86AB] text-sm font-semibold text-white"
            >
              Enroll Now
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
