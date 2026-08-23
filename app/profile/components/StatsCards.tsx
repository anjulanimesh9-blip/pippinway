import {
  CheckCircle2,
  Heart,
  MessageSquare,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

type StatsCardsProps = {
  totalAds: number;
  activeAds: number;
  soldAds: number;
  favorites: number;
  messages: number;
  isAdmin?: boolean;
  totalUsers?: number | null;
};

const USER_CARD = {
  key: "users",
  label: "Total Users",
  hint: "Registered",
  icon: Users,
  iconWrap: "bg-cyan-500/15 text-cyan-400",
} as const;

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
  isAdmin = false,
  totalUsers = null,
}: StatsCardsProps) {
  const values = {
    users: totalUsers ?? "—",
    total: totalAds,
    active: activeAds,
    sold: soldAds,
    favorites,
    messages,
  };

  const cards = isAdmin ? [USER_CARD, ...CARDS] : CARDS;

  return (
    <div
      className={`grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 ${
        isAdmin ? "xl:grid-cols-6" : "xl:grid-cols-5"
      }`}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-white/8 bg-[#151A22] px-2.5 py-2 sm:px-3 sm:py-2.5"
          >
            <div
              className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-2 sm:h-8 sm:w-8 ${card.iconWrap}`}
            >
              <Icon size={14} />
            </div>
            <p className="text-[11px] text-gray-400">{card.label}</p>
            <p className="mt-0.5 text-lg font-extrabold leading-tight text-white sm:text-xl">
              {values[card.key]}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">{card.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
