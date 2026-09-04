"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  MessageCircle,
  Plus,
  User,
} from "lucide-react";
import { GuestAuthLink } from "./GuestAuthPrompt";
import useCountryNavigation from "../hooks/useCountryNavigation";
import { useI18n } from "@/lib/i18n";

interface MobileBottomNavProps {
  unreadCount?: number;
}

export default function MobileBottomNav({
  unreadCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { marketplaceHome, addListingHref } = useCountryNavigation();
  const { t } = useI18n();
  const homeActive =
    pathname === marketplaceHome ||
    (marketplaceHome !== "/" && pathname === marketplaceHome);

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[11px] transition ${
      active ? "text-[#FBB03B]" : "text-gray-400"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B1220]/95 backdrop-blur-xl lg:hidden">
      <div className="grid h-16 grid-cols-5">
        <Link href={marketplaceHome} className={itemClass(homeActive)}>
          <Home className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.home")}
        </Link>

        <Link
          href="/categories"
          className={itemClass(pathname.startsWith("/categories"))}
        >
          <LayoutGrid className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.categories")}
        </Link>

        <GuestAuthLink
          href={addListingHref}
          className="flex items-center justify-center"
        >
          <div className="flex h-14 w-14 -mt-8 items-center justify-center rounded-full border-4 border-[#020817] bg-[#FBB03B] text-[#0B1220] shadow-xl">
            <Plus className="h-7 w-7" strokeWidth={2.4} />
          </div>
        </GuestAuthLink>

        <GuestAuthLink
          href="/messages"
          className={`relative ${itemClass(pathname.startsWith("/messages"))}`}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.chat")}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-3 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </GuestAuthLink>

        <GuestAuthLink
          href="/profile"
          className={itemClass(pathname.startsWith("/profile"))}
        >
          <User className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.profile")}
        </GuestAuthLink>
      </div>
    </nav>
  );
}
