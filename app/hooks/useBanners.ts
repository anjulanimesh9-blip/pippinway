"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { Banner } from "@/lib/types/featured";

const ELIGIBILITY_RECHECK_MS = 30000;
export const BANNER_ROTATION_MS = 5000;

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function useBanners(selectedCountry: string | null) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "banners"),
      (snapshot) => {
        setBanners(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner)));
        setLoading(false);
      },
      (err) => {
        console.error("useBanners error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), ELIGIBILITY_RECHECK_MS);
    return () => clearInterval(timer);
  }, []);

  const eligible = useMemo(() => {
    const now = Date.now();
    return banners
      .filter((b) => {
        if (!b.active) return false;
        const start = toMillis(b.startDate);
        const end = toMillis(b.endDate);
        if (start && now < start) return false;
        if (end && now > end + 24 * 60 * 60 * 1000 - 1) return false;
        if (
          b.country &&
          b.country !== "All" &&
          selectedCountry &&
          selectedCountry !== "All" &&
          selectedCountry !== "All Countries" &&
          b.country !== selectedCountry
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0));
  }, [banners, selectedCountry, nowTick]);

  return { banners: eligible, loading };
}
