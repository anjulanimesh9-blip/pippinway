"use client";

import CategoryFilter from "./CategoryFilter";
import FeaturedBanner from "./FeaturedBanner";
import FeaturedAds from "./FeaturedAds/FeaturedAds";
import LatestListings from "./LatestAds/LatestListings";
import LatestHeading from "./LatestAds/LatestHeading";
import CategorySidebar from "./CategorySidebar";
import RightSidebar from "./RightSidebar";
import BannerSlider from "./Banner/BannerSlider";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;

  featuredListings: any[];
  mixedListings: any[];

  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;

  currencyMap: Record<string, string>;

  bannerImages: string[];
  currentBanner: number;
};

export default function HomeContent({
  selectedCategory,
  setSelectedCategory,
  featuredListings,
  mixedListings,
  favorites,
  toggleFavorite,
  currencyMap,
  bannerImages,
  currentBanner,
}: Props) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_220px] gap-6 mt-6 items-start">

      {/* LEFT SIDEBAR */}
   <aside className="hidden lg:block">
  <div className="sticky top-24">
    <CategorySidebar
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
    />
  </div>
</aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0">

        {/* Category Filter */}
        <div className="mt-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Featured Banner */}
        <div className="mt-6">
          <FeaturedBanner />
        </div>

        {/* Desktop Featured Ads */}
        <div className="hidden lg:block mt-10 mb-12">
          <FeaturedAds
            listings={featuredListings}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currencyMap={currencyMap}
          />
        </div>

        {/* Mobile Featured Ads */}
        <div className="lg:hidden mb-8 mt-6">
          <FeaturedAds
            listings={featuredListings}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currencyMap={currencyMap}
          />
        </div>

        {bannerImages.length > 0 && (
          <div className="mb-4 lg:hidden">
            <BannerSlider
              bannerImages={bannerImages}
              currentBanner={currentBanner}
            />
          </div>
        )}

        <LatestHeading />

        <LatestListings
          mixedListings={mixedListings}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          currencyMap={currencyMap}
          bannerImages={bannerImages}
          currentBanner={currentBanner}
        />

      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden lg:block">
        <RightSidebar />
      </aside>

    </section>
  );
}