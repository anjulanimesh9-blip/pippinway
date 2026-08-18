"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { canonicalCountry, isAllFilterValue } from "@/lib/filterListings";

const STORAGE_KEY = "pippinway.selectedCountry";

export default function useHomeFilters() {
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountryState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const setSelectedCountry = (value: string) => {
    const next = canonicalCountry(value) ?? "All";
    setSelectedCountryState(next);
    if (next === "All") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("country");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  useEffect(() => {
    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("country");
    const next = canonicalCountry(stored);
    if (next) setSelectedCountryState(next);
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setSelectedCategory(
      isAllFilterValue(categoryParam) ? "All" : categoryParam || "All"
    );
    setSearch(searchParams.get("search") || "");

    const countryParam = searchParams.get("country");
    if (countryParam) {
      setSelectedCountry(countryParam);
    }
  }, [searchParams]);

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
