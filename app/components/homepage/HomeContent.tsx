"use client";

import LatestListings from "./LatestAds/LatestListings";
import LatestHeading from "./LatestAds/LatestHeading";
import CategorySidebar from "./CategorySidebar";
import CategoryFilter from "./CategoryFilter";
import RightSidebar from "./RightSidebar";
import TrustBadges from "./TrustBadges";
import BannerRotator, { MOBILE_SIDEBAR_BANNER_CLASS } from "./Banner/BannerRotator";
import { bannersForPlacement } from "@/app/hooks/useBanners";
import type { Banner, ListingRecord } from "@/lib/types/featured";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  latestListings: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  banners: Banner[];
  loading?: boolean;
  totalCount?: number;
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
}: Props) {
  const infeedBanners = bannersForPlacement(banners, "infeed");
  const sidebarBanners = bannersForPlacement(banners, "sidebar");

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

          <div className="mb-4 lg:hidden">
            <BannerRotator
              banners={sidebarBanners}
              className={MOBILE_SIDEBAR_BANNER_CLASS}
            />
          </div>

          <LatestHeading count={latestListings.length} />

          <LatestListings
            latestListings={latestListings}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            banners={infeedBanners}
            loading={loading}
            totalLive={totalCount}
          />
        </main>

        <aside className="hidden lg:block self-start">
          <div className="sticky top-24">
            <RightSidebar banners={sidebarBanners} />
          </div>
        </aside>
      </div>

      <TrustBadges />
    </>
  );
}
