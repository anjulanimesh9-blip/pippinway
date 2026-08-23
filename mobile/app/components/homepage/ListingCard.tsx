"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";

type ListingCardProps = {
  item: any;
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: any;
};

export default function ListingCard({
  item,
  favorites,
  toggleFavorite,
  currencyMap,
}: ListingCardProps) {
  const price = formatPrice(item.price, item.country);

  const image =
    item.imageUrls?.[0] ||
    item.imageUrl ||
    "/placeholder.png";
  const isFeatured = isActiveFeaturedListing(item);

  return (
    <>
      {/* ---------------- Mobile ---------------- */}
      <Link
        href={`/listings/${item.id}`}
        className="lg:hidden block overflow-hidden rounded-2xl bg-[#111827] border border-white/10 shadow hover:shadow-xl transition"
      >
        <div className="relative">
          <img
            src={image}
            alt={item.title}
            className="w-full aspect-square object-cover"
          />

          {isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-lg">
              👑 FEATURED
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(e, item.id);
            }}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center"
          >
            {favorites.includes(item.id) ? "❤️" : "🤍"}
          </button>
        </div>

        <div className="p-3">
          <h2 className="font-semibold text-white text-sm line-clamp-2 min-h-[40px]">
            {item.title}
          </h2>

          <p className="mt-2 text-green-400 font-bold text-lg">
            {price}
          </p>

          <p className="text-gray-400 text-xs mt-1 truncate">
            📍 {item.location}
          </p>

          <p className="text-blue-400 text-xs mt-1 truncate">
            {item.category}
          </p>
        </div>
      </Link>

      {/* ---------------- Desktop ---------------- */}
      <Link
        href={`/listings/${item.id}`}
        className={`hidden lg:flex group relative overflow-hidden rounded-2xl p-4 gap-4 items-start transition-all hover:shadow-xl
        ${
          isFeatured
            ? "bg-yellow-500/5 border border-yellow-500"
            : "bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10"
        }`}
      >
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            👑 FEATURED
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(e, item.id);
          }}
          className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center"
        >
          {favorites.includes(item.id) ? (
            <span className="text-red-500 text-xl">❤️</span>
          ) : (
            <span className="text-white text-xl">🤍</span>
          )}
        </button>

        <div className="relative w-[180px] h-[130px] flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="font-bold text-white text-xl line-clamp-1 pr-10">
            {item.title}
          </h2>

          <p className="text-blue-400 mt-1">
            {item.category}
          </p>

          <p className="text-gray-400 mt-1">
            {item.location}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            🕒{" "}
            {item.createdAt
              ? new Date(
                  item.createdAt.seconds * 1000
                ).toLocaleDateString("en-GB")
              : "Recently"}
          </p>

          <p className="mt-3 text-green-400 text-2xl font-bold">
            {price}
          </p>
        </div>
      </Link>
    </>
  );
}