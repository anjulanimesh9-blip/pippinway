"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { ESTATE_DEMO } from "./content";

export default function EstateDemoBar() {
  return (
    <div className="border-b border-[#E8DFD2] bg-[#2C2A26] text-[#FAF8F4]">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-3 md:px-6 md:py-2.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4C4A8] md:text-[11px] md:tracking-[0.16em]">
          <span className="md:hidden">Website Demo</span>
          <span className="hidden md:inline">Real Estate Website Demo</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href={ESTATE_DEMO.backHref}
            aria-label="Back to PipWeb"
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/15 px-2 text-[11px] font-semibold text-[#FAF8F4] transition hover:border-[#D4C4A8]/50 md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to PipWeb</span>
          </Link>
          <Link
            href={ESTATE_DEMO.chooseHref}
            aria-label="Choose This Design"
            onClick={() =>
              setSelectedPipWebTemplate({
                id: ESTATE_DEMO.id,
                name: ESTATE_DEMO.templateName,
              })
            }
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#1F7A54] px-2 text-[11px] font-semibold text-white transition hover:bg-[#196348] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Choose</span>
            <span className="hidden md:inline">Choose This Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
