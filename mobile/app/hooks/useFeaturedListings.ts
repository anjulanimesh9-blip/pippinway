"use client";

import { useMemo } from "react";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";

export default function useFeaturedListings(listings: any[]) {
  const featuredListings = useMemo(
    () => listings.filter(isActiveFeaturedListing),
    [listings]
  );

  return {
    featuredListings,
  };
}
