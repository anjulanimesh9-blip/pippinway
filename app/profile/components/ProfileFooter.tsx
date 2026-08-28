"use client";

import Link from "next/link";
import { FaFacebookF } from "react-icons/fa6";

export default function ProfileFooter() {
  return (
    <footer className="mt-10 border-t border-white/8 bg-[#0B0E14]">
      <div className="flex flex-col gap-4 px-4 py-5 text-sm text-gray-400 md:flex-row md:items-center md:justify-between lg:px-6">
        <p>© 2026 Pippinway.com — All Rights Reserved</p>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/about" className="hover:text-white">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact / Help
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/safety" className="hover:text-white">
            Safety
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <a
              href="https://www.facebook.com/profile.php?id=61589186823471"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:text-white"
              aria-label="Facebook"
            >
              <FaFacebookF size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
