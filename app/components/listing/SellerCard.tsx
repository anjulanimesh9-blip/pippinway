"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type SellerCardProps = {
  uid?: string;
  name?: string;
  phone?: string;
  location?: string;
};

export default function SellerCard({ uid, name, location }: SellerCardProps) {
  const { t } = useI18n();
  const displayName = name || t("listing.privateSeller");
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
          </div>
          <p className="text-xs text-gray-400">{t("common.member")}</p>
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
          {t("listing.viewShop")}
        </Link>
      )}
    </div>
  );
}
