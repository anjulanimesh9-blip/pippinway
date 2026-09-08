"use client";

import Link from "next/link";
import { VIBE_PATHS } from "@/lib/vibe/constants";

export default function VibeHero({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#0f172a] ${
        compact ? "px-4 py-4 sm:px-6 sm:py-5" : "px-4 py-5 sm:px-8 sm:py-8"
      }`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FBB03B]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-3 text-lg opacity-50 sm:right-10 sm:text-2xl">✦</div>
      <div className="pointer-events-none absolute right-16 bottom-3 text-sm text-[#FBB03B]/70 sm:right-24">✧</div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">
        Community
      </p>
      <h1 className={`font-bold tracking-tight text-white ${compact ? "mt-1 text-2xl" : "mt-1 text-3xl sm:text-4xl"}`}>
        Pippinway Vibe ✨
      </h1>
      <p className="mt-1 text-sm font-medium text-gray-100 sm:text-base">
        Good Vibes. Brighter Days.
      </p>
      <p className="mt-1 text-xs text-gray-300 sm:text-sm">
        Share • Read • Connect • Discover
      </p>
      {!compact ? (
        <Link
          href={VIBE_PATHS.home}
          className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
        >
          Open the feed
        </Link>
      ) : null}
    </section>
  );
}
