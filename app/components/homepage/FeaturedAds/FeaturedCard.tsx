"use client";

import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

type Props = {
  item: any;
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: Record<string, string>;
  mobile?: boolean;
  active?: boolean;
};

export default function FeaturedCard({
  item,
  favorites,
  toggleFavorite,
  currencyMap,
  mobile = false,
  active = false,
}: Props)
{
  const currency =
    currencyMap[item?.country?.trim()?.toLowerCase()] || "$";

  const image =
    item?.imageUrls?.[0] ||
    item?.imageUrl ||
    "/placeholder.png";

  return (
    <Link
      href={item?.id ? `/listings/${item.id}` : "#"}
      className={`
  featured-card
  group
  block
  rounded-2xl
  overflow-hidden
  bg-[#111827]
  border
  shadow-lg
  transition-all
  duration-500

  ${
  active
  ? "scale-110 opacity-100 border-blue-500 shadow-[0_0_45px_rgba(59,130,246,.45)] z-30"
  : "scale-90 opacity-60 border-white/10"
  }

  hover:scale-100
  hover:opacity-100
  hover:border-blue-500

  w-[170px]
  md:w-[210px]
  lg:w-[220px]
`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={item?.title || "Listing"}
          className="
            w-full
            h-[120px]
            md:h-[150px]
            lg:h-[165px]
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Featured Badge */}
        <span
          className="
            absolute
            top-2
            left-2
            rounded-full
            bg-yellow-400
            px-2
            py-1
            text-[8px]
            font-bold
            text-black
          "
        >
          👑 FEATURED
        </span>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(e, item.id);
          }}
          className="
            absolute
            top-2
            right-2
            h-8
            w-8
            rounded-full
            bg-black/60
            backdrop-blur
            flex
            items-center
            justify-center
          "
        >
          <Heart
            size={16}
            className={
              favorites.includes(item.id)
                ? "fill-red-500 text-red-500"
                : "text-white"
            }
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">

        <h3 className="truncate text-base font-bold text-white">
          {item?.title}
        </h3>

        <div className="mt-2">
          <span
            className="
              inline-flex
              rounded-full
              bg-blue-500/20
              px-2
              py-1
              text-[10px]
              text-blue-400
            "
          >
            {item?.category}
          </span>
        </div>

        <p className="mt-3 text-2xl font-bold text-emerald-400">
          {currency} {Number(item?.price || 0).toLocaleString()}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
          <MapPin
            size={12}
            className="text-red-400 flex-shrink-0"
          />

          <span className="truncate">
            {item?.location || "Unknown"}
          </span>
        </div>

      </div>
    </Link>
  );
}