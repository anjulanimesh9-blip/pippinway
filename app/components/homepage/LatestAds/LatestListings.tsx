"use client";

import Link from "next/link";
import ListingCard from "../ListingCard";
import FirestoreBanner from "../Banner/FirestoreBanner";
import type { Banner, ListingRecord } from "@/lib/types/featured";

type LatestListingsProps = {
  latestListings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  pickBanner: (slotIndex: number) => Banner | null;
  loading?: boolean;
  totalLive?: number;
};

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-[#1e293b] overflow-hidden animate-pulse">
          <div className="aspect-square bg-white/5" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-2/3 rounded bg-white/5" />
            <div className="h-3 w-full rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LatestListings({
  latestListings,
  favorites,
  toggleFavorite,
  pickBanner,
  loading = false,
  totalLive = 0,
}: LatestListingsProps) {
  if (loading) {
    return <GridSkeleton />;
  }

  if (!latestListings.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111827] py-16 text-center px-4">
        <p className="text-gray-300 font-semibold">No listings found</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          {totalLive === 0
            ? "No approved ads yet. Approve listings in Admin → Ad Approvals."
            : "Try setting Country to “All Countries” and Category to “All”."}
        </p>
        <Link
          href="/add-listing"
          className="inline-block mt-5 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500"
        >
          + Post an Ad
        </Link>
      </div>
    );
  }

  const items: Array<
    | { type: "listing"; listing: ListingRecord }
    | { type: "banner"; banner: Banner }
  > = [];

  latestListings.forEach((listing, index) => {
    items.push({ type: "listing", listing });
    const position = index + 1;
    if (position % 10 === 0) {
      const banner = pickBanner(position / 10 - 1);
      if (banner) items.push({ type: "banner", banner });
    }
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((entry, idx) =>
        entry.type === "banner" ? (
          <div key={`banner-slot-${idx}-${entry.banner.id}`} className="col-span-2">
            <FirestoreBanner banner={entry.banner} />
          </div>
        ) : (
          <ListingCard
            key={entry.listing.id}
            item={entry.listing}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            grid
          />
        )
      )}
    </div>
  );
}
