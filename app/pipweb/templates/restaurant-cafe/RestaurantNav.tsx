"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { RESTAURANT_DEMO, RESTAURANT_NAV } from "./content";

export default function RestaurantNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-[52px] z-40 border-b border-[#d9c7a2]/10 bg-[#1a1612]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="font-serif text-lg tracking-tight text-[#f4ead8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
        >
          {RESTAURANT_DEMO.name}
        </a>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Restaurant">
          {RESTAURANT_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-[#efe4d0]/80 transition hover:text-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#reserve"
            className="inline-flex h-10 items-center rounded-lg bg-[#c9a227] px-4 text-sm font-semibold text-[#1a1612] transition hover:bg-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
          >
            Reserve
          </a>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#f4ead8] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
          aria-expanded={open}
          aria-controls="restaurant-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open ? (
        <div
          id="restaurant-mobile-nav"
          className="border-t border-[#d9c7a2]/10 px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {RESTAURANT_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm text-[#efe4d0] hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#reserve"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#c9a227] text-sm font-semibold text-[#1a1612]"
            >
              Reserve
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
