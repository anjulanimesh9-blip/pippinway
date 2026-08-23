"use client";

import ProfileListingCard from "./ProfileListingCard";

type FavoritesProps = {
  favoriteAds: any[];
  onRemove: (listingId: string) => void;
};

export default function Favorites({ favoriteAds, onRemove }: FavoritesProps) {
  if (favoriteAds.length === 0) {
    return (
      <div
        id="favorites"
        className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center text-gray-500"
      >
        No favorites yet.
      </div>
    );
  }

  return (
    <div id="favorites">
      <h2 className="mb-4 text-lg font-bold text-white">Favorites</h2>
      <div className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {favoriteAds.map((ad) => (
        <div key={ad.id} className="h-full">
          <ProfileListingCard
            ad={ad}
            isFavorite
            onToggleFavorite={onRemove}
          />
        </div>
      ))}
      </div>
    </div>
  );
}
