"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="mt-32 border-t border-gray-800 bg-[#020817]">
  <div className="max-w-7xl mx-auto px-4 py-14">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

      {/* Logo */}
      <div>
        <img
          src="/images/logo.png"
          className="w-[220px] mb-4"
        />

        <p className="text-gray-400 leading-7 text-xs md:text-lg">
          Buy, sell and explore products
          worldwide with Pippinway —
          trusted, fast and easy.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Quick Links
        </h3>

        <div className="flex flex-col gap-3 text-gray-400 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition">
          <Link href="/">
            Home
          </Link>

          <Link href="/add-listing">
            Add Listing
          </Link>

          <Link href="/profile">
            Profile
          </Link>

          <Link href="/login">
            Login
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Categories
        </h3>

        <div className="flex flex-row md:flex-col gap-3 text-gray-400">
          <span>Cars</span>
          <span>Property</span>
          <span>Electronics</span>
          <span>Jobs</span>
          <span>Fashion</span>
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Available Countries
        </h3>

        <div className="flex flex-wrap gap-2">
          {[
            "🇬🇧 UK",
            "🇺🇸 USA",
            "🇨🇦 Canada",
            "🇱🇰 Sri Lanka",
            "🇿🇼 Zimbabwe",
            "🇮🇳 India",
          ].map((country) => (
            <span
              key={country}
              className="bg-[#111827] border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs"
            >
              {country}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-lg">
      © 2026 Pippinway.com — All Rights Reserved
    </div>
  </div>
</footer>
    </>
  );
}