"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Plus,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { GuestAuthLink } from "./GuestAuthPrompt";
import PostChooserSheet from "./PostChooserSheet";
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
  const [chooserOpen, setChooserOpen] = useState(false);
  const marketplaceActive = pathname === marketplaceHome;

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[11px] transition ${
      active ? "text-[#FBB03B]" : "text-gray-400"
    }`;

  return (
    <>
    <nav className="pw-nav-mobile fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B1220]/95 backdrop-blur-xl lg:hidden">
      <div className="grid h-16 grid-cols-5">
        <Link href="/#choose-country" className={itemClass(marketplaceActive)}>
          <Store className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.marketplace")}
        </Link>

        <Link
          href="/vibe"
          className={itemClass(pathname.startsWith("/vibe"))}
        >
          <Sparkles className="h-5 w-5" strokeWidth={1.8} />
          {t("nav.vibe")}
        </Link>

        <button
          type="button"
          aria-label="Create a post"
          aria-expanded={chooserOpen}
          className="flex items-center justify-center"
          onClick={() => setChooserOpen(true)}
        >
          <div className="flex h-14 w-14 -mt-8 items-center justify-center rounded-full border-4 border-[#020817] bg-[#FBB03B] text-[#0B1220] shadow-xl">
            <Plus className="h-7 w-7" strokeWidth={2.4} />
          </div>
        </button>

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
    <PostChooserSheet
      open={chooserOpen}
      onClose={() => setChooserOpen(false)}
      addListingHref={addListingHref}
    />
    </>
  );
}
