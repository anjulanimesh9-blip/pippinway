import type { ListingRecord } from "@/lib/types/featured";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";

export type HomeFilters = {
  country?: string;
  category?: string;
  search?: string;
  location?: string;
};

export const HOME_COUNTRIES = [
  "Zimbabwe",
  "Sri Lanka",
  "India",
  "Singapore",
  "United Kingdom",
  "USA",
  "Canada",
  "Thailand",
  "Maldives",
  "South Africa",
] as const;

const ALL_FILTER_VALUES = new Set([
  "",
  "all",
  "all countries",
  "all categories",
  "all locations",
  "all country",
  "any",
]);

export function isAllFilterValue(value?: string | null): boolean {
  if (value == null) return true;
  return ALL_FILTER_VALUES.has(value.trim().toLowerCase());
}

export function canonicalCountry(value?: string | null): string | null {
  if (isAllFilterValue(value)) return null;
  const needle = value!.trim().toLowerCase();
  return HOME_COUNTRIES.find((country) => country.toLowerCase() === needle) ?? null;
}

function matchesCountry(listing: ListingRecord, country?: string) {
  const selected = canonicalCountry(country);
  if (!selected) return true;
  return (listing.country ?? "").trim().toLowerCase() === selected.toLowerCase();
}

function matchesCategory(listing: ListingRecord, category?: string) {
  if (isAllFilterValue(category)) return true;
  return (listing.category ?? "").trim().toLowerCase() === category!.trim().toLowerCase();
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
  if (isAllFilterValue(location) || !location?.trim()) return true;
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
