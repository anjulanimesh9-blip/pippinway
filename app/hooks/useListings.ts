"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
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

export default function useListings() {
  const [latest, setLatest] = useState<ListingRecord[]>([]);
  const [featured, setFeatured] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderByCreatedAt, setOrderByCreatedAt] = useState(true);

  useEffect(() => {
    const latestQuery = orderByCreatedAt
      ? query(
          collection(db, "listings"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(HOME_LATEST_LIMIT)
        )
      : query(
          collection(db, "listings"),
          orderBy("createdAt", "desc"),
          limit(HOME_FALLBACK_LIMIT)
        );

    const unsubscribeLatest = onSnapshot(
      latestQuery,
      (snapshot) => {
        setLatest(toListing(snapshot.docs));
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (orderByCreatedAt) {
          setOrderByCreatedAt(false);
          return;
        }
        if (isPermissionDenied(err)) {
          setLatest([]);
          setLoading(false);
          setError(null);
          return;
        }
        console.error("useListings error:", err);
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      }
    );

    const unsubscribeFeatured = onSnapshot(
      query(
        collection(db, "listings"),
        where("featured", "==", true),
        limit(HOME_FEATURED_LIMIT)
      ),
      (snapshot) => {
        setFeatured(toListing(snapshot.docs));
      },
      (err) => {
        if (isPermissionDenied(err)) {
          setFeatured([]);
          return;
        }
        console.error("useListings featured error:", err);
        setFeatured([]);
      }
    );

    return () => {
      unsubscribeLatest();
      unsubscribeFeatured();
    };
  }, [orderByCreatedAt]);

  const listings = useMemo(
    () => mergeLiveListings(latest, featured),
    [latest, featured]
  );

  return { listings, loading, error };
}
