"use client";

import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact / Help" },
  { href: "/add-listing", label: "Add Listing" },
  { href: "/login", label: "Login" },
];

const CATEGORIES = [
  { href: "/?category=Cars", label: "Cars" },
  { href: "/?category=Property", label: "Property" },
  { href: "/?category=Electronics", label: "Electronics" },
  { href: "/?category=Jobs", label: "Jobs" },
  { href: "/?category=Fashion", label: "Fashion" },
];

const COUNTRIES = [
  "🇬🇧 UK",
  "🇺🇸 USA",
  "🇨🇦 Canada",
  "🇱🇰 Sri Lanka",
  "🇿🇼 Zimbabwe",
  "🇮🇳 India",
];

const LEGAL_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact / Help" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-gray-800 bg-[#020817]">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/images/logo.png"
              alt="Pippinway"
              className="mb-4 w-[220px]"
            />
            <p className="text-xs leading-7 text-gray-400 md:text-lg">
              Buy, sell and explore products worldwide with Pippinway —
              trusted, fast and easy.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <div className="flex flex-col gap-3 text-gray-400">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="transition hover:text-[#FBB03B]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Categories</h3>
            <div className="flex flex-row gap-3 text-gray-400 md:flex-col">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="transition hover:text-[#FBB03B]"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Available Countries
            </h3>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <span
                  key={country}
                  className="rounded-xl border border-gray-700 bg-[#111827] px-3 py-2 text-xs text-gray-300"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-800 pt-6 text-center text-gray-400">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#FBB03B]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm md:text-lg">
            © 2026 Pippinway.com — All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
