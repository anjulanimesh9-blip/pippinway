"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { isPermissionDenied } from "@/lib/firestoreErrors";
import { getCreatedAtMs, isLiveListing } from "@/lib/filterListings";
import type { ListingRecord } from "@/lib/types/featured";

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

/** Same filter + sort as mobile app useListings.ts */
function mapListings(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
): ListingRecord[] {
  return docs
    .map((d) => ({ id: d.id, ...d.data() } as ListingRecord))
    .filter((listing) => isApproved(listing) && isLiveListing(listing))
    .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
}

export default function useListings() {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "listings"), where("expired", "==", false)),
      (snapshot) => {
        setListings(mapListings(snapshot.docs));
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (isPermissionDenied(err)) {
          setListings([]);
          setLoading(false);
          setError(null);
          return;
        }
        console.error("useListings error:", err);
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      }
    );

    return unsubscribe;
  }, []);

  return { listings, loading, error };
}
