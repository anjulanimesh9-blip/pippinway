"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GuestAuthLink } from "./GuestAuthPrompt";
import useCountryNavigation from "../hooks/useCountryNavigation";

interface MobileBottomNavProps {
  unreadCount?: number;
}

export default function MobileBottomNav({
  unreadCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { marketplaceHome, addListingHref } = useCountryNavigation();
  const homeActive =
    pathname === marketplaceHome ||
    (marketplaceHome !== "/" && pathname === marketplaceHome);

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center text-xs transition ${
      active ? "text-violet-500" : "text-gray-400"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0B1220] border-t border-white/10 backdrop-blur-xl">
      <div className="grid grid-cols-5 h-16">

        <Link href={marketplaceHome} className={itemClass(homeActive)}>
          <span className="text-2xl">🏠</span>
          Home
        </Link>

        <Link
          href="/categories"
          className={itemClass(pathname.startsWith("/categories"))}
        >
          <span className="text-2xl">📂</span>
          Categories
        </Link>

        <GuestAuthLink
          href={addListingHref}
          className="flex items-center justify-center"
        >
          <div className="w-14 h-14 -mt-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl shadow-xl border-4 border-[#020817]">
            +
          </div>
        </GuestAuthLink>

        <GuestAuthLink
          href="/messages"
          className={`relative ${itemClass(
            pathname.startsWith("/messages")
          )}`}
        >
          <span className="text-2xl">💬</span>
          Chat

          {unreadCount > 0 && (
            <span className="absolute top-1 right-3 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px]">
              {unreadCount}
            </span>
          )}
        </GuestAuthLink>

        <GuestAuthLink
          href="/profile"
          className={itemClass(pathname.startsWith("/profile"))}
        >
          <span className="text-2xl">👤</span>
          Profile
        </GuestAuthLink>

      </div>
    </nav>
  );
}