"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import ProfileListingCard from "./ProfileListingCard";
import { parseListingPrice } from "@/lib/formatPrice";
import { getListingStatus, type ListingStatus } from "../utils";

type FilterKey = "all" | ListingStatus;

type MyListingsProps = {
  myAds: any[];
  favoriteIds: string[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "sold", label: "Sold" },
  { key: "draft", label: "Draft" },
];

export default function MyListings({
  myAds,
  favoriteIds,
  loading = false,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MyListingsProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

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
    <div id="my-listings">
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

        <div className="flex items-center gap-2">
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

          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#151A22]">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-white/10 text-white" : "text-gray-500"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-white/10 text-white" : "text-gray-500"}`}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {loading && listings.length === 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-white/8 bg-[#111827]"
            >
              <div className="aspect-[2/1] animate-pulse bg-white/5" />
              <div className="space-y-1 px-1.5 py-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center text-gray-500">
          No ads in this filter yet.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {listings.map((ad) => (
            <div key={ad.id} className="h-full">
              <ProfileListingCard
                ad={ad}
                isFavorite={favoriteIds.includes(ad.id)}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((ad) => (
            <ProfileListingCard
              key={ad.id}
              ad={ad}
              view="list"
              isFavorite={favoriteIds.includes(ad.id)}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
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
