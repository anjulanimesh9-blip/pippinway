"use client";

import ListingCard from "../ListingCard";
import BannerSlider from "../Banner/BannerSlider";

type LatestListingsProps = {
  mixedListings: any[];
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: any;
  bannerImages: string[];
  currentBanner: number;
};

export default function LatestListings({
  mixedListings,
  favorites,
  toggleFavorite,
  currencyMap,
  bannerImages,
  currentBanner,
}: LatestListingsProps) {
  if (!mixedListings.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        No listings available.
      </div>
    );
  }

  const firstSection = mixedListings.slice(0, 8);
  const remainingSection = mixedListings.slice(8);

  return (
    <div className="space-y-8">
      {/* First Listings */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 max-w-6xl mx-auto">
        {firstSection.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currencyMap={currencyMap}
          />
        ))}
      </div>

      {/* Banner — compact ~140px strip, object-cover (no letterbox / portrait stretch) */}
      {bannerImages.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <BannerSlider
            bannerImages={bannerImages}
            currentBanner={currentBanner}
          />
        </div>
      )}

      {/* Remaining Listings */}
      {remainingSection.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 max-w-6xl mx-auto">
          {remainingSection.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              currencyMap={currencyMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}