import type { ListingRecord } from "@/lib/types/featured";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import {
  HOME_COUNTRIES,
  getCountryByFirestoreValue,
} from "@/lib/countries";

export { HOME_COUNTRIES };

export type HomeFilters = {
  country?: string;
  category?: string;
  search?: string;
  location?: string;
};

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

/** Canonical English Firestore country. Never a translated UI label. */
export function canonicalCountry(value?: string | null): string | null {
  if (isAllFilterValue(value)) return null;
  return getCountryByFirestoreValue(value)?.firestoreValue ?? null;
}

export const CANONICAL_CATEGORIES = [
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
  "Animals",
  "Furniture",
  "Education",
  "Other",
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

/** Canonical English Firestore category. Unknown/translated values do not filter. */
export function canonicalCategory(value?: string | null): string | null {
  if (isAllFilterValue(value) || !value?.trim()) return null;
  const needle = value.trim().toLowerCase();
  return CANONICAL_CATEGORIES.find((category) => category.toLowerCase() === needle) ?? null;
}

function matchesCountry(listing: ListingRecord, country?: string) {
  const selected = canonicalCountry(country);
  if (!selected) return true;
  const listingCountry = canonicalCountry(listing.country);
  if (listingCountry) return listingCountry === selected;
  return (listing.country ?? "").trim().toLowerCase() === selected.toLowerCase();
}

function matchesCategory(listing: ListingRecord, category?: string) {
  const selected = canonicalCategory(category);
  if (!selected) return true;
  const listingCategory = canonicalCategory(listing.category);
  if (listingCategory) return listingCategory === selected;
  return (listing.category ?? "").trim().toLowerCase() === selected.toLowerCase();
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

export const LISTING_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function getTimestampMs(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  const parsed = new Date(value as string | number).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

type ListingExpiryFields = {
  expired?: unknown;
  expiresAt?: unknown;
  publishedAt?: unknown;
  createdAt?: unknown;
};

export function isListingFlaggedExpired(listing: ListingExpiryFields): boolean {
  const value = listing.expired;
  return value === true || value === "true" || value === 1;
}

/** Hide listings that are flagged expired or past createdAt/publishedAt + 30 days. */
export function isLiveListing(listing: ListingExpiryFields): boolean {
  if (isListingFlaggedExpired(listing)) return false;
  const startMs =
    getTimestampMs(listing.publishedAt) || getTimestampMs(listing.createdAt);
  const ageMs = startMs > 0 ? Date.now() - startMs : 0;
  // Brand-new ads stay visible even if expiresAt was written incorrectly.
  if (startMs <= 0 || ageMs < 24 * 60 * 60 * 1000) {
    return true;
  }
  const expiresAtMs = getTimestampMs(listing.expiresAt);
  if (expiresAtMs > 0 && expiresAtMs <= Date.now()) return false;
  if (ageMs >= LISTING_TTL_MS) return false;
  return true;
}

export function applyHomeFilters(
  listings: ListingRecord[],
  filters: HomeFilters
): ListingRecord[] {
  return listings.filter(
    (listing) =>
      isLiveListing(listing) &&
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
  return getTimestampMs(listing.createdAt);
}
