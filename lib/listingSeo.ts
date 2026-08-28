import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  isPublicListing,
  type PublicListingFields,
} from "@/lib/getPublicListing";

function firstHttpImage(listing: PublicListingFields): string | undefined {
  const candidates = [
    ...(listing.imageUrls ?? []),
    listing.imageUrl,
  ].filter((value): value is string => Boolean(value));

  return candidates.find(
    (url) => url.startsWith("https://") || url.startsWith("http://")
  );
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function listingCanonical(slug: string): string {
  return `${SITE_URL}/listings/${encodeURIComponent(slug)}`;
}

export function listingMetaDescription(
  listing: PublicListingFields | null
): string | undefined {
  if (!listing) return undefined;

  const place = [listing.location, listing.country].filter(Boolean).join(", ");
  const bits = [
    listing.title,
    listing.category ? `${listing.category} listing` : null,
    place ? `in ${place}` : null,
  ].filter(Boolean) as string[];

  const lead = bits.join(" — ");
  if (listing.description) {
    const combined = lead
      ? `${lead}. ${listing.description}`
      : listing.description;
    return clip(combined.replace(/\s+/g, " ").trim(), 160);
  }
  return lead ? clip(lead, 160) : undefined;
}

export function listingMetadata(
  slug: string,
  listing: PublicListingFields | null
): Metadata {
  const canonical = listingCanonical(slug);
  const publicListing = listing ? isPublicListing(listing) : false;

  if (!listing || !publicListing) {
    return {
      title: "Listing",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const title = listing.title?.trim() || "Listing";
  const description =
    listingMetaDescription(listing) ||
    `${title} on ${SITE_NAME}, a classified marketplace.`;
  const image = firstHttpImage(listing);

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function listingJsonLd(
  slug: string,
  listing: PublicListingFields | null
): Record<string, unknown> | null {
  if (!listing || !isPublicListing(listing)) return null;

  const name = listing.title?.trim();
  if (!name) return null;

  const description = listingMetaDescription(listing);
  const image = firstHttpImage(listing);
  const url = listingCanonical(slug);

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
  };

  if (description) product.description = description;
  if (image) product.image = image;

  return product;
}

export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
