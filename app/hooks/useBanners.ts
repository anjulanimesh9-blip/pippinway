"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { isPermissionDenied } from "@/lib/firestoreErrors";
import { resolveBannerImageUrl } from "@/lib/bannerImages";
import type { Banner, BannerPlacement } from "@/lib/types/featured";

const ELIGIBILITY_RECHECK_MS = 30000;
export const BANNER_ROTATION_MS = 5000;

const KNOWN_PLACEMENTS: BannerPlacement[] = [
  "infeed",
  "sidebar",
  "profile",
  "story-before-choices",
  "signals-free",
  "signals-pro",
  "signals-mobile",
  "unassigned",
];

export function getBannerPlacement(banner: Banner): BannerPlacement {
  if (banner.placement && KNOWN_PLACEMENTS.includes(banner.placement)) {
    return banner.placement;
  }
  return "infeed";
}

/**
 * In-feed: infeed or missing placement (excludes other explicit slots).
 * Profile / sidebar / story: only banners assigned to that placement.
 */
export function bannersForPlacement(
  banners: Banner[],
  placement: BannerPlacement
): Banner[] {
  if (placement === "infeed") {
    return banners.filter((b) => getBannerPlacement(b) === "infeed");
  }
  return banners.filter((b) => b.placement === placement);
}

/** Homepage right rail: sidebar banners, else the same in-feed set. */
export function bannersForHomepageRail(banners: Banner[]): Banner[] {
  const sidebar = bannersForPlacement(banners, "sidebar");
  if (sidebar.length > 0) return sidebar;
  return bannersForPlacement(banners, "infeed");
}

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
    let cancelled = false;

    const unsub = onSnapshot(
      collection(db, "banners"),
      (snapshot) => {
        if (cancelled) return;
        setBanners(
          snapshot.docs.map((d) => {
            const data = d.data() as Omit<Banner, "id">;
            return {
              ...data,
              id: d.id,
              imageUrl: resolveBannerImageUrl(data as unknown as Record<string, unknown>),
            } as Banner;
          })
        );
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        if (isPermissionDenied(err)) {
          setBanners([]);
          setLoading(false);
          return;
        }
        console.error("useBanners error:", err);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), ELIGIBILITY_RECHECK_MS);
    return () => clearInterval(timer);
  }, []);

  const eligible = useMemo(() => {
    const now = nowTick;
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
