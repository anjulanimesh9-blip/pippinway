"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ListingCard from "../ListingCard";
import BannerRotator from "../Banner/BannerRotator";
import { useGuestAuthPrompt } from "../../GuestAuthPrompt";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { Banner, ListingRecord } from "@/lib/types/featured";
import { useI18n } from "@/lib/i18n";

type LatestListingsProps = {
  latestListings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (
    e: React.MouseEvent,
    listingId: string,
    context?: { category?: string; country?: string }
  ) => void;
  banners: Banner[];
  loading?: boolean;
  totalLive?: number;
  countryName?: string;
  addListingHref?: string;
};

type FeedItem =
  | { type: "listing"; listing: ListingRecord }
  | { type: "featured"; listing: ListingRecord; slot: number }
  | { type: "banner"; slot: number };

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
  rotateIndex: number
): FeedItem[] {
  const items: FeedItem[] = [];
  let featuredSlot = 0;
  // Fixed gaps so featured slots stay put; rotateIndex only swaps featured ads.
  let gapIndex = 0;
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
  banners,
  loading = false,
  countryName,
  addListingHref = "/add-listing",
}: LatestListingsProps) {
  const { t } = useI18n();
  const { requireAuth } = useGuestAuthPrompt();
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
    () => buildMixedFeed(regularAds, featuredAds, rotateIndex),
    [regularAds, featuredAds, rotateIndex]
  );

  if (loading) {
    return <GridSkeleton />;
  }

  if (!latestListings.length) {
    const place = countryName?.trim();
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111827] py-16 text-center px-4">
        <p className="text-gray-300 font-semibold">
          {place ? t("home.noListingsIn", { place }) : t("home.empty")}
        </p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          {place ? t("home.beFirstIn", { place }) : t("home.beFirst")}
        </p>
        <button
          type="button"
          onClick={() => requireAuth(addListingHref)}
          className="mt-5 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500"
        >
          {t("home.postAnAdPlus")}
        </button>
        {place && (
          <div className="mt-3">
            <Link href="/" className="text-sm text-[#FBB03B] hover:underline">
              {t("home.changeCountry")}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((entry) => {
        if (entry.type === "banner") {
          return (
            <div key={`banner-slot-${entry.slot}`} className="border-b border-white/8 p-3">
              <BannerRotator banners={banners} startOffset={entry.slot} />
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
