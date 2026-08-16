"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function useHomeFilters() {
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const country = localStorage.getItem("country");

    if (country) {
      setSelectedCountry(country);
    }
  }, []);

  useEffect(() => {
    setSelectedCategory(
      searchParams.get("category") || "All"
    );
  }, [searchParams]);

  return {
    selectedCountry,
    setSelectedCountry,

    selectedCategory,
    setSelectedCategory,

    search,
    setSearch,

    sortBy,
    setSortBy,
  };
}