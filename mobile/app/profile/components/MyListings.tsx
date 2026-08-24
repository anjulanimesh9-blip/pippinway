"use client";

import { useMemo, useState } from "react";
import { formatPrice, parseListingPrice } from "@/lib/formatPrice";
import ListingPhoto from "@/app/components/ListingPhoto";
import { getListingStatus, type ListingStatus } from "@/app/profile/utils";

type FilterKey = "all" | ListingStatus;

type MyListingsProps = {
  myAds: any[];
  userCurrency: string;
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "sold", label: "Sold" },
  { key: "draft", label: "Draft" },
];

function listingImage(ad: any): string {
  const first =
    ad.imageUrls?.[0] ||
    ad.imageUrl ||
    ad.images?.[0] ||
    ad.photos?.[0] ||
    ad.photo;
  return typeof first === "string" && first.trim() ? first : "/placeholder.png";
}

function toTime(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const date = value instanceof Date ? value : new Date(value as string | number);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

export default function MyListings({
  myAds,
  loading = false,
  onEdit,
  onDelete,
}: MyListingsProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState("newest");

  const listings = useMemo(() => {
    const next = myAds.filter((ad) =>
      filter === "all" ? true : getListingStatus(ad) === filter
    );

    next.sort((a, b) => {
      const priceA = parseListingPrice(a.price ?? a.amount);
      const priceB = parseListingPrice(b.price ?? b.amount);
      const timeA = toTime(a.createdAt);
      const timeB = toTime(b.createdAt);

      if (sortBy === "low-price") return priceA - priceB;
      if (sortBy === "high-price") return priceB - priceA;
      if (sortBy === "oldest") return timeA - timeB;
      return timeB - timeA;
    });

    return next;
  }, [myAds, filter, sortBy]);

  return (
    <div
      id="my-listings"
      className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
        My Ads
      </h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === item.key
                  ? "bg-[#2563eb] text-white"
                  : "bg-[#151A22] text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#151A22] px-3 py-2 text-xs text-gray-300 outline-none"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="high-price">Sort by: Price High</option>
          <option value="low-price">Sort by: Price Low</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {loading && listings.length === 0 ? (
          Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="bg-[#111827] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <div className="h-32 animate-pulse bg-white/5" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No ads in this filter yet.
          </div>
        ) : (
          listings.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#111827] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <ListingPhoto
                  src={listingImage(ad)}
                  alt={ad.title || "Listing"}
                  sizes="(max-width: 640px) 50vw, 200px"
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

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => onEdit(ad.id)}
                    className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl w-full"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => onDelete(ad.id)}
                    className="bg-red-600 hover:bg-red-700 py-2 rounded-xl w-full"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
