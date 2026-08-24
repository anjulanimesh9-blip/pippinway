"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import ListingPhoto from "@/app/components/ListingPhoto";

type FavoritesProps = {
  favoriteAds: any[];
  currencyMap: Record<string, string>;
  loading?: boolean;
  onRemove: (listingId: string) => void;
};

function listingImage(ad: any): string {
  const first =
    ad.imageUrls?.[0] ||
    ad.imageUrl ||
    ad.images?.[0] ||
    ad.photos?.[0] ||
    ad.photo;
  return typeof first === "string" && first.trim() ? first : "/placeholder.png";
}

export default function Favorites({
  favoriteAds,
  currencyMap,
  loading = false,
  onRemove,
}: FavoritesProps) {
  return (
    <div
      id="favorites"
      className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 mb-8 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
        My Favorites ❤️
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && favoriteAds.length === 0 ? (
          Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="bg-[#0f172a] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <div className="h-32 animate-pulse bg-white/5" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))
        ) : favoriteAds.length === 0 ? (
          <p className="text-gray-400">No favorites yet</p>
        ) : (
          favoriteAds.map((ad) => (
            <Link
              key={ad.id}
              href={`/listings/${ad.id}`}
              className="bg-[#0f172a] border border-gray-800 rounded-[22px] overflow-hidden hover:scale-[1.02] transition"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-t-[22px]">
                <ListingPhoto
                  src={listingImage(ad)}
                  alt={ad.title || "Listing"}
                  sizes="(max-width: 640px) 100vw, 25vw"
                  quality={40}
                  className="object-cover"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm md:text-lg font-bold line-clamp-2">
                  {ad.title}
                </h3>

                <p className="text-gray-400 mt-1">{ad.location}</p>

                <p className="text-green-400 text-lg font-bold mt-2">
                  {formatPrice(ad.price ?? ad.amount, ad.country)}
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(ad.id);
                  }}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium transition"
                >
                  ❤️ Remove
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
