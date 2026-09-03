"use client";

import LatestListings from "./LatestAds/LatestListings";
import LatestHeading from "./LatestAds/LatestHeading";
import LatestPager from "./LatestAds/LatestPager";
import CategorySidebar from "./CategorySidebar";
import CategoryFilter from "./CategoryFilter";
import RightSidebar from "./RightSidebar";
import {
  bannersForHomepageRail,
  bannersForPlacement,
} from "@/app/hooks/useBanners";
import usePagedListings from "@/app/hooks/usePagedListings";
import type { Banner, ListingRecord } from "@/lib/types/featured";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  latestListings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (
    e: React.MouseEvent,
    listingId: string,
    context?: { category?: string; country?: string }
  ) => void;
  banners: Banner[];
  loading?: boolean;
  totalCount?: number;
  filterKey?: string;
  countryName?: string;
  addListingHref?: string;
};

export default function HomeContent({
  selectedCategory,
  setSelectedCategory,
  latestListings,
  favorites,
  toggleFavorite,
  banners,
  loading = false,
  totalCount = 0,
  filterKey = "",
  countryName,
  addListingHref,
}: Props) {
  const infeedBanners = bannersForPlacement(banners, "infeed");
  const railBanners = bannersForHomepageRail(banners);
  const { pageItems, total, from, to, hasPrev, hasNext, goPrev, goNext } =
    usePagedListings(latestListings, filterKey);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-5 mt-5">
        <aside className="hidden lg:block self-start">
          <div className="sticky top-24">
            <CategorySidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 lg:hidden">
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          <LatestHeading
            count={pageItems.length}
            total={total}
            from={from}
            to={to}
          />

          <LatestListings
            latestListings={pageItems}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            banners={infeedBanners}
            loading={loading}
            totalLive={totalCount}
            countryName={countryName}
            addListingHref={addListingHref}
          />

          {!loading && (
            <LatestPager
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}
        </main>

        <aside className="hidden lg:block self-start">
          <div className="sticky top-24">
            <RightSidebar banners={railBanners} />
          </div>
        </aside>
      </div>
    </>
  );
}
