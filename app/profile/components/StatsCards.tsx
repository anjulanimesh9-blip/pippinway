import { Users } from "lucide-react";

type StatsCardsProps = {
  totalAds: number;
  activeAds: number;
  soldAds: number;
  favorites: number;
  messages: number;
  isAdmin?: boolean;
  totalUsers?: number | null;
  listingsLoading?: boolean;
};

export default function StatsCards({
  totalAds,
  activeAds,
  soldAds,
  favorites,
  messages,
  isAdmin = false,
  totalUsers = null,
  listingsLoading = false,
}: StatsCardsProps) {
  const adsValue = listingsLoading && totalAds === 0 ? "—" : totalAds;
  const activeValue = listingsLoading && totalAds === 0 ? "—" : activeAds;
  const soldValue = listingsLoading && totalAds === 0 ? "—" : soldAds;

  const items = [
    ...(isAdmin
      ? [{ label: "Users", value: totalUsers ?? "—" }]
      : []),
    { label: "Ads", value: adsValue },
    { label: "Active", value: activeValue },
    { label: "Sold", value: soldValue },
    { label: "Saved", value: favorites },
    { label: "Chats", value: messages },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-[72px] items-baseline gap-1.5 rounded-lg border border-white/8 bg-[#151A22] px-2.5 py-1.5"
        >
          {item.label === "Users" && (
            <Users size={12} className="text-cyan-400" />
          )}
          <span className="text-sm font-extrabold text-white">{item.value}</span>
          <span className="text-[11px] text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
