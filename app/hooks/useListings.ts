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
import { isPermissionDenied } from "@/lib/firestoreErrors";
import { getCreatedAtMs, isLiveListing } from "@/lib/filterListings";
import type { ListingRecord } from "@/lib/types/featured";

export const HOME_LATEST_LIMIT = 80;
export const HOME_PAGE_SIZE = 20;
export const HOME_FEATURED_LIMIT = 24;
export const HOME_FALLBACK_LIMIT = 120;

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

export default function useListings() {
  const [latest, setLatest] = useState<ListingRecord[]>([]);
  const [featured, setFeatured] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applyLatest = (
      docs: Array<{ id: string; data: () => Record<string, unknown> }>
    ) => {
      if (cancelled) return;
      setLatest(toListing(docs));
      setLoading(false);
      setError(null);
    };

    const failLatest = (err: unknown) => {
      if (cancelled) return;
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
      try {
        const snap = await getDocs(latestPrimaryQuery());
        applyLatest(snap.docs);
        return "primary" as const;
      } catch (primaryError) {
        try {
          const snap = await getDocs(latestFallbackQuery());
          applyLatest(snap.docs);
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
      if (cancelled || mode === "failed") return;

      const liveQuery =
        mode === "primary" ? latestPrimaryQuery() : latestFallbackQuery();

      unsubscribeLatest = onSnapshot(
        liveQuery,
        (snapshot) => applyLatest(snapshot.docs),
        (err) => {
          if (mode === "primary") {
            unsubscribeLatest();
            unsubscribeLatest = onSnapshot(
              latestFallbackQuery(),
              (snapshot) => applyLatest(snapshot.docs),
              failLatest
            );
            return;
          }
          failLatest(err);
        }
      );
    });

    const timeout = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 10000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      unsubscribeLatest();
      unsubscribeFeatured();
    };
  }, []);

  const listings = useMemo(
    () => mergeLiveListings(latest, featured),
    [latest, featured]
  );

  return { listings, loading, error };
}
