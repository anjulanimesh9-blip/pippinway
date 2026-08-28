"use client";

import { GuestAuthLink } from "../GuestAuthPrompt";

export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#5b21b6] via-[#4c1d95] to-[#312e81] p-5 shadow-xl">

      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full" />

      <div className="relative flex items-center justify-between gap-4">

        <div className="flex-1">

          <span className="inline-flex bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold">
            📢 SPONSORED
          </span>

          <h2 className="text-white text-2xl font-bold mt-3">
            Promote Your Business
          </h2>

          <p className="text-purple-100 mt-2">
            Reach thousands of buyers across Pippinway with featured ads.
          </p>

          <div className="flex gap-3 mt-5">

            <GuestAuthLink
              href="/add-listing"
              className="bg-white text-purple-700 font-semibold px-5 py-3 rounded-xl"
            >
              ➕ Post Free Ad
            </GuestAuthLink>

            <button className="border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/10 transition">
              Learn More
            </button>

          </div>

        </div>

        <div className="hidden sm:flex text-7xl">
          📣
        </div>

      </div>
    </section>
  );
}