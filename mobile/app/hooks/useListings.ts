"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function useListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc")
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
              listing.expired !== true
          );

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