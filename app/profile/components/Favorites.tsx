"use client";

import ProfileListingCard from "./ProfileListingCard";
import { useI18n } from "@/lib/i18n";

type FavoritesProps = {
  favoriteAds: any[];
  loading?: boolean;
  onRemove: (listingId: string) => void;
};

export default function Favorites({
  favoriteAds,
  loading = false,
  onRemove,
}: FavoritesProps) {
  const { t } = useI18n();
  if (loading && favoriteAds.length === 0) {
    return (
      <div
        id="favorites"
        className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-white/8 bg-[#111827]"
          >
            <div className="aspect-[2/1] animate-pulse bg-white/5" />
            <div className="space-y-1 px-1.5 py-1">
              <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (favoriteAds.length === 0) {
    return (
      <div
        id="favorites"
        className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center text-gray-500"
      >
        {t("profile.noFavorites")}
      </div>
    );
  }

  return (
    <div id="favorites">
      <h2 className="mb-4 text-lg font-bold text-white">{t("profile.favorites")}</h2>
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
