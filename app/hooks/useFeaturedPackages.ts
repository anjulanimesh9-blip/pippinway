"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { FeaturedPackage } from "@/lib/types/featured";
import { toMillis } from "@/lib/featuredPackageUtils";

export default function useFeaturedPackages() {
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "featured_packages"), where("active", "==", true)),
      (snapshot) => {
        setPackages(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeaturedPackage))
        );
        setLoading(false);
      },
      (err) => {
        console.error("useFeaturedPackages error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const namedPackages = useMemo(
    () =>
      packages
        .filter((p) => !!p.name)
        .sort((a, b) => {
          const orderA = a.displayOrder ?? Infinity;
          const orderB = b.displayOrder ?? Infinity;
          if (orderA !== orderB) return orderA - orderB;
          return toMillis(a.createdAt) - toMillis(b.createdAt);
        }),
    [packages]
  );

  const legacyPackages = useMemo(
    () =>
      packages
        .filter((p) => !p.name && !!p.country)
        .sort((a, b) => (a.country ?? "").localeCompare(b.country ?? "")),
    [packages]
  );

  return { namedPackages, legacyPackages, loading };
}
