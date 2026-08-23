"use client";

import Link from "next/link";

export default function RightSidebar() {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-[#1a1f2e] to-[#111827] p-5 text-white">
      <p className="text-xs font-bold tracking-wider text-yellow-400 uppercase">
        Your Trusted Marketplace
      </p>
      <h3 className="text-lg font-bold mt-2 leading-snug">
        List Locally, Sell Globally
      </h3>
      <p className="text-sm text-gray-400 mt-2">
        Join thousands of buyers &amp; sellers on Pippinway today.
      </p>
      <Link
        href="/featured-packages"
        className="mt-4 inline-block w-full rounded-xl border border-yellow-400/60 py-2.5 text-center text-sm font-bold text-yellow-300 hover:bg-yellow-400/10 transition"
      >
        Post Your Ad Now
      </Link>
    </div>
  );
}
