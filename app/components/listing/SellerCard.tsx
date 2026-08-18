"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";

type SellerCardProps = {
  uid?: string;
  name?: string;
  phone?: string;
  location?: string;
};

export default function SellerCard({ uid, name, location }: SellerCardProps) {
  const displayName = name || "Private Seller";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBB03B] text-lg font-bold text-black">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-white">{displayName}</h3>
            <BadgeCheck size={16} className="shrink-0 text-sky-400" />
          </div>
          <p className="text-xs text-gray-400">Member</p>
          {location && (
            <p className="mt-0.5 truncate text-xs text-gray-500">{location}</p>
          )}
        </div>
      </div>

      {uid && (
        <Link
          href={`/seller/${uid}`}
          className="mt-3 block text-sm font-semibold text-sky-400 hover:underline"
        >
          View seller shop
        </Link>
      )}
    </div>
  );
}
