"use client";

import Link from "next/link";
import { Heart, MapPin, Pencil, Trash2 } from "lucide-react";
import ListingPhoto, {
  LISTING_THUMB_SIZES,
} from "@/app/components/ListingPhoto";
import { formatPrice, getRelativeTime } from "@/lib/formatPrice";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import { getListingStatus } from "../utils";

type ProfileListingCardProps = {
  ad: any;
  view?: "grid" | "list";
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const PROFILE_GRID_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px";
const PROFILE_PHOTO_QUALITY = 40;

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-400",
  pending: "text-amber-400",
  sold: "text-violet-400",
  draft: "text-gray-400",
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

function listingTitle(ad: any): string {
  const title = String(ad.title || ad.name || "").trim();
  return title || "Untitled listing";
}

function listingPrice(ad: any): string {
  return formatPrice(ad.price ?? ad.amount, ad.country);
}

// Keep this file on production deploys; card layout lives here.
export default function ProfileListingCard({
  ad,
  view = "grid",
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: ProfileListingCardProps) {
  const image = listingImage(ad);
  const title = listingTitle(ad);
  const price = listingPrice(ad);
  const slug = ad.slug || ad.id;
  const status = getListingStatus(ad);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const location = ad.location || ad.country || "—";
  const relativeTime = getRelativeTime(ad.createdAt) || "—";
  const isFeatured = isActiveFeaturedListing(ad);
  const isOwnerCard = Boolean(onEdit || onDelete);

  if (view === "list") {
    return (
      <div className="group relative flex overflow-hidden rounded-2xl border border-white/8 bg-[#111827]">
        <Link href={`/listings/${slug}`} className="relative h-20 w-24 shrink-0 overflow-hidden bg-[#0B0E14]">
          <ListingPhoto
            src={image}
            alt={title}
            sizes={LISTING_THUMB_SIZES}
            quality={PROFILE_PHOTO_QUALITY}
            className="object-cover object-center"
          />
          {isFeatured && (
            <span className="absolute left-2 top-2 rounded bg-[#FBB03B] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-black">
              FEATURED
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
          <div>
            <Link href={`/listings/${slug}`} className="line-clamp-1 text-sm font-semibold text-white">
              {title}
            </Link>
            <p className="mt-0.5 text-sm font-bold text-emerald-400">{price}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} />
              {location}
            </span>
            <span>{relativeTime}</span>
            <span className={STATUS_STYLES[status]}>{statusLabel}</span>
          </div>
        </div>
        {isOwnerCard && (
          <div className="flex flex-col justify-center gap-2 p-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ad.id)}
                className="rounded-lg bg-sky-600/20 p-2 text-sky-400 hover:bg-sky-600/30"
                aria-label="Edit listing"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad.id)}
                className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30"
                aria-label="Delete listing"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-white/8 bg-[#111827]">
      <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-[#0B0E14]">
        <Link href={`/listings/${slug}`} className="absolute inset-0 block">
          <ListingPhoto
            src={image}
            alt={title}
            sizes={PROFILE_GRID_SIZES}
            quality={PROFILE_PHOTO_QUALITY}
            className="object-cover object-center"
          />
        </Link>

        {isFeatured && (
          <span className="absolute left-1 top-1 z-10 rounded bg-[#FBB03B] px-1 py-px text-[8px] font-extrabold tracking-wide text-black">
            FEATURED
          </span>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(ad.id)}
            className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label={isFavorite ? "Remove favorite" : "Save listing"}
          >
            <Heart
              size={11}
              className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}
            />
          </button>
        )}

        {isOwnerCard && (
          <div className="absolute bottom-1 right-1 z-10 flex gap-0.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ad.id)}
                className="rounded bg-black/70 p-1 text-white hover:bg-sky-600"
                aria-label="Edit listing"
              >
                <Pencil size={11} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad.id)}
                className="rounded bg-black/70 p-1 text-white hover:bg-red-600"
                aria-label="Delete listing"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 py-1">
        <Link
          href={`/listings/${slug}`}
          className="line-clamp-1 text-[11px] font-semibold leading-4 text-white hover:text-sky-300"
        >
          {title}
        </Link>
        <p className="text-xs font-bold leading-4 text-emerald-400">{price}</p>
        <div className="mt-0.5 flex items-center justify-between gap-1 text-[9px] text-gray-400">
          <span className="truncate">{location}</span>
          <span className={`shrink-0 font-semibold ${STATUS_STYLES[status]}`}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}
