"use client";

import Link from "next/link";
import { Eye, Heart, MapPin, MessageCircle, Pencil, Trash2 } from "lucide-react";
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
  const raw = Number(ad.price ?? 0);
  return formatPrice(Number.isFinite(raw) ? raw : 0, ad.country);
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
  const relativeTime = getRelativeTime(ad.createdAt) || "—";
  const views = ad.views || ad.viewCount || 0;
  const likes = ad.likes || ad.favoriteCount || 0;
  const comments = ad.comments || ad.commentCount || 0;
  const isFeatured = isActiveFeaturedListing(ad);
  const isOwnerCard = Boolean(onEdit || onDelete);

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const location = ad.location || ad.country || "—";

  if (view === "list") {
    return (
      <div className="group relative flex overflow-hidden rounded-2xl border border-white/8 bg-[#111827]">
        <Link href={`/listings/${slug}`} className="relative h-28 w-36 shrink-0 overflow-hidden bg-[#0B0E14]">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {isFeatured && (
            <span className="absolute left-2 top-2 rounded bg-[#FBB03B] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-black">
              FEATURED
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <Link href={`/listings/${slug}`} className="line-clamp-1 font-semibold text-white">
              {title}
            </Link>
            <p className="mt-1 text-lg font-bold text-emerald-400">{price}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
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
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#111827]">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#0B0E14]">
        <Link href={`/listings/${slug}`} className="absolute inset-0 block">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </Link>

        {isFeatured && (
          <span className="absolute left-2 top-2 z-10 rounded bg-[#FBB03B] px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black">
            FEATURED
          </span>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(ad.id)}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label={isFavorite ? "Remove favorite" : "Save listing"}
          >
            <Heart
              size={15}
              className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}
            />
          </button>
        )}

        {isOwnerCard && (
          <div className="absolute bottom-2 right-2 z-10 flex gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ad.id)}
                className="rounded-lg bg-black/70 p-1.5 text-white hover:bg-sky-600"
                aria-label="Edit listing"
              >
                <Pencil size={13} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad.id)}
                className="rounded-lg bg-black/70 p-1.5 text-white hover:bg-red-600"
                aria-label="Delete listing"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/listings/${slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white hover:text-sky-300"
        >
          {title}
        </Link>
        <p className="mt-1 min-h-6 text-base font-bold leading-6 text-emerald-400">{price}</p>

        <div className="mt-2 flex h-4 items-center justify-between gap-2 text-[11px] text-gray-400">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin size={11} className="shrink-0" />
            {location}
          </span>
          <span className="shrink-0">{relativeTime}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <Eye size={11} />
              {views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={11} />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={11} />
              {comments}
            </span>
          </div>
          <span className={`font-semibold ${STATUS_STYLES[status]}`}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}
