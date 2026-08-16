"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { ListingRecord } from "@/lib/types/featured";

export default function useSellerListings(user: User | null) {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "listings"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setListings(
          snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() } as ListingRecord))
            .sort((a, b) => {
              const toMs = (v: unknown) => {
                if (!v) return 0;
                if (typeof (v as { seconds?: number }).seconds === "number") {
                  return (v as { seconds: number }).seconds * 1000;
                }
                return new Date(v as string).getTime() || 0;
              };
              return toMs(b.createdAt) - toMs(a.createdAt);
            })
        );
        setLoading(false);
      },
      (err) => {
        console.error("useSellerListings error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  return { listings, loading };
}
