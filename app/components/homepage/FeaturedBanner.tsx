"use client";

import Link from "next/link";

export default function FeaturedBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#4f46e5] p-6 shadow-xl">

      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">

        <div className="flex-1">

          <span className="inline-flex items-center rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
            ⭐ FEATURED ADS
          </span>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Get More Views. Sell Faster.
          </h2>

          <p className="mt-2 max-w-md text-blue-100">
            Upgrade your listing to Featured and appear at the top of search
            results to reach more buyers.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/featured-ads"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-gray-100"
            >
              Manage Featured Ads
            </Link>

            <Link
              href="/featured-packages"
              className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Buy Package
            </Link>
          </div>

        </div>

        <div className="hidden md:flex items-center justify-center text-7xl">
          ⭐
        </div>

      </div>
    </section>
  );
}