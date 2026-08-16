import {
  CheckCircle2,
  Heart,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react";

type StatsCardsProps = {
  totalAds: number;
  activeAds: number;
  soldAds: number;
  favorites: number;
  messages: number;
};

const CARDS = [
  {
    key: "total",
    label: "Total Ads",
    hint: "All listings",
    icon: Package,
    iconWrap: "bg-sky-500/15 text-sky-400",
  },
  {
    key: "active",
    label: "Active Ads",
    hint: "Live now",
    icon: CheckCircle2,
    iconWrap: "bg-emerald-500/15 text-emerald-400",
  },
  {
    key: "sold",
    label: "Sold Ads",
    hint: "Completed",
    icon: ShoppingBag,
    iconWrap: "bg-violet-500/15 text-violet-400",
  },
  {
    key: "favorites",
    label: "Favorites",
    hint: "Saved items",
    icon: Heart,
    iconWrap: "bg-rose-500/15 text-rose-400",
  },
  {
    key: "messages",
    label: "Messages",
    hint: "Total conversations",
    icon: MessageSquare,
    iconWrap: "bg-orange-500/15 text-orange-400",
  },
] as const;

export default function StatsCards({
  totalAds,
  activeAds,
  soldAds,
  favorites,
  messages,
}: StatsCardsProps) {
  const values = {
    total: totalAds,
    active: activeAds,
    sold: soldAds,
    favorites,
    messages,
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-white/8 bg-[#151A22] p-4"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.iconWrap}`}
            >
              <Icon size={18} />
            </div>
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-white">
              {values[card.key]}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">{card.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
