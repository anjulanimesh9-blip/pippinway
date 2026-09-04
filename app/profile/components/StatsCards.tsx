"use client";

import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type StatsCardsProps = {
  totalAds: number;
  activeAds: number;
  soldAds: number | null;
  favorites: number | null;
  messages: number;
  isAdmin?: boolean;
  totalUsers?: number | null;
  listingsLoaded?: boolean;
  countsReady?: boolean;
};

export default function StatsCards({
  totalAds,
  activeAds,
  soldAds,
  favorites,
  messages,
  isAdmin = false,
  totalUsers = null,
  listingsLoaded = false,
  countsReady = false,
}: StatsCardsProps) {
  const { t } = useI18n();
  const items = [
    ...(isAdmin
      ? [{ label: t("profile.users"), value: totalUsers ?? "—" }]
      : []),
    { label: t("common.ads"), value: countsReady ? totalAds : "—" },
    { label: t("profile.active"), value: listingsLoaded ? activeAds : "—" },
    { label: t("profile.sold"), value: soldAds == null ? "—" : soldAds },
    { label: t("profile.saved"), value: favorites == null ? "—" : favorites },
    { label: t("profile.chats"), value: messages },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-[72px] items-baseline gap-1.5 rounded-lg border border-white/8 bg-[#151A22] px-2.5 py-1.5"
        >
          {item.label === t("profile.users") && (
            <Users size={12} className="text-cyan-400" />
          )}
          <span className="text-sm font-extrabold text-white">{item.value}</span>
          <span className="text-[11px] text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
