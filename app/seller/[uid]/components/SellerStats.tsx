"use client";

interface SellerStatsProps {
  totalListings: number;
  membership?: string;
  verifiedSeller?: boolean;
  featuredAds?: number;
}

export default function SellerStats({
  totalListings,
  membership,
  verifiedSeller,
  featuredAds = 0,
}: SellerStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

      {/* Active Listings */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-center transition hover:border-blue-500">
        <div className="mb-3 text-4xl">📦</div>

        <h3 className="text-sm text-slate-400">
          Active Listings
        </h3>

        <p className="mt-2 text-4xl font-bold text-blue-400">
          {totalListings}
        </p>
      </div>

      {/* Membership */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-center transition hover:border-yellow-500">
        <div className="mb-3 text-4xl">
          {membership === "pro" ? "👑" : "🆓"}
        </div>

        <h3 className="text-sm text-slate-400">
          Membership
        </h3>

        <p className="mt-2 text-xl font-semibold text-white">
          {membership === "pro" ? "PRO" : "FREE"}
        </p>
      </div>

      {/* Featured Ads */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-center transition hover:border-yellow-500">
        <div className="mb-3 text-4xl">⭐</div>

        <h3 className="text-sm text-slate-400">
          Featured Ads
        </h3>

        <p className="mt-2 text-4xl font-bold text-yellow-400">
          {featuredAds}
        </p>
      </div>

      {/* Verification */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-center transition hover:border-green-500">
        <div className="mb-3 text-4xl">
          {verifiedSeller ? "✅" : "⏳"}
        </div>

        <h3 className="text-sm text-slate-400">
          Seller Status
        </h3>

        <p
          className={`mt-2 text-xl font-semibold ${
            verifiedSeller
              ? "text-green-400"
              : "text-yellow-400"
          }`}
        >
          {verifiedSeller ? "Verified" : "Pending"}
        </p>
      </div>

    </div>
  );
}