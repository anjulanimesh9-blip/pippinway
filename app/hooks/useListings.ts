"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { ListingRecord } from "@/lib/types/featured";

function getCreatedAtMs(listing: ListingRecord): number {
  const createdAt = listing.createdAt;
  if (!createdAt) return 0;
  if (typeof (createdAt as { toMillis?: () => number }).toMillis === "function") {
    return (createdAt as { toMillis: () => number }).toMillis();
  }
  if (typeof (createdAt as { seconds?: number }).seconds === "number") {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

function isExpired(listing: ListingRecord): boolean {
  const value = listing.expired as unknown;
  return value === true || value === "true" || value === 1;
}

/** Same filter + sort as mobile app useListings.ts */
function mapListings(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
): ListingRecord[] {
  return docs
    .map((d) => ({ id: d.id, ...d.data() } as ListingRecord))
    .filter((listing) => isApproved(listing) && !isExpired(listing))
    .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
}

export default function useListings() {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "listings"),
      (snapshot) => {
        setListings(mapListings(snapshot.docs));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useListings error:", err);
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      }
    );

    return unsubscribe;
  }, []);

  return { listings, loading, error };
}
