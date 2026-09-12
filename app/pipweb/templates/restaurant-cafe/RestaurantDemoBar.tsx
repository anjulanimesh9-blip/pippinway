"use client";

import Link from "next/link";
import { setSelectedPipWebTemplate } from "@/app/pipweb/data/templates";
import { RESTAURANT_DEMO } from "./content";

export default function RestaurantDemoBar() {
  return (
    <div className="sticky top-0 z-50 border-b border-[#d9c7a2]/20 bg-[#12100e]/95 text-[#f4ead8] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e8c36a]">
          Restaurant &amp; Cafe Website Demo
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href={RESTAURANT_DEMO.backHref}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#f4ead8]/15 px-3 text-xs font-semibold text-[#f4ead8] transition hover:border-[#e8c36a]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
          >
            Back to PipWeb
          </Link>
          <Link
            href={RESTAURANT_DEMO.chooseHref}
            onClick={() =>
              setSelectedPipWebTemplate({
                id: RESTAURANT_DEMO.id,
                name: RESTAURANT_DEMO.templateName,
              })
            }
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#c9a227] px-3 text-xs font-semibold text-[#1a1612] transition hover:bg-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
          >
            Choose This Design
          </Link>
        </div>
      </div>
    </div>
  );
}
