"use client";

import Link from "next/link";
import { Eye, Heart, MapPin, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { formatPrice, getRelativeTime } from "@/lib/formatPrice";
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

export default function ProfileListingCard({
  ad,
  view = "grid",
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: ProfileListingCardProps) {
  const image = ad.imageUrls?.[0] || ad.imageUrl || "/placeholder.png";
  const slug = ad.slug || ad.id;
  const status = getListingStatus(ad);
  const relativeTime = getRelativeTime(ad.createdAt);
  const views = ad.views || ad.viewCount || 0;
  const likes = ad.likes || ad.favoriteCount || 0;
  const comments = ad.comments || ad.commentCount || 0;

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  if (view === "list") {
    return (
      <div className="group relative flex overflow-hidden rounded-2xl border border-white/8 bg-[#151A22]">
        <Link href={`/listings/${slug}`} className="relative h-28 w-36 shrink-0">
          <img src={image} alt={ad.title} className="h-full w-full object-cover" />
          {ad.featured === true && (
            <span className="absolute left-2 top-2 rounded bg-[#FBB03B] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-black">
              FEATURED
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <Link href={`/listings/${slug}`} className="line-clamp-1 font-semibold text-white">
              {ad.title}
            </Link>
            <p className="mt-1 text-lg font-bold text-emerald-400">
              {formatPrice(Number(ad.price ?? 0), ad.country)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} />
              {ad.location || ad.country || "—"}
            </span>
            <span>{relativeTime}</span>
            <span className={STATUS_STYLES[status]}>{statusLabel}</span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex flex-col justify-center gap-2 p-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ad.id)}
                className="rounded-lg bg-sky-600/20 p-2 text-sky-400 hover:bg-sky-600/30"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad.id)}
                className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30"
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
    <div className="group overflow-hidden rounded-2xl border border-white/8 bg-[#151A22]">
      <div className="relative aspect-[4/3] bg-[#0B0E14]">
        <Link href={`/listings/${slug}`} className="block h-full">
          <img src={image} alt={ad.title} className="h-full w-full object-cover" />
        </Link>

        {ad.featured === true && (
          <span className="absolute left-2 top-2 rounded bg-[#FBB03B] px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black">
            FEATURED
          </span>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(ad.id)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow"
          >
            <Heart
              size={15}
              className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}
            />
          </button>
        )}

        {(onEdit || onDelete) && (
          <div className="absolute bottom-2 right-2 hidden gap-1 group-hover:flex">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ad.id)}
                className="rounded-lg bg-black/70 p-1.5 text-white hover:bg-sky-600"
              >
                <Pencil size={13} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad.id)}
                className="rounded-lg bg-black/70 p-1.5 text-white hover:bg-red-600"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <Link
          href={`/listings/${slug}`}
          className="line-clamp-1 text-sm font-semibold text-white hover:text-sky-300"
        >
          {ad.title}
        </Link>
        <p className="mt-1 text-base font-bold text-emerald-400">
          {formatPrice(Number(ad.price ?? 0), ad.country)}
        </p>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin size={11} className="shrink-0" />
            {ad.location || ad.country || "—"}
          </span>
          <span className="shrink-0">{relativeTime}</span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-500">
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
