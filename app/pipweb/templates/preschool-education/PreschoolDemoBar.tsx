"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { PRESCHOOL_DEMO } from "./content";

export default function PreschoolDemoBar() {
  return (
    <div className="border-b border-[#2EB5D6]/20 bg-[#1E9BC0] text-white">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-3 md:px-6 md:py-2.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 md:text-[11px] md:tracking-[0.16em]">
          <span className="md:hidden">Website Demo</span>
          <span className="hidden md:inline">Preschool &amp; Education Website Demo</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href={PRESCHOOL_DEMO.backHref}
            aria-label="Back to PipWeb"
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/25 px-2 text-[11px] font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to PipWeb</span>
          </Link>
          <Link
            href={PRESCHOOL_DEMO.chooseHref}
            aria-label="Choose This Design"
            onClick={() =>
              setSelectedPipWebTemplate({
                id: PRESCHOOL_DEMO.id,
                name: PRESCHOOL_DEMO.templateName,
              })
            }
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#F4C44A] px-2 text-[11px] font-semibold text-[#2F3A42] transition hover:bg-[#F7D36A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Choose</span>
            <span className="hidden md:inline">Choose This Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
