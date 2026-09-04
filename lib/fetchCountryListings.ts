import type { ListingRecord } from "@/lib/types/featured";
import { canonicalCountry } from "@/lib/filterListings";

const PROJECT_ID = "pippinway-e9719";
const API_KEY = "AIzaSyDJhlz8ZZ1GZPfFigBPT_eLFicpUECTqRE";

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

export async function fetchListingsByCanonicalCountry(
  country: string,
  limitCount = 200
): Promise<ListingRecord[]> {
  const canonical = canonicalCountry(country);
  if (!canonical) return [];

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents:runQuery?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "listings" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "country" },
            op: "EQUAL",
            value: { stringValue: canonical },
          },
        },
        limit: limitCount,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Listings REST query failed (${response.status})`);
  }

  const rows = (await response.json()) as Array<{
    document?: { name?: string; fields?: Record<string, unknown> };
  }>;

  return rows
    .map((row) => listingFromRestDocument(row.document?.name, row.document?.fields))
    .filter((listing): listing is ListingRecord => Boolean(listing));
}
