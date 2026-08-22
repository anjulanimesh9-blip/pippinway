"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getCreatedAtMs, isLiveListing } from "@/lib/filterListings";

export default function useListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, "listings"),
          where("expired", "==", false)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (listing: any) =>
              listing.approved === true &&
              isLiveListing(listing)
          )
          .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));

        setListings(data);
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