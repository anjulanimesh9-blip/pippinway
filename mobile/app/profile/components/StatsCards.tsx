import {
  FaBoxOpen,
  FaStar,
  FaHeart,
  FaComments,
} from "react-icons/fa";

type StatsCardsProps = {
  totalAds: number;
  featuredUsed: number;
  featuredCredits: number;
  favorites: number;
  unreadMessages: number;
};

export default function StatsCards({
  totalAds,
  featuredUsed,
  featuredCredits,
  favorites,
  unreadMessages,
}: StatsCardsProps) {
  const card =
    "rounded-xl border border-white/10 bg-[#0f172a] p-4 shadow-lg transition hover:border-cyan-500/30";

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

      {/* Total Ads */}
      <div className={card}>
        <div className="flex items-center gap-2 text-gray-400">
          <FaBoxOpen className="text-orange-400 text-sm" />
          <span className="text-sm">Total Ads</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold text-white">
          {totalAds}
        </h2>
      </div>

      {/* Featured */}
      <div className={card}>
        <div className="flex items-center gap-2 text-gray-400">
          <FaStar className="text-yellow-400 text-sm" />
          <span className="text-sm">Featured</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold text-yellow-400">
          {featuredUsed}
          <span className="text-lg text-gray-500">
            {" "}
            / {featuredCredits}
          </span>
        </h2>
      </div>

      {/* Favorites */}
      <div className={card}>
        <div className="flex items-center gap-2 text-gray-400">
          <FaHeart className="text-red-500 text-sm" />
          <span className="text-sm">Favorites</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold text-white">
          {favorites}
        </h2>
      </div>

      {/* Messages */}
      <div className={card}>
        <div className="flex items-center gap-2 text-gray-400">
          <FaComments className="text-cyan-400 text-sm" />
          <span className="text-sm">Messages</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold text-white">
          {unreadMessages}
        </h2>
      </div>

    </div>
  );
}