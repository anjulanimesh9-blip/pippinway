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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {favoriteAds.map((ad) => (
        <ProfileListingCard
          key={ad.id}
          ad={ad}
          isFavorite
          onToggleFavorite={onRemove}
        />
      ))}
      </div>
    </div>
  );
}
