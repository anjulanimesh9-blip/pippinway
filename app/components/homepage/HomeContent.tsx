"use client";

import CategoryFilter from "./CategoryFilter";
import FeaturedBanner from "./FeaturedBanner";
import FeaturedAds from "./FeaturedAds/FeaturedAds";
import LatestListings from "./LatestAds/LatestListings";
import LatestHeading from "./LatestAds/LatestHeading";
import CategorySidebar from "./CategorySidebar";
import RightSidebar from "./RightSidebar";

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
    <>
     
{/* Main Layout */}
<div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_260px] gap-6 mt-6">

  {/* LEFT SIDEBAR */}
  <aside className="hidden lg:block self-start">
    <div className="sticky top-24">
      <CategorySidebar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  </aside>

  {/* CENTER */}
  <main className="min-w-0">

    {/* Category Filter */}
    <div className="mb-6">
      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>

    {/* Featured Banner */}
    <div className="mb-6">
      <FeaturedBanner />
    </div>

    {/* Desktop Featured Ads */}
    <div className="hidden lg:block mb-8">
      <FeaturedAds
        listings={featuredListings}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        currencyMap={currencyMap}
      />
    </div>

    {/* Mobile Featured Ads */}
    <div className="lg:hidden mb-8">
      <FeaturedAds
        listings={featuredListings}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        currencyMap={currencyMap}
      />
    </div>

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
  <aside className="hidden lg:block self-start">
    <div className="sticky top-24">
      <RightSidebar />
    </div>
  </aside>

</div>

    </>
  );
}