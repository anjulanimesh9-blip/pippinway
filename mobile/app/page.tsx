"use client";

import { useEffect, useState } from "react";

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

  const { featuredListings } = useFeaturedListings(listings);

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
          featuredListings={featuredListings}
          latestListings={listings}
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