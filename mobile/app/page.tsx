"use client";

import { useMemo } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/homepage/Hero";
import PromoBanner from "./components/homepage/PromoBanner";
import SearchBar from "./components/homepage/Search/SearchBar";
import HomeContent from "./components/homepage/HomeContent";
import MobileBottomNav from "./components/MobileBottomNav";

import useAuth from "./hooks/useAuth";
import useBanner from "./hooks/useBanner";
import useListings from "./hooks/useListings";
import useFavorites from "./hooks/useFavorites";
import useFeaturedListings from "./hooks/useFeaturedListings";
import useHomeFilters from "./hooks/useHomeFilters";

import bannerImages from "../lib/bannerImages";
import currencyMap from "../lib/currencyMap";

export default function Home() {
  const { user } = useAuth();
  const { listings } = useListings();
  const currentBanner = useBanner();

  const {
    selectedCountry,
    setSelectedCountry,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    sortBy,
    setSortBy,
  } = useHomeFilters();

  const {
    favorites,
    toggleFavorite,
  } = useFavorites(user);

  const filters = useMemo(
    () => ({
      country: selectedCountry,
      category: selectedCategory,
      search,
    }),
    [selectedCountry, selectedCategory, search]
  );

  const { latestListings } = useFeaturedListings(
    listings,
    filters
  );

  const sortedLatest = useMemo(() => {
    const next = [...latestListings];

    if (sortBy === "low-price") {
      next.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sortBy === "high-price") {
      next.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    } else if (sortBy === "oldest") {
      next.reverse();
    }

    return next;
  }, [latestListings, sortBy]);

  return (
    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-0">
      <Navbar />

      <section className="w-full max-w-[1600px] mx-auto py-8 px-4 overflow-visible relative">

        <Hero />

        <PromoBanner />

        <div className="-mt-10 relative z-20 mb-8">
          <SearchBar
            searchTerm={search}
            setSearchTerm={setSearch}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        <HomeContent
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          latestListings={sortedLatest}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          currencyMap={currencyMap}
          bannerImages={bannerImages}
          currentBanner={currentBanner}
        />

      </section>

      <MobileBottomNav />
    </main>
  );
}
