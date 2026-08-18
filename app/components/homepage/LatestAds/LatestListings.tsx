"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ListingCard from "../ListingCard";
import FirestoreBanner from "../Banner/FirestoreBanner";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { Banner, ListingRecord } from "@/lib/types/featured";

type LatestListingsProps = {
  latestListings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  pickBanner: (slotIndex: number) => Banner | null;
  loading?: boolean;
  totalLive?: number;
};

type FeedItem =
  | { type: "listing"; listing: ListingRecord }
  | { type: "featured"; listing: ListingRecord; slot: number }
  | { type: "banner"; banner: Banner };

const FEATURED_GAPS = [1, 3, 2];
const ROTATE_MS = 4500;

function GridSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 border-b border-white/8 px-4 py-4 animate-pulse">
          <div className="h-[120px] w-[120px] shrink-0 rounded-lg bg-white/5" />
          <div className="flex flex-1 flex-col justify-center space-y-3">
            <div className="h-5 w-2/3 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
            <div className="h-6 w-1/3 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildMixedFeed(
  regularAds: ListingRecord[],
  featuredAds: ListingRecord[],
  rotateIndex: number,
  pickBanner: (slotIndex: number) => Banner | null
): FeedItem[] {
  const items: FeedItem[] = [];
  let featuredSlot = 0;
  let gapIndex = rotateIndex % FEATURED_GAPS.length;
  let untilFeatured = FEATURED_GAPS[gapIndex];

  if (regularAds.length === 0) {
    return featuredAds.map((listing, slot) => ({
      type: "featured" as const,
      listing: featuredAds[(rotateIndex + slot) % featuredAds.length],
      slot,
    }));
  }

  regularAds.forEach((listing, index) => {
    items.push({ type: "listing", listing });

    const position = index + 1;
    if (position % 10 === 0) {
      const banner = pickBanner(position / 10 - 1);
      if (banner) items.push({ type: "banner", banner });
    }

    if (featuredAds.length === 0) return;

    untilFeatured -= 1;
    if (untilFeatured <= 0) {
      items.push({
        type: "featured",
        listing: featuredAds[(rotateIndex + featuredSlot) % featuredAds.length],
        slot: featuredSlot,
      });
      featuredSlot += 1;
      gapIndex = (gapIndex + 1) % FEATURED_GAPS.length;
      untilFeatured = FEATURED_GAPS[gapIndex];
    }
  });

  return items;
}

export default function LatestListings({
  latestListings,
  favorites,
  toggleFavorite,
  pickBanner,
  loading = false,
  totalLive = 0,
}: LatestListingsProps) {
  const [rotateIndex, setRotateIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const featuredAds = useMemo(
    () => latestListings.filter(isActiveFeaturedListing),
    [latestListings]
  );
  const regularAds = useMemo(
    () => latestListings.filter((listing) => !isActiveFeaturedListing(listing)),
    [latestListings]
  );

  useEffect(() => {
    if (featuredAds.length === 0 || paused) return;
    const timer = setInterval(() => {
      setRotateIndex((current) => current + 1);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [featuredAds.length, paused]);

  const items = useMemo(
    () => buildMixedFeed(regularAds, featuredAds, rotateIndex, pickBanner),
    [regularAds, featuredAds, rotateIndex, pickBanner]
  );

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

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((entry, idx) => {
        if (entry.type === "banner") {
          return (
            <div key={`banner-slot-${idx}-${entry.banner.id}`} className="border-b border-white/8 p-3">
              <FirestoreBanner banner={entry.banner} />
            </div>
          );
        }

        if (entry.type === "featured") {
          return (
            <div
              key={`featured-slot-${entry.slot}-${entry.listing.id}`}
              className="border-b border-yellow-500/20 bg-yellow-400/5"
            >
              <ListingCard
                item={entry.listing}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                grid={false}
              />
            </div>
          );
        }

        return (
          <ListingCard
            key={entry.listing.id}
            item={entry.listing}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            grid={false}
          />
        );
      })}
    </div>
  );
}
