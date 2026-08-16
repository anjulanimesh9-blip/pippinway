"use client";

import Link from "next/link";

export default function RightSidebar() {
  return (
    <div className="space-y-5">

      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">
          Promote Your Ad
        </h3>

        <p className="text-sm opacity-90 mb-5">
          Get more views and sell faster.
        </p>

        <Link
          href="/boost-ad"
          className="inline-block bg-white text-violet-700 font-bold px-5 py-3 rounded-xl"
        >
          Boost Ad 🚀
        </Link>
      </div>

      <div className="rounded-2xl bg-[#111827] border border-white/10 p-5">
        <h3 className="text-xl font-bold text-white mb-3">
          Safety Tips
        </h3>

        <ul className="text-sm text-gray-300 space-y-2">
          <li>✔ Meet in public places</li>
          <li>✔ Inspect before paying</li>
          <li>✔ Never share OTP codes</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-[#111827] border border-white/10 p-5">
        <h3 className="text-xl font-bold text-white mb-3">
          Pippinway App
        </h3>

        <p className="text-sm text-gray-300">
          Download our mobile app soon.
        </p>
      </div>

    </div>
  );
}