import type { ListingRecord } from "@/lib/types/featured";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";

export type HomeFilters = {
  country?: string;
  category?: string;
  search?: string;
  location?: string;
};

/** Exact country match — same as mobile HomeScreen countryFilteredListings */
function matchesCountry(listing: ListingRecord, country?: string) {
  if (!country || country === "All" || country === "All Countries") return true;
  return (listing.country ?? "") === country;
}

function matchesCategory(listing: ListingRecord, category?: string) {
  if (!category || category === "All") return true;
  return (listing.category ?? "").toLowerCase() === category.toLowerCase();
}

function matchesSearch(listing: ListingRecord, search?: string) {
  if (!search?.trim()) return true;
  const q = search.trim().toLowerCase();
  return (
    (listing.title ?? "").toLowerCase().includes(q) ||
    (listing.location ?? "").toLowerCase().includes(q) ||
    (listing.category ?? "").toLowerCase().includes(q)
  );
}

function matchesLocation(listing: ListingRecord, location?: string) {
  if (!location?.trim()) return true;
  const q = location.trim().toLowerCase();
  return (listing.location ?? "").toLowerCase().includes(q);
}

export function applyHomeFilters(
  listings: ListingRecord[],
  filters: HomeFilters
): ListingRecord[] {
  return listings.filter(
    (listing) =>
      matchesCountry(listing, filters.country) &&
      matchesCategory(listing, filters.category) &&
      matchesSearch(listing, filters.search) &&
      matchesLocation(listing, filters.location)
  );
}

export function splitFeaturedAndLatest(
  listings: ListingRecord[],
  filters: HomeFilters
) {
  const filtered = applyHomeFilters(listings, filters);
  const featuredListings = filtered.filter(isActiveFeaturedListing);
  // Match mobile: all country-filtered listings appear in Latest Ads feed
  const latestListings = filtered;
  return { featuredListings, latestListings };
}

export function getCreatedAtMs(listing: ListingRecord): number {
  const createdAt = listing.createdAt;
  if (!createdAt) return 0;
  if (typeof (createdAt as { toMillis?: () => number }).toMillis === "function") {
    return (createdAt as { toMillis: () => number }).toMillis();
  }
  if (typeof (createdAt as { seconds?: number }).seconds === "number") {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  return 0;
}
