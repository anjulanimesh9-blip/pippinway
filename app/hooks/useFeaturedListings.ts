"use client";

import { useMemo } from "react";
import type { ListingRecord } from "@/lib/types/featured";
import { splitFeaturedAndLatest, type HomeFilters } from "@/lib/filterListings";

export default function useFeaturedListings(
  listings: ListingRecord[],
  filters: HomeFilters
) {
  const { featuredListings, latestListings } = useMemo(
    () => splitFeaturedAndLatest(listings, filters),
    [listings, filters]
  );

  return { featuredListings, latestListings };
}
