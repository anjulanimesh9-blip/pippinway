type FeaturedAdsProps = {
  myAds: any[];
  featuredAdsUsed: number;
  featuredAdsRemaining: number;
  featuredCredits: number;
};

export default function FeaturedAds({
  myAds,
  featuredAdsUsed,
  featuredAdsRemaining,
  featuredCredits,
}: FeaturedAdsProps) {
  const featuredListings = myAds.filter((ad) => ad.featured);

  return (
    <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#0f172a] to-[#111827] p-4 shadow-xl">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-yellow-400">
            ⭐ Featured Ads
          </h2>

          <p className="text-xs text-gray-400">
            Featured listings
          </p>
        </div>

        <div className="text-right">

          <div className="text-3xl font-bold text-yellow-400">
            {featuredAdsUsed}
            <span className="text-lg text-gray-500">
              {" "}
              / {featuredCredits}
            </span>
          </div>

          <p className="text-xs text-green-400">
            {featuredAdsRemaining} Remaining
          </p>

        </div>

      </div>

      {/* Featured Ads */}
      {featuredListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

          {featuredListings.map((ad) => (
            <div
              key={ad.id}
              className="overflow-hidden rounded-xl border border-yellow-500/20 bg-[#111827]"
            >

              <img
                src={
                  ad.imageUrls?.[0] ||
                  ad.imageUrl ||
                  "/logo.png"
                }
                alt={ad.title}
                className="h-24 w-full object-cover"
              />

              <div className="p-2">

                <h3 className="truncate text-sm font-semibold text-white">
                  {ad.title}
                </h3>

                <p className="mt-1 text-[11px] text-red-400">
                  ⏳{" "}
                  {ad.featuredExpiryDate
                    ? Math.max(
                        0,
                        Math.ceil(
                          (
                            new Date(
                              ad.featuredExpiryDate.seconds * 1000
                            ).getTime() - Date.now()
                          ) / 86400000
                        )
                      )
                    : 0}{" "}
                  days left
                </p>

              </div>

            </div>
          ))}

        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#0b1220] text-sm text-gray-500">
          ⭐ No Featured Ads Yet
        </div>
      )}

    </div>
  );
}