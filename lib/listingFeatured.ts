import type { ListingRecord } from "@/lib/types/featured";

export type FeaturedStatus = "normal" | "featured" | "expired";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  if (value instanceof Date) return value;
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? null : d;
}

export function getListingFeaturedExpiry(listing: ListingRecord): Date | null {
  return (
    toDate(listing.featuredExpiryDate) ?? toDate(listing.featuredExpiresAt)
  );
}

/** Same logic as mobile getFeaturedStatus */
export function getFeaturedStatus(listing: ListingRecord): FeaturedStatus {
  if (listing.featured === true) {
    const expiry = getListingFeaturedExpiry(listing);
    if (!expiry) return "featured";
    return expiry.getTime() > Date.now() ? "featured" : "expired";
  }
  if (listing.featuredStartDate) return "expired";
  return "normal";
}

export function isActiveFeaturedListing(listing: ListingRecord): boolean {
  return getFeaturedStatus(listing) === "featured";
}

export function formatFeaturedUntil(listing: ListingRecord): string {
  const expiry = getListingFeaturedExpiry(listing);
  if (!expiry || isNaN(expiry.getTime())) return "";
  return expiry.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
