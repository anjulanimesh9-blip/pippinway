"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "pippinway.selectedCountry";

export default function useHomeFilters() {
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountryState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // Same storage key as mobile CountryFilterContext
    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("country");
    if (stored && stored !== "All" && stored !== "All Countries") {
      setSelectedCountryState(stored);
    }
  }, []);

  const setSelectedCountry = (value: string) => {
    setSelectedCountryState(value);
    if (value === "All") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("country");
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  };

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("search") || "");
    const country = searchParams.get("country");
    if (country) setSelectedCountry(country);
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
};
