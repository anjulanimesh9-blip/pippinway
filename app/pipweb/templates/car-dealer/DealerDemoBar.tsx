"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { DEALER_DEMO } from "./content";

export default function DealerDemoBar() {
  return (
    <div className="border-b border-white/10 bg-[#0E1014] text-[#F5F7FA]">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-3 md:px-6 md:py-2.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#60A5FA] md:text-[11px] md:tracking-[0.16em]">
          <span className="md:hidden">Website Demo</span>
          <span className="hidden md:inline">Car Dealer Website Demo</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href={DEALER_DEMO.backHref}
            aria-label="Back to PipWeb"
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/15 px-2 text-[11px] font-semibold text-[#F5F7FA] transition hover:border-[#60A5FA]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to PipWeb</span>
          </Link>
          <Link
            href={DEALER_DEMO.chooseHref}
            aria-label="Choose This Design"
            onClick={() =>
              setSelectedPipWebTemplate({
                id: DEALER_DEMO.id,
                name: DEALER_DEMO.templateName,
              })
            }
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#3B82F6] px-2 text-[11px] font-semibold text-white transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] md:h-9 md:px-3 md:text-xs"
          >
            <span className="md:hidden">Choose</span>
            <span className="hidden md:inline">Choose This Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
