"use client";



import { Suspense, useMemo } from "react";



import Navbar from "./components/Navbar";

import SearchBar from "./components/homepage/Search/SearchBar";

import HomeContent from "./components/homepage/HomeContent";
import Footer from "./components/homepage/Footer/Footer";

import MobileBottomNav from "./components/MobileBottomNav";



import useAuth from "./hooks/useAuth";

import useListings from "./hooks/useListings";

import useFavorites from "./hooks/useFavorites";

import useFeaturedListings from "./hooks/useFeaturedListings";

import useHomeFilters from "./hooks/useHomeFilters";

import useBanners from "./hooks/useBanners";
import { parseListingPrice } from "@/lib/formatPrice";



function HomePage() {

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



  const { latestListings } = useFeaturedListings(

    listings,

    filters

  );


  const { banners } = useBanners(selectedCountry);



  const sortedLatest = useMemo(() => {

    const next = [...latestListings];

    if (sortBy === "low-price") {

      next.sort(
        (a, b) => parseListingPrice(a.price ?? a.amount) - parseListingPrice(b.price ?? b.amount)
      );

    } else if (sortBy === "high-price") {

      next.sort(
        (a, b) => parseListingPrice(b.price ?? b.amount) - parseListingPrice(a.price ?? a.amount)
      );

    } else if (sortBy === "oldest") {

      next.reverse();

    }

    return next;

  }, [latestListings, sortBy]);



  return (

    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-8">

      <Navbar />



      <section className="w-full max-w-[1600px] mx-auto px-4 py-5">

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

      <Footer />

      <MobileBottomNav />

    </main>

  );

}



export default function Home() {

  return (

    <Suspense

      fallback={

        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">

          Loading marketplace...

        </div>

      }

    >

      <HomePage />

    </Suspense>

  );

}


