"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { fetchListingsByCanonicalCountry } from "@/lib/fetchCountryListings";
import { isPermissionDenied } from "@/lib/firestoreErrors";
import { canonicalCountry, getCreatedAtMs, isLiveListing } from "@/lib/filterListings";
import type { ListingRecord } from "@/lib/types/featured";

export const HOME_LATEST_LIMIT = 80;
export const HOME_PAGE_SIZE = 20;
export const HOME_FALLBACK_LIMIT = 80;
export const HOME_COUNTRY_LIMIT = 80;

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

function toListing(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
): ListingRecord[] {
  return docs.map((d) => ({ id: d.id, ...d.data() } as ListingRecord));
}

function liveListings(latest: ListingRecord[]): ListingRecord[] {
  return latest
    .filter((listing) => isApproved(listing) && isLiveListing(listing))
    .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("listings-timeout")), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function countryQuery(canonical: string) {
  return query(
    collection(db, "listings"),
    where("country", "==", canonical),
    limit(HOME_COUNTRY_LIMIT)
  );
}

function latestPrimaryQuery() {
  return query(
    collection(db, "listings"),
    where("approved", "==", true),
    orderBy("createdAt", "desc"),
    limit(HOME_LATEST_LIMIT)
  );
}

function latestFallbackQuery() {
  return query(
    collection(db, "listings"),
    orderBy("createdAt", "desc"),
    limit(HOME_FALLBACK_LIMIT)
  );
}

export default function useListings(
  routeCountry?: string,
  reloadKey = 0
) {
  const canonical = canonicalCountry(routeCountry);
  const [latest, setLatest] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let received = false;
    const restAbort = new AbortController();
    setLatest([]);
    setLoading(true);
    setError(null);

    const applyLatest = (rows: ListingRecord[]) => {
      if (cancelled) return;
      received = true;
      setLatest(rows);
      setLoading(false);
      setError(null);
    };

    const applyDocs = (
      docs: Array<{ id: string; data: () => Record<string, unknown> }>
    ) => applyLatest(toListing(docs));

    const failLatest = (err: unknown) => {
      if (cancelled || received) return;
      setLoading(false);
      if (isPermissionDenied(err)) {
        setLatest([]);
        setError(null);
        return;
      }
      console.error("useListings error:", err);
      setError("Could not load listings. Check your connection and refresh.");
    };

    async function loadLatest() {
      if (canonical) {
        try {
          const snap = await withTimeout(getDocs(countryQuery(canonical)), 6000);
          applyDocs(snap.docs);
          return;
        } catch {
          try {
            const rows = await fetchListingsByCanonicalCountry(
              canonical,
              HOME_COUNTRY_LIMIT,
              restAbort.signal
            );
            applyLatest(rows);
            return;
          } catch (restError) {
            if (cancelled || restAbort.signal.aborted) return;
            failLatest(restError);
            return;
          }
        }
      }

      if (cancelled) return;

      try {
        const snap = await withTimeout(getDocs(latestPrimaryQuery()), 6000);
        applyDocs(snap.docs);
      } catch (primaryError) {
        try {
          const snap = await withTimeout(getDocs(latestFallbackQuery()), 6000);
          applyDocs(snap.docs);
        } catch (fallbackError) {
          failLatest(fallbackError ?? primaryError);
        }
      }
    }

    void loadLatest();

    const timeout = window.setTimeout(() => {
      if (!cancelled && !received) {
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      }
    }, 10000);

    return () => {
      cancelled = true;
      restAbort.abort();
      window.clearTimeout(timeout);
    };
  }, [canonical, reloadKey]);

  const listings = useMemo(() => liveListings(latest), [latest]);

  return { listings, loading, error };
}
