"use client";

import Link from "next/link";
import { Clock, Heart, MapPin } from "lucide-react";
import { formatPrice, getRelativeTime } from "@/lib/formatPrice";
import type { ListingRecord } from "@/lib/types/featured";

type ListingCardProps = {
  item: ListingRecord;
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  grid?: boolean;
};

export default function ListingCard({
  item,
  favorites,
  toggleFavorite,
  grid = true,
}: ListingCardProps) {
  const image = item.imageUrls?.[0] || item.imageUrl || "/placeholder.png";
  const slug = item.slug || item.id;
  const relativeTime = getRelativeTime(item.createdAt);

  if (!grid) {
    return (
      <Link
        href={`/listings/${slug}`}
        className="group relative flex flex-row overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b] p-4 gap-4 hover:border-white/20 transition-all"
      >
        <div className="relative w-[200px] h-[140px] shrink-0 overflow-hidden rounded-xl">
          <img src={image} alt={item.title ?? "Listing"} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-violet-400 font-bold text-lg">{formatPrice(Number(item.price ?? 0), item.country)}</p>
          <h2 className="font-semibold text-white truncate">{item.title}</h2>
          <p className="text-gray-400 text-sm mt-1">{item.location}, {item.country}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listings/${slug}`}
      className="group block overflow-hidden rounded-2xl bg-[#1e293b] shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square bg-[#0f172a]">
        <img
          src={image}
          alt={item.title ?? "Listing"}
          className="w-full h-full object-cover"
        />

        {item.featured === true && (
          <span className="absolute top-2 left-2 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            Featured
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(e, item.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
        >
          <Heart
            size={16}
            className={
              favorites.includes(item.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }
          />
        </button>
      </div>

      <div className="p-3">
        <p className="text-violet-400 font-bold text-base leading-tight truncate">
          {formatPrice(Number(item.price ?? 0), item.country)}
        </p>
        <h2 className="text-white font-semibold text-sm mt-0.5 truncate">
          {item.title}
        </h2>
        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1 truncate">
          <MapPin size={12} className="shrink-0" />
          {item.location}, {item.country}
        </p>
        {relativeTime && (
          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
            <Clock size={11} className="shrink-0" />
            {relativeTime}
          </p>
        )}
      </div>
    </Link>
  );
}
