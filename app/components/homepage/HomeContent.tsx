"use client";



import FeaturedAds from "./FeaturedAds/FeaturedAds";

import LatestListings from "./LatestAds/LatestListings";

import LatestHeading from "./LatestAds/LatestHeading";

import CategorySidebar from "./CategorySidebar";

import CategoryFilter from "./CategoryFilter";

import RightSidebar from "./RightSidebar";

import TrustBadges from "./TrustBadges";

import type { Banner, ListingRecord } from "@/lib/types/featured";



type Props = {

  selectedCategory: string;

  setSelectedCategory: (value: string) => void;

  featuredListings: ListingRecord[];

  latestListings: ListingRecord[];

  favorites: string[];

  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;

  currencyMap: Record<string, string>;

  currentBanner: Banner | null;

  pickBanner: (slotIndex: number) => Banner | null;

  loading?: boolean;

  totalCount?: number;

};



export default function HomeContent({

  selectedCategory,

  setSelectedCategory,

  featuredListings,

  latestListings,

  favorites,

  toggleFavorite,

  currencyMap,

  currentBanner,

  pickBanner,

  loading = false,

  totalCount = 0,

}: Props) {

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



          <FeaturedAds

            listings={featuredListings}

            favorites={favorites}

            toggleFavorite={toggleFavorite}

            currencyMap={currencyMap}

            loading={loading}

          />



          <LatestHeading count={latestListings.length} />



          <LatestListings

            latestListings={latestListings}

            favorites={favorites}

            toggleFavorite={toggleFavorite}

            pickBanner={pickBanner}

            loading={loading}

            totalLive={totalCount}

          />

        </main>



        <aside className="hidden lg:block self-start">

          <div className="sticky top-24">

            <RightSidebar currentBanner={currentBanner} />

          </div>

        </aside>

      </div>



      <TrustBadges />

    </>

  );

}


