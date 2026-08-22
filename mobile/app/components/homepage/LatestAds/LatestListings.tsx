"use client";

import { useEffect, useMemo, useState } from "react";
import ListingCard from "../ListingCard";
import BannerSlider from "../Banner/BannerSlider";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { ListingRecord } from "@/lib/types/featured";

type LatestListingsProps = {
  latestListings: any[];
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: any;
  bannerImages: string[];
  currentBanner: number;
};

type FeedItem =
  | { type: "listing"; listing: any }
  | { type: "featured"; listing: any; slot: number }
  | { type: "banner"; slot: number };

const FEATURED_GAPS = [1, 3, 2];
const ROTATE_MS = 4500;

function buildMixedFeed(
  regularAds: any[],
  featuredAds: any[],
  rotateIndex: number,
  includeBanners: boolean
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
    if (includeBanners && position % 10 === 0) {
      items.push({ type: "banner", slot: position / 10 - 1 });
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
  currencyMap,
  bannerImages,
  currentBanner,
}: LatestListingsProps) {
  const [rotateIndex, setRotateIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const featuredAds = useMemo(
    () => latestListings.filter((listing) => isActiveFeaturedListing(listing as ListingRecord)),
    [latestListings]
  );
  const regularAds = useMemo(
    () => latestListings.filter((listing) => !isActiveFeaturedListing(listing as ListingRecord)),
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
    () => buildMixedFeed(regularAds, featuredAds, rotateIndex, bannerImages.length > 0),
    [regularAds, featuredAds, rotateIndex, bannerImages.length]
  );

  if (!latestListings.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        No listings available.
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-1 gap-4 max-w-6xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((entry) => {
        if (entry.type === "banner") {
          return (
            <div key={`banner-slot-${entry.slot}`} className="col-span-2">
              <BannerSlider
                bannerImages={bannerImages}
                currentBanner={currentBanner + entry.slot}
              />
            </div>
          );
        }

        if (entry.type === "featured") {
          return (
            <div
              key={`featured-slot-${entry.slot}-${entry.listing.id}`}
              className="rounded-2xl border border-yellow-500/20 bg-yellow-400/5"
            >
              <ListingCard
                item={entry.listing}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                currencyMap={currencyMap}
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
            currencyMap={currencyMap}
          />
        );
      })}
    </div>
  );
}
