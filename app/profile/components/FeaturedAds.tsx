import Link from "next/link";

type FeaturedAdsProps = {
  featuredCredits: number;
};

export default function FeaturedAds({ featuredCredits }: FeaturedAdsProps) {
  return (
    <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#0f172a] to-[#111827] p-4 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-yellow-400">⭐ Featured Ads</h2>
          <p className="text-xs text-gray-400 mt-1">
            Use package credits to feature your approved listings instantly.
          </p>
          <p className="text-3xl font-bold text-yellow-300 mt-3">
            {featuredCredits} Remaining
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/featured-ads"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white text-center"
          >
            Manage Featured Ads
          </Link>
          <Link
            href="/featured-packages"
            className="rounded-xl border border-yellow-500/30 px-4 py-2 text-sm font-bold text-yellow-300 text-center"
          >
            Buy Package
          </Link>
        </div>
      </div>
    </div>
  );
}
