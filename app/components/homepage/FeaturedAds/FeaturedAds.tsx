"use client";

import Link from "next/link";
import DesktopCarousel from "./DesktopCarousel";
import MobileCarousel from "./MobileCarousel";
import type { ListingRecord } from "@/lib/types/featured";

type Props = {
  listings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  currencyMap: Record<string, string>;
  loading?: boolean;
};

export default function FeaturedAds({
  listings,
  favorites,
  toggleFavorite,
  currencyMap,
  loading = false,
}: Props) {
  return (
    <section className="mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white inline-flex items-center gap-2">
          <span className="text-yellow-400">★</span> Featured Ads
        </h2>
        <Link
          href="/featured-packages"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-white/10 bg-[#111827] animate-pulse"
            />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <>
          <MobileCarousel
            items={listings}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currencyMap={currencyMap}
          />
          <DesktopCarousel
            items={listings}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currencyMap={currencyMap}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-yellow-500/20 bg-[#111827] px-5 py-8 text-center">
          <p className="text-yellow-300 font-semibold">No featured ads right now</p>
          <p className="text-sm text-gray-400 mt-1">
            Feature your listing to appear here at the top of the marketplace.
          </p>
          <Link
            href="/featured-packages"
            className="inline-block mt-4 rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold text-black"
          >
            Buy Featured Package
          </Link>
        </div>
      )}
    </section>
  );
}
