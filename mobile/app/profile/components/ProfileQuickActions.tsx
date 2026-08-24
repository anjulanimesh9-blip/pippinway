"use client";

import Link from "next/link";
import { Gift, MessageSquare, Package, Settings, Star } from "lucide-react";

type ProfileQuickActionsProps = {
  onMessages: () => void;
};

const CARD =
  "flex min-h-[72px] flex-col items-start justify-center gap-1 rounded-xl border border-white/8 bg-[#151A22] px-4 py-3 text-left transition hover:border-sky-500/40 hover:bg-[#1b2230]";

export default function ProfileQuickActions({
  onMessages,
}: ProfileQuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Link href="/profile/listings" className={`${CARD} border-sky-500/30`}>
        <Package size={16} className="text-sky-400" />
        <span className="text-sm font-semibold text-white">My Listings</span>
      </Link>

      <Link href="/rewards" className={CARD}>
        <Gift size={16} className="text-[#FBB03B]" />
        <span className="text-sm font-semibold text-white">Rewards</span>
      </Link>

      <Link href="/featured-ads" className={CARD}>
        <Star size={16} className="text-[#FBB03B]" />
        <span className="text-sm font-semibold text-white">Featured Credits</span>
      </Link>

      <button type="button" onClick={onMessages} className={CARD}>
        <MessageSquare size={16} className="text-cyan-400" />
        <span className="text-sm font-semibold text-white">Messages</span>
      </button>

      <Link href="/profile/settings" className={CARD}>
        <Settings size={16} className="text-gray-300" />
        <span className="text-sm font-semibold text-white">Settings</span>
      </Link>
    </div>
  );
}
