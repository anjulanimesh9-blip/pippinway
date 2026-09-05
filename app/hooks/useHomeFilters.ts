"use client";

import { useEffect, useState } from "react";
import { persistSelectedCountry } from "@/lib/countries";
import { canonicalCategory, canonicalCountry } from "@/lib/filterListings";

export default function useHomeFilters(routeCountry?: string) {
  const initialCountry = canonicalCountry(routeCountry) ?? "All";

  const [selectedCountry, setSelectedCountryState] = useState(initialCountry);
  const [selectedCategory, setSelectedCategoryState] = useState("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const setSelectedCategory = (value: string) => {
    setSelectedCategoryState(canonicalCategory(value) ?? "All");
  };

  const setSelectedCountry = (value: string) => {
    const next = canonicalCountry(value) ?? "All";
    setSelectedCountryState(next);
    if (next === "All") {
      localStorage.removeItem("pippinway.selectedCountry");
      localStorage.removeItem("country");
    } else {
      persistSelectedCountry(next);
    }
  };

  useEffect(() => {
    const next = canonicalCountry(routeCountry);
    if (next) {
      setSelectedCountryState(next);
      persistSelectedCountry(next);
    }
  }, [routeCountry]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    setSelectedCategoryState(canonicalCategory(categoryParam) ?? "All");
    setSearch(params.get("search") || "");

    if (!routeCountry) {
      const countryParam = params.get("country");
      if (countryParam) setSelectedCountry(countryParam);
    }
  }, [routeCountry]);

  return {
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
  };
}
