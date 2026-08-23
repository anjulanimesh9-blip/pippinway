"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

import Navbar from "./components/Navbar";
import HeroSection from "./components/homepage/Hero";
import SearchFilters from "./components/homepage/SearchFilters";
import FeaturedSlider from "./components/homepage/FeaturedSlider";
import CategorySidebar from "./components/homepage/CategorySidebar";
import ListingGrid from "./components/homepage/ListingGrid";
import RightBanner from "./components/RightBanner";
import BrowseCategory from "./components/BrowseCategory";
import BrowseCountry from "./components/BrowseCountry";
import WhyChoose from "./components/WhyChoose";
import Footer from "./components/Footer";
import type { MarketplaceFilters, MarketplaceListing } from "./components/marketplaceTypes";
import { countries, isVisibleListing } from "./components/marketplaceTypes";

const emptyFilters: MarketplaceFilters = {
  search: "",
  category: "",
  country: "",
  location: "",
};

const timestampToMillis = (value: MarketplaceListing["createdAt"]) => {
  if (!value) {
    return 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return new Date(value).getTime() || 0;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
};

const matchesFilters = (listing: MarketplaceListing, filters: MarketplaceFilters) => {
  const search = filters.search.trim().toLowerCase();
  const searchableText = [
    listing.title,
    listing.category,
    listing.country,
    listing.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (search && !searchableText.includes(search)) {
    return false;
  }

  if (filters.country && listing.country !== filters.country) {
    return false;
  }

  if (filters.category && listing.category !== filters.category) {
    return false;
  }

  if (filters.location && listing.location !== filters.location) {
    return false;
  }

  return true;
};

const countByField = (
  listings: MarketplaceListing[],
  field: "category" | "country"
) =>
  listings.reduce<Record<string, number>>((counts, listing) => {
    const key = listing[field];

    if (!key) {
      return counts;
    }

    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<MarketplaceFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "listings"),
      (snapshot) => {
        const nextListings = snapshot.docs
          .map((listingDoc) => ({
            id: listingDoc.id,
            ...listingDoc.data(),
          })) as MarketplaceListing[];

        setListings(
          nextListings
            .filter(isVisibleListing)
            .sort((first, second) => timestampToMillis(second.createdAt) - timestampToMillis(first.createdAt))
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "favorites"), (snapshot) => {
      setFavoriteIds(new Set(snapshot.docs.map((favoriteDoc) => favoriteDoc.id)));
    });

    return () => unsubscribe();
  }, [user]);

  const filteredListings = useMemo(
    () => listings.filter((listing) => matchesFilters(listing, filters)),
    [listings, filters]
  );

  const featuredListings = useMemo(
    () => filteredListings.filter((listing) => listing.featured === true),
    [filteredListings]
  );

  const locations = useMemo(() => {
    const scopedListings = listings.filter((listing) => {
      if (filters.country && listing.country !== filters.country) {
        return false;
      }

      if (filters.category && listing.category !== filters.category) {
        return false;
      }

      return true;
    });

    return Array.from(
      new Set(scopedListings.map((listing) => listing.location).filter(Boolean) as string[])
    ).sort((first, second) => first.localeCompare(second));
  }, [listings, filters.category, filters.country]);

  const categoryCounts = useMemo(() => countByField(listings, "category"), [listings]);
  const countryCounts = useMemo(() => countByField(listings, "country"), [listings]);

  const activeCountryLabel =
    countries.find((country) => country.value === filters.country)?.label || filters.country;

  const updateFilters = (nextFilters: MarketplaceFilters) => {
    setFilters(nextFilters);
  };

  const selectCategory = (category: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      category,
    }));
  };

  const selectCountry = (country: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      country,
      location: "",
    }));
  };

  const quickSearch = (value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      search: value,
    }));
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const favoriteRef = doc(db, "users", user.uid, "favorites", listingId);

    if (favoriteIds.has(listingId)) {
      await deleteDoc(favoriteRef);
      return;
    }

    await setDoc(favoriteRef, {
      listingId,
      createdAt: new Date(),
    });
  };
return (
  <main className="min-h-screen bg-[#030712] text-white">
    <Navbar />

    <SearchFilters
      filters={filters}
      locations={locations}
      onChange={updateFilters}
    />

    <HeroSection />

    <FeaturedSlider
      listings={featuredListings}
      favoriteIds={favoriteIds}
      onToggleFavorite={toggleFavorite}
    />

    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[240px_minmax(0,1fr)_324px]">
      <CategorySidebar
        selectedCategory={filters.category}
        counts={categoryCounts}
        onSelectCategory={selectCategory}
      />

      <ListingGrid
        listings={filteredListings}
        favoriteIds={favoriteIds}
        loading={loading}
        onToggleFavorite={toggleFavorite}
      />

      <RightBanner />
    </section>

    <BrowseCategory
      counts={categoryCounts}
      selectedCategory={filters.category}
      onSelectCategory={selectCategory}
    />

    <BrowseCountry
      counts={countryCounts}
      selectedCountry={filters.country}
      onSelectCountry={selectCountry}
    />

    <WhyChoose />

    <Footer />
  </main>
);
  
}
