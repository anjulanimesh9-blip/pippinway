import { Users } from "lucide-react";

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
  const items = [
    ...(isAdmin
      ? [{ label: "Users", value: totalUsers ?? "—" }]
      : []),
    { label: "Ads", value: countsReady ? totalAds : "—" },
    { label: "Active", value: listingsLoaded ? activeAds : "—" },
    { label: "Sold", value: soldAds == null ? "—" : soldAds },
    { label: "Saved", value: favorites == null ? "—" : favorites },
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
