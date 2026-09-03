"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { persistSelectedCountry } from "@/lib/countries";
import { canonicalCountry, isAllFilterValue } from "@/lib/filterListings";

export default function useHomeFilters(routeCountry?: string) {
  const searchParams = useSearchParams();
  const initialCountry = canonicalCountry(routeCountry) ?? "All";

  const [selectedCountry, setSelectedCountryState] = useState(initialCountry);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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
    const categoryParam = searchParams.get("category");
    setSelectedCategory(
      isAllFilterValue(categoryParam) ? "All" : categoryParam || "All"
    );
    setSearch(searchParams.get("search") || "");

    if (!routeCountry) {
      const countryParam = searchParams.get("country");
      if (countryParam) setSelectedCountry(countryParam);
    }
  }, [searchParams, routeCountry]);

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
