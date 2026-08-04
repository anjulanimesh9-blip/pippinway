"use client";

import { useEffect, useMemo, useState } from "react";

import DesktopCarousel from "./DesktopCarousel";
import MobileCarousel from "./MobileCarousel";

import { Listing } from "./types";
import { shuffleArray } from "./utils";

type Props = {
  listings: Listing[];
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: Record<string, string>;
};

export default function FeaturedAds({
  listings,
  favorites,
  toggleFavorite,
  currencyMap,
}: Props) {

  // Featured only
  const featured = useMemo(
    () => listings.filter((item) => item.featured),
    [listings]
  );

  // Random order
  const [items, setItems] = useState<Listing[]>(() =>
    shuffleArray(featured)
  );

  // Refresh when featured list changes
  useEffect(() => {
    setItems(shuffleArray(featured));
  }, [featured]);

  // Shuffle every 25 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => shuffleArray(prev));
    }, 25000);

    return () => clearInterval(timer);
  }, []);

  // Empty state
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            👑 Featured Ads
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Discover premium featured listings
          </p>

        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
          {items.length} Ads
        </div>

      </div>

      {/* Mobile */}

      <MobileCarousel
        items={items}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        currencyMap={currencyMap}
      />

      {/* Desktop */}

      <DesktopCarousel
        items={items}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        currencyMap={currencyMap}
      />

    </section>
  );
}