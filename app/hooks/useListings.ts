"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
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
export const HOME_FEATURED_LIMIT = 24;
export const HOME_FALLBACK_LIMIT = 120;
export const HOME_COUNTRY_LIMIT = 200;

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

function toListing(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
): ListingRecord[] {
  return docs.map((d) => ({ id: d.id, ...d.data() } as ListingRecord));
}

function mergeLiveListings(
  latest: ListingRecord[],
  featured: ListingRecord[]
): ListingRecord[] {
  const byId = new Map<string, ListingRecord>();
  for (const listing of [...latest, ...featured]) {
    byId.set(listing.id, listing);
  }
  return [...byId.values()]
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

export default function useListings(routeCountry?: string) {
  const canonical = canonicalCountry(routeCountry);
  const [latest, setLatest] = useState<ListingRecord[]>([]);
  const [featured, setFeatured] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let received = false;

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
          const snap = await withTimeout(getDocs(countryQuery(canonical)), 8000);
          applyDocs(snap.docs);
          return "country" as const;
        } catch {
          try {
            const rows = await withTimeout(
              fetchListingsByCanonicalCountry(canonical, HOME_COUNTRY_LIMIT),
              8000
            );
            applyLatest(rows);
            return "rest" as const;
          } catch {
            // Fall through to the global approved query.
          }
        }
      }

      try {
        const snap = await withTimeout(getDocs(latestPrimaryQuery()), 8000);
        applyDocs(snap.docs);
        return "primary" as const;
      } catch (primaryError) {
        try {
          const snap = await withTimeout(getDocs(latestFallbackQuery()), 8000);
          applyDocs(snap.docs);
          return "fallback" as const;
        } catch (fallbackError) {
          failLatest(fallbackError ?? primaryError);
          return "failed" as const;
        }
      }
    }

    const unsubscribeFeatured = onSnapshot(
      query(
        collection(db, "listings"),
        where("featured", "==", true),
        limit(HOME_FEATURED_LIMIT)
      ),
      (snapshot) => {
        if (!cancelled) setFeatured(toListing(snapshot.docs));
      },
      (err) => {
        if (isPermissionDenied(err)) {
          if (!cancelled) setFeatured([]);
          return;
        }
        console.error("useListings featured error:", err);
        if (!cancelled) setFeatured([]);
      }
    );

    let unsubscribeLatest = () => {};

    void loadLatest().then((mode) => {
      if (cancelled || mode === "failed" || mode === "rest") return;

      const liveQuery =
        mode === "country" && canonical
          ? countryQuery(canonical)
          : mode === "primary"
            ? latestPrimaryQuery()
            : latestFallbackQuery();

      unsubscribeLatest = onSnapshot(
        liveQuery,
        (snapshot) => applyDocs(snapshot.docs),
        (err) => {
          if (mode === "country" && canonical) {
            void fetchListingsByCanonicalCountry(canonical, HOME_COUNTRY_LIMIT)
              .then(applyLatest)
              .catch(failLatest);
            return;
          }
          if (mode === "primary") {
            unsubscribeLatest();
            unsubscribeLatest = onSnapshot(
              latestFallbackQuery(),
              (snapshot) => applyDocs(snapshot.docs),
              failLatest
            );
            return;
          }
          failLatest(err);
        }
      );
    });

    const timeout = window.setTimeout(() => {
      if (!cancelled && !received) {
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      }
    }, 12000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      unsubscribeLatest();
      unsubscribeFeatured();
    };
  }, [canonical]);

  const listings = useMemo(
    () => mergeLiveListings(latest, featured),
    [latest, featured]
  );

  return { listings, loading, error };
}
