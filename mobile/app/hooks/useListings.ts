"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { getCreatedAtMs, isLiveListing } from "@/lib/filterListings";
import type { ListingRecord } from "@/lib/types/featured";

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

/** Same filter + sort as website app/hooks/useListings.ts */
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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        setListings(mapListings(snapshot.docs));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return {
    listings,
    loading,
  };
}
