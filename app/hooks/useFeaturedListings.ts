"use client";

import { useMemo } from "react";
import type { ListingRecord } from "@/lib/types/featured";
import { applyHomeFilters, type HomeFilters } from "@/lib/filterListings";

export default function useFeaturedListings(
  listings: ListingRecord[],
  filters: HomeFilters
) {
  const latestListings = useMemo(
    () => applyHomeFilters(listings, filters),
    [listings, filters]
  );

  return { latestListings };
}
