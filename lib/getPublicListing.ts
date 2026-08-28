import { cache } from "react";
import { isLiveListing } from "@/lib/filterListings";

const PROJECT_ID = "pippinway-e9719";
const API_KEY = "AIzaSyDJhlz8ZZ1GZPfFigBPT_eLFicpUECTqRE";

export type PublicListingFields = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  country?: string;
  imageUrl?: string;
  imageUrls?: string[];
  approved?: boolean;
  expired?: boolean;
  expiresAt?: unknown;
  publishedAt?: unknown;
  createdAt?: unknown;
  price?: unknown;
  amount?: unknown;
};

function firestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  if ("stringValue" in rec) return rec.stringValue;
  if ("integerValue" in rec) return Number(rec.integerValue);
  if ("doubleValue" in rec) return rec.doubleValue;
  if ("booleanValue" in rec) return rec.booleanValue;
  if ("timestampValue" in rec) return rec.timestampValue;
  if ("nullValue" in rec) return null;
  if ("arrayValue" in rec) {
    const values = (rec.arrayValue as { values?: unknown[] } | undefined)?.values;
    return Array.isArray(values) ? values.map(firestoreValue) : [];
  }
  if ("mapValue" in rec) {
    const fields = (rec.mapValue as { fields?: Record<string, unknown> }).fields;
    if (!fields) return {};
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(fields)) {
      out[key] = firestoreValue(nested);
    }
    return out;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const urls = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
  return urls.length > 0 ? urls : undefined;
}

export function isPublicListing(listing: PublicListingFields): boolean {
  return listing.approved === true && isLiveListing(listing);
}

export const getPublicListingBySlug = cache(
  async (slug: string): Promise<PublicListingFields | null> => {
    if (!slug) return null;

    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
      `/databases/(default)/documents/listings/${encodeURIComponent(slug)}` +
      `?key=${API_KEY}`;

    try {
      const response = await fetch(url, { next: { revalidate: 300 } });
      if (!response.ok) return null;

      const payload = (await response.json()) as {
        fields?: Record<string, unknown>;
      };
      const fields = payload.fields;
      if (!fields) return null;

      const parsed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        parsed[key] = firestoreValue(value);
      }

      return {
        id: slug,
        title: asString(parsed.title),
        description: asString(parsed.description),
        category: asString(parsed.category),
        location: asString(parsed.location),
        country: asString(parsed.country),
        imageUrl: asString(parsed.imageUrl),
        imageUrls: asStringArray(parsed.imageUrls),
        approved: parsed.approved === true,
        expired: parsed.expired === true || parsed.expired === "true",
        expiresAt: parsed.expiresAt,
        publishedAt: parsed.publishedAt,
        createdAt: parsed.createdAt,
        price: parsed.price,
        amount: parsed.amount,
      };
    } catch {
      return null;
    }
  }
);
