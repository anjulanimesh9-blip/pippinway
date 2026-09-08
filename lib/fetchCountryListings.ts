import type { ListingRecord } from "@/lib/types/featured";
import { canonicalCategory, canonicalCountry } from "@/lib/filterListings";

const PROJECT_ID = "pippinway-e9719";
const API_KEY = "AIzaSyDJhlz8ZZ1GZPfFigBPT_eLFicpUECTqRE";

export type ListingRestCursor = {
  createdAt: string;
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

function listingFromRestDocument(
  name: string | undefined,
  fields: Record<string, unknown> | undefined
): ListingRecord | null {
  const id = name?.split("/").pop();
  if (!id || !fields) return null;
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    parsed[key] = firestoreValue(value);
  }
  return { id, ...parsed } as ListingRecord;
}

function createdAtIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

function fieldFilter(fieldPath: string, stringValue: string) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: { stringValue },
    },
  };
}

export const MARKETPLACE_PAGE_SIZE = 16;
const FIRST_PAGE_TIMEOUT_MS = 4000;

export type MarketplaceFirstPage = {
  listings: ListingRecord[];
  cursor: ListingRestCursor | null;
  rawCount: number;
  country: string;
  category: string | null;
};

export async function fetchCountryListingsPage(
  options: {
    country: string;
    category?: string | null;
    limitCount?: number;
    startAfterCreatedAt?: string | null;
    ascending?: boolean;
    skipOrderBy?: boolean;
    signal?: AbortSignal;
    revalidateSeconds?: number;
  }
): Promise<{
  listings: ListingRecord[];
  cursor: ListingRestCursor | null;
  rawCount: number;
}> {
  const canonical = canonicalCountry(options.country);
  if (!canonical) return { listings: [], cursor: null, rawCount: 0 };

  const category = canonicalCategory(options.category ?? null);
  const limitCount = options.limitCount ?? MARKETPLACE_PAGE_SIZE;
  const filters = [fieldFilter("country", canonical)];
  if (category) filters.push(fieldFilter("category", category));

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: "listings" }],
    where:
      filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } },
    limit: limitCount,
  };

  if (!options.skipOrderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: "createdAt" },
        direction: options.ascending ? "ASCENDING" : "DESCENDING",
      },
    ];
  }

  if (!options.skipOrderBy && options.startAfterCreatedAt) {
    structuredQuery.startAt = {
      values: [{ timestampValue: options.startAfterCreatedAt }],
      before: false,
    };
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents:runQuery?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options.signal,
    body: JSON.stringify({ structuredQuery }),
    ...(options.revalidateSeconds
      ? { next: { revalidate: options.revalidateSeconds } }
      : {}),
  });

  if (!response.ok) {
    throw new Error(`Listings REST query failed (${response.status})`);
  }

  const rows = (await response.json()) as Array<{
    document?: { name?: string; fields?: Record<string, unknown> };
  }>;

  const listings = rows
    .map((row) => listingFromRestDocument(row.document?.name, row.document?.fields))
    .filter((listing): listing is ListingRecord => Boolean(listing));

  const lastCreatedAt = createdAtIso(listings[listings.length - 1]?.createdAt);

  return {
    listings,
    cursor: lastCreatedAt ? { createdAt: lastCreatedAt } : null,
    rawCount: listings.length,
  };
}

export async function fetchMarketplaceFirstPage(
  country: string,
  category?: string | null
): Promise<MarketplaceFirstPage | null> {
  const canonical = canonicalCountry(country);
  if (!canonical) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRST_PAGE_TIMEOUT_MS);

  try {
    const page = await fetchCountryListingsPage({
      country: canonical,
      category,
      limitCount: MARKETPLACE_PAGE_SIZE,
      signal: controller.signal,
      revalidateSeconds: 60,
    });
    return {
      listings: page.listings,
      cursor: page.cursor,
      rawCount: page.rawCount,
      country: canonical,
      category: canonicalCategory(category ?? null),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchListingsByCanonicalCountry(
  country: string,
  limitCount = MARKETPLACE_PAGE_SIZE,
  signal?: AbortSignal
): Promise<ListingRecord[]> {
  const page = await fetchCountryListingsPage({
    country,
    limitCount,
    signal,
  });
  return page.listings;
}
