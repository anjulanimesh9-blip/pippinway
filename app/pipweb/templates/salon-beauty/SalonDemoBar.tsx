"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { SALON_DEMO } from "./content";

export default function SalonDemoBar() {
  return (
    <div className="border-b border-[#C9A07A]/20 bg-[#0B0A09] text-[#F3EBE0]">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-3 md:px-6 md:py-2.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9A07A] md:text-[11px] md:tracking-[0.16em]">
          <span className="md:hidden">Website Demo</span>
          <span className="hidden md:inline">Salon &amp; Beauty Website Demo</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href={SALON_DEMO.backHref}
            aria-label="Back to PipWeb"
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#F3EBE0]/20 px-2 text-[11px] font-semibold text-[#F3EBE0] transition hover:border-[#C9A07A]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to PipWeb</span>
          </Link>
          <Link
            href={SALON_DEMO.chooseHref}
            aria-label="Choose This Design"
            onClick={() =>
              setSelectedPipWebTemplate({
                id: SALON_DEMO.id,
                name: SALON_DEMO.templateName,
              })
            }
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#C9A07A] px-2 text-[11px] font-semibold text-[#0B0A09] transition hover:bg-[#D4B08C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Choose</span>
            <span className="hidden md:inline">Choose This Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
