"use client";

import Link from "next/link";
import { Gift, MessageSquare, Package, Settings, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type ProfileQuickActionsProps = {
  onMessages: () => void;
};

const CARD =
  "flex min-h-[72px] flex-col items-start justify-center gap-1 rounded-xl border border-white/8 bg-[#151A22] px-4 py-3 text-left transition hover:border-sky-500/40 hover:bg-[#1b2230]";

export default function ProfileQuickActions({
  onMessages,
}: ProfileQuickActionsProps) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Link href="/profile/listings" className={`${CARD} border-sky-500/30`}>
        <Package size={16} className="text-sky-400" />
        <span className="text-sm font-semibold text-white">{t("profile.myListings")}</span>
      </Link>

      <Link href="/rewards" className={CARD}>
        <Gift size={16} className="text-[#FBB03B]" />
        <span className="text-sm font-semibold text-white">{t("profile.rewards")}</span>
      </Link>

      <Link href="/featured-ads" className={CARD}>
        <Star size={16} className="text-[#FBB03B]" />
        <span className="text-sm font-semibold text-white">{t("profile.featuredCredits")}</span>
      </Link>

      <button type="button" onClick={onMessages} className={CARD}>
        <MessageSquare size={16} className="text-cyan-400" />
        <span className="text-sm font-semibold text-white">{t("profile.messages")}</span>
      </button>

      <Link href="/profile/settings" className={CARD}>
        <Settings size={16} className="text-gray-300" />
        <span className="text-sm font-semibold text-white">{t("profile.settings")}</span>
      </Link>
    </div>
  );
}
