"use client";

import Link from "next/link";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import ListingPhoto, {
  LISTING_GRID_SIZES,
  LISTING_THUMB_SIZES,
} from "@/app/components/ListingPhoto";
import { formatPrice, getRelativeTime } from "@/lib/formatPrice";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
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
  const isFeatured = isActiveFeaturedListing(item);
  const relativeTime = getRelativeTime(item.createdAt);
  const locationLabel = [item.location, item.country].filter(Boolean).join(", ");
  const price = formatPrice(item.price ?? item.amount, item.country);
  const meta = [locationLabel, item.category].filter(Boolean).join(", ");

  if (!grid) {
    return (
      <Link
        href={`/listings/${slug}`}
        className="group flex gap-3 border-b border-white/8 bg-[#111827] px-3 py-3 transition-colors hover:bg-[#1a2333] sm:gap-4 sm:px-4 sm:py-4"
      >
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-[#0f172a] sm:h-[120px] sm:w-[120px]">
          <ListingPhoto
            src={image}
            alt={item.title ?? "Listing"}
            sizes={LISTING_THUMB_SIZES}
            className="object-cover"
          />
          {isFeatured && (
            <span className="absolute left-1 top-1 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white sm:left-1.5 sm:top-1.5">
              Featured
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white sm:text-lg">
              {item.title}
            </h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(e, item.id);
              }}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/5"
              aria-label="Save listing"
            >
              <Heart
                size={16}
                className={
                  favorites.includes(item.id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400"
                }
              />
            </button>
          </div>

          {isFeatured && (
            <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded bg-yellow-400/15 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
              <Star size={10} fill="currentColor" />
              FEATURED
            </span>
          )}

          <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 sm:text-sm">
            <MapPin size={12} className="shrink-0 text-gray-500" />
            <span className="truncate">{meta || "Location not set"}</span>
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <p className="text-lg font-extrabold text-emerald-400 sm:text-xl">
              {price}
            </p>
            {relativeTime && (
              <p className="flex items-center gap-1 text-[11px] text-gray-500 sm:text-xs">
                <Clock size={11} />
                {relativeTime}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listings/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/35 hover:shadow-[0_16px_40px_rgba(37,99,235,0.18)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0f172a]">
        <ListingPhoto
          src={image}
          alt={item.title ?? "Listing"}
          sizes={LISTING_GRID_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {isFeatured && (
          <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow">
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
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105"
          aria-label="Save listing"
        >
          <Heart
            size={18}
            className={
              favorites.includes(item.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-xl font-extrabold leading-none tracking-tight text-emerald-400 sm:text-2xl">
          {price}
        </p>

        <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-white sm:text-lg">
          {item.title}
        </h2>

        <p className="mt-3 flex items-center gap-1 text-sm text-gray-400">
          <MapPin size={13} className="shrink-0 text-sky-400" />
          <span className="truncate">{meta || "Location not set"}</span>
        </p>

        {relativeTime && (
          <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-gray-500">
            <Clock size={12} className="shrink-0" />
            {relativeTime}
          </p>
        )}
      </div>
    </Link>
  );
}
