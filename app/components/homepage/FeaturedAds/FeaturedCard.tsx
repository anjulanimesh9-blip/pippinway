"use client";

import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import ListingPhoto, { FEATURED_CARD_SIZES } from "@/app/components/ListingPhoto";
import { formatFeaturedUntil } from "@/lib/listingFeatured";
import type { ListingRecord } from "@/lib/types/featured";

type Props = {
  item: ListingRecord;
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  currencyMap: Record<string, string>;
  mobile?: boolean;
  active?: boolean;
  loadImage?: boolean;
};

export default function FeaturedCard({
  item,
  favorites,
  toggleFavorite,
  currencyMap,
  active = false,
  loadImage = true,
}: Props) {
  const currency =
    currencyMap[item?.country?.trim()?.toLowerCase() ?? ""] || item.currency || "Rs.";

  const image = item?.imageUrls?.[0] || item?.imageUrl || "/placeholder.png";
  const featuredUntil = formatFeaturedUntil(item);
  const slug = item.slug || item.id;

  return (
    <Link
      href={slug ? `/listings/${slug}` : "#"}
      className={`group block rounded-2xl overflow-hidden bg-[#111827] border border-yellow-500/30 shadow-lg transition-all hover:border-yellow-400/60 hover:shadow-[0_0_24px_rgba(250,204,21,0.12)] ${
        active ? "ring-1 ring-yellow-400/30" : ""
      }`}
    >
      <div className="relative h-[150px] overflow-hidden bg-[#0f172a]">
        {loadImage ? (
          <ListingPhoto
            src={image}
            alt={item?.title || "Listing"}
            sizes={FEATURED_CARD_SIZES}
            eager={active}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-yellow-400 px-2 py-1 text-[10px] font-bold text-black">
          <Star size={10} fill="currentColor" />
          FEATURED
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(e, item.id);
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center"
        >
          <Heart
            size={16}
            className={favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-white"}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-bold text-white">{item?.title}</h3>
        <p className="mt-2 text-xl font-bold text-emerald-400">
          {currency} {Number(item?.price ?? 0).toLocaleString()}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {item?.category && (
            <span className="text-blue-400">{item.category}</span>
          )}
          <span className="inline-flex items-center gap-1 text-gray-400">
            <MapPin size={12} className="text-red-400 shrink-0" />
            {item?.location || "Unknown"}
          </span>
        </div>
        {featuredUntil && (
          <p className="mt-2 text-xs font-semibold text-yellow-300">
            ★ Featured until {featuredUntil}
          </p>
        )}
      </div>
    </Link>
  );
}

