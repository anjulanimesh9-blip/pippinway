"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { RESTAURANT_DEMO } from "./content";

export default function RestaurantDemoBar() {
  return (
    <div className="border-b border-[#d9c7a2]/20 bg-[#12100e]/95 text-[#f4ead8] backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-3 md:px-6 md:py-2.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8c36a] md:text-[11px] md:tracking-[0.16em]">
          <span className="md:hidden">Website Demo</span>
          <span className="hidden md:inline">Restaurant &amp; Cafe Website Demo</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href={RESTAURANT_DEMO.backHref}
            aria-label="Back to PipWeb"
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#f4ead8]/15 px-2 text-[11px] font-semibold text-[#f4ead8] transition hover:border-[#e8c36a]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to PipWeb</span>
          </Link>
          <Link
            href={RESTAURANT_DEMO.chooseHref}
            aria-label="Choose This Design"
            onClick={() =>
              setSelectedPipWebTemplate({
                id: RESTAURANT_DEMO.id,
                name: RESTAURANT_DEMO.templateName,
              })
            }
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#c9a227] px-2 text-[11px] font-semibold text-[#1a1612] transition hover:bg-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Choose</span>
            <span className="hidden md:inline">Choose This Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
