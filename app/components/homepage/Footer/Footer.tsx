"use client";

import Link from "next/link";
import { GuestAuthLink } from "../../GuestAuthPrompt";

const PIPPINWAY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it Works" },
];

const SUPPORT_LINKS = [
  { href: "/contact", label: "Help / Contact" },
  { href: "/safety", label: "Safety" },
  { href: "/posting-rules", label: "Posting Rules" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const MARKETPLACE_LINKS = [
  { href: "/", label: "Browse Listings" },
  { href: "/categories", label: "Categories" },
  { href: "/add-listing", label: "Post Ad", auth: true },
];

function FooterLinks({
  links,
}: {
  links: Array<{ href: string; label: string; auth?: boolean }>;
}) {
  return (
    <div className="flex flex-col gap-3 text-gray-400">
      {links.map((link) =>
        link.auth ? (
          <GuestAuthLink
            key={link.href + link.label}
            href={link.href}
            className="transition hover:text-[#FBB03B]"
          >
            {link.label}
          </GuestAuthLink>
        ) : (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="transition hover:text-[#FBB03B]"
          >
            {link.label}
          </Link>
        )
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-800 bg-[#020817] lg:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/images/logo.png"
              alt="Pippinway"
              className="mb-4 w-[180px] max-w-full sm:w-[220px]"
            />
            <p className="text-sm leading-7 text-gray-400">
              A classified marketplace for buying and selling locally. Listings
              are posted by independent users. Read safety guidance before you
              meet or pay.
            </p>
            <h3 className="mb-3 mt-6 text-lg font-bold text-white">Pippinway</h3>
            <FooterLinks links={PIPPINWAY_LINKS} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Support</h3>
            <FooterLinks links={SUPPORT_LINKS} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Legal</h3>
            <FooterLinks links={LEGAL_LINKS} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Marketplace</h3>
            <FooterLinks links={MARKETPLACE_LINKS} />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>© 2026 Pippinway.com — All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
