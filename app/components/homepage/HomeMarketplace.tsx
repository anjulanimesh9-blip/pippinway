"use client";

import { useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import SearchBar from "@/app/components/homepage/Search/SearchBar";
import HomeContent from "@/app/components/homepage/HomeContent";
import useAuth from "@/app/hooks/useAuth";
import useListings from "@/app/hooks/useListings";
import useFavorites from "@/app/hooks/useFavorites";
import useFeaturedListings from "@/app/hooks/useFeaturedListings";
import useHomeFilters from "@/app/hooks/useHomeFilters";
import useBanners from "@/app/hooks/useBanners";
import { parseListingPrice } from "@/lib/formatPrice";

export default function HomeMarketplace() {
  const { user } = useAuth();
  const { listings, loading, error } = useListings();
  const {
    selectedCountry,
    setSelectedCountry,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    location,
    setLocation,
    sortBy,
    setSortBy,
  } = useHomeFilters();
  const { favorites, toggleFavorite } = useFavorites(user);

  const filters = useMemo(
    () => ({
      country: selectedCountry,
      category: selectedCategory,
      search,
      location,
    }),
    [selectedCountry, selectedCategory, search, location]
  );

  const { latestListings } = useFeaturedListings(listings, filters);
  const { banners } = useBanners(selectedCountry);

  const sortedLatest = useMemo(() => {
    const next = [...latestListings];
    if (sortBy === "low-price") {
      next.sort(
        (a, b) =>
          parseListingPrice(a.price ?? a.amount) -
          parseListingPrice(b.price ?? b.amount)
      );
    } else if (sortBy === "high-price") {
      next.sort(
        (a, b) =>
          parseListingPrice(b.price ?? b.amount) -
          parseListingPrice(a.price ?? a.amount)
      );
    } else if (sortBy === "oldest") {
      next.reverse();
    }
    return next;
  }, [latestListings, sortBy]);

  return (
    <>
      <Navbar />
      <section className="mx-auto w-full max-w-[1600px] px-4 py-5">
        <SearchBar
          searchTerm={search}
          setSearchTerm={setSearch}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          location={location}
          setLocation={setLocation}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {error && (
          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <HomeContent
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          latestListings={sortedLatest}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          banners={banners}
          loading={loading}
          totalCount={listings.length}
          filterKey={`${selectedCountry}|${selectedCategory}|${search}|${location}|${sortBy}`}
        />
      </section>
    </>
  );
}
