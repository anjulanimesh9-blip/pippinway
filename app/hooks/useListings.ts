"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import {
  fetchCountryListingsPage,
  type ListingRestCursor,
} from "@/lib/fetchCountryListings";
import { isPermissionDenied } from "@/lib/firestoreErrors";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import {
  canonicalCategory,
  canonicalCountry,
  isLiveListing,
  matchesLocation,
  matchesSearch,
} from "@/lib/filterListings";
import type { ListingRecord } from "@/lib/types/featured";

export const HOME_PAGE_SIZE = 16;
export const HOME_FEATURED_LIMIT = 16;
const SEARCH_SCAN_BATCHES = 8;

export type MarketplaceListingsQuery = {
  country?: string;
  category?: string;
  search?: string;
  location?: string;
  sortBy?: string;
  reloadKey?: number;
};

type PageCache = {
  listings: ListingRecord[];
  lastDoc: QueryDocumentSnapshot | null;
  restCursor: ListingRestCursor | null;
  hasMore: boolean;
};

function isApproved(listing: ListingRecord): boolean {
  const value = listing.approved as unknown;
  return value === true || value === "true" || value === 1;
}

function toListing(doc: QueryDocumentSnapshot): ListingRecord {
  return { id: doc.id, ...doc.data() } as ListingRecord;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("listings-timeout")), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function createdAtIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

function buildUnorderedCountryQuery(country: string, category: string | null) {
  const constraints: QueryConstraint[] = [where("country", "==", country)];
  if (category) constraints.push(where("category", "==", category));
  constraints.push(limit(HOME_PAGE_SIZE));
  return query(collection(db, "listings"), ...constraints);
}

function buildCountryQuery(
  country: string,
  category: string | null,
  ascending: boolean,
  cursor: QueryDocumentSnapshot | null
) {
  const constraints: QueryConstraint[] = [where("country", "==", country)];
  if (category) constraints.push(where("category", "==", category));
  constraints.push(orderBy("createdAt", ascending ? "asc" : "desc"));
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(HOME_PAGE_SIZE));
  return query(collection(db, "listings"), ...constraints);
}

function keepListing(
  listing: ListingRecord,
  search: string,
  location: string
): boolean {
  return (
    isApproved(listing) &&
    isLiveListing(listing) &&
    matchesSearch(listing, search) &&
    matchesLocation(listing, location)
  );
}

export default function useListings(input: MarketplaceListingsQuery | string = {}) {
  const options: MarketplaceListingsQuery =
    typeof input === "string" ? { country: input } : input;

  const canonical = canonicalCountry(options.country);
  const category = canonicalCategory(options.category) ;
  const sortBy = options.sortBy ?? "newest";
  const reloadKey = options.reloadKey ?? 0;
  const ascending = sortBy === "oldest";
  const search = options.search ?? "";
  const location = options.location ?? "";

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedLocation, setDebouncedLocation] = useState(location);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedLocation(location), 350);
    return () => window.clearTimeout(timer);
  }, [location]);

  const queryKey = [
    canonical ?? "",
    category ?? "",
    debouncedSearch.trim(),
    debouncedLocation.trim(),
    ascending ? "oldest" : "newest",
    String(reloadKey),
  ].join("|");

  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [featured, setFeatured] = useState<ListingRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, Map<number, PageCache>>());

  const applyPage = useCallback((cached: PageCache, nextPage: number) => {
    setListings(cached.listings);
    setHasMore(cached.hasMore);
    setPage(nextPage);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restAbort = new AbortController();
    setListings([]);
    setPage(1);
    setHasMore(false);
    setLoading(true);
    setError(null);

    const needsScan = Boolean(debouncedSearch.trim() || debouncedLocation.trim());

    async function fetchSdkBatch(cursor: QueryDocumentSnapshot | null) {
      if (!canonical) throw new Error("missing-country");
      const snap = await withTimeout(
        getDocs(buildCountryQuery(canonical, category, ascending, cursor)),
        6000
      );
      return snap.docs;
    }

    async function fetchRestBatch(cursor: ListingRestCursor | null) {
      if (!canonical) throw new Error("missing-country");
      return fetchCountryListingsPage({
        country: canonical,
        category,
        limitCount: HOME_PAGE_SIZE,
        startAfterCreatedAt: cursor?.createdAt ?? null,
        ascending,
        signal: restAbort.signal,
      });
    }

    async function loadFirstPage() {
      if (!canonical) {
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
        return;
      }

      const collected: ListingRecord[] = [];
      let lastDoc: QueryDocumentSnapshot | null = null;
      let restCursor: ListingRestCursor | null = null;
      let rawFull = false;
      let usedRest = false;
      let batches = 0;
      const maxBatches = needsScan ? SEARCH_SCAN_BATCHES : 1;

      try {
        let sdkCursor: QueryDocumentSnapshot | null = null;
        while (collected.length < HOME_PAGE_SIZE && batches < maxBatches) {
          const docs = await fetchSdkBatch(sdkCursor);
          batches += 1;
          rawFull = docs.length === HOME_PAGE_SIZE;
          if (!docs.length) break;
          lastDoc = docs[docs.length - 1];
          sdkCursor = lastDoc;
          restCursor = createdAtIso(toListing(lastDoc).createdAt)
            ? { createdAt: createdAtIso(toListing(lastDoc).createdAt) as string }
            : restCursor;
          for (const doc of docs) {
            const listing = toListing(doc);
            if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
            collected.push(listing);
            lastDoc = doc;
            const iso = createdAtIso(listing.createdAt);
            if (iso) restCursor = { createdAt: iso };
            if (collected.length >= HOME_PAGE_SIZE) break;
          }
          if (!rawFull) break;
        }
      } catch {
        try {
          const snap = await withTimeout(
            getDocs(buildUnorderedCountryQuery(canonical, category)),
            6000
          );
          rawFull = false;
          lastDoc = snap.docs[snap.docs.length - 1] ?? null;
          for (const doc of snap.docs) {
            const listing = toListing(doc);
            if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
            collected.push(listing);
            lastDoc = doc;
            if (collected.length >= HOME_PAGE_SIZE) break;
          }
        } catch {
          usedRest = true;
          try {
            let cursor: ListingRestCursor | null = null;
            batches = 0;
            while (collected.length < HOME_PAGE_SIZE && batches < maxBatches) {
              const page = await fetchRestBatch(cursor);
              batches += 1;
              rawFull = page.rawCount === HOME_PAGE_SIZE;
              if (!page.listings.length) break;
              cursor = page.cursor;
              restCursor = page.cursor;
              for (const listing of page.listings) {
                if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
                collected.push(listing);
                const iso = createdAtIso(listing.createdAt);
                if (iso) restCursor = { createdAt: iso };
                if (collected.length >= HOME_PAGE_SIZE) break;
              }
              if (!rawFull) break;
            }
          } catch {
            try {
              const page = await fetchCountryListingsPage({
                country: canonical,
                category,
                limitCount: HOME_PAGE_SIZE,
                skipOrderBy: true,
                signal: restAbort.signal,
              });
              rawFull = false;
              restCursor = null;
              for (const listing of page.listings) {
                if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
                collected.push(listing);
                if (collected.length >= HOME_PAGE_SIZE) break;
              }
            } catch (restError) {
              if (cancelled || restAbort.signal.aborted) return;
              if (isPermissionDenied(restError)) {
                setListings([]);
                setLoading(false);
                setError(null);
                return;
              }
              console.error("useListings error:", restError);
              setLoading(false);
              setError("Could not load listings. Check your connection and refresh.");
              return;
            }
          }
        }
      }

      if (cancelled) return;

      const cached: PageCache = {
        listings: collected.slice(0, HOME_PAGE_SIZE),
        lastDoc: usedRest ? null : lastDoc,
        restCursor,
        hasMore: rawFull,
      };

      const pages = new Map<number, PageCache>();
      pages.set(1, cached);
      cacheRef.current.set(queryKey, pages);
      applyPage(cached, 1);
    }

    void loadFirstPage();

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading((current) => {
          if (current) {
            setError("Could not load listings. Check your connection and refresh.");
          }
          return false;
        });
      }
    }, 10000);

    return () => {
      cancelled = true;
      restAbort.abort();
      window.clearTimeout(timeout);
    };
  }, [
    applyPage,
    ascending,
    canonical,
    category,
    debouncedLocation,
    debouncedSearch,
    queryKey,
  ]);

  useEffect(() => {
    if (!canonical) {
      setFeatured([]);
      return;
    }
    let cancelled = false;
    getDocs(query(collection(db, "listings"), where("featured", "==", true), limit(HOME_FEATURED_LIMIT)))
      .then((snap) => {
        if (cancelled) return;
        setFeatured(
          snap.docs
            .map(toListing)
            .filter(
              (listing) =>
                canonicalCountry(listing.country) === canonical &&
                isApproved(listing) &&
                isLiveListing(listing) &&
                isActiveFeaturedListing(listing)
            )
        );
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, [canonical, reloadKey]);

  const loadAdjacentPage = useCallback(
    async (direction: 1 | -1) => {
      if (!canonical) return;
      const pages = cacheRef.current.get(queryKey) ?? new Map<number, PageCache>();
      const target = page + direction;
      if (target < 1) return;
      const cached = pages.get(target);
      if (cached) {
        applyPage(cached, target);
        return;
      }
      if (direction < 0) return;

      const current = pages.get(page);
      if (!current?.hasMore) return;

      setLoading(true);
      const restAbort = new AbortController();
      const needsScan = Boolean(debouncedSearch.trim() || debouncedLocation.trim());
      const maxBatches = needsScan ? SEARCH_SCAN_BATCHES : 1;
      const collected: ListingRecord[] = [];
      let lastDoc = current.lastDoc;
      let restCursor = current.restCursor;
      let rawFull = false;

      try {
        if (current.lastDoc) {
          let sdkCursor = current.lastDoc;
          let batches = 0;
          while (collected.length < HOME_PAGE_SIZE && batches < maxBatches) {
            const snap = await withTimeout(
              getDocs(buildCountryQuery(canonical, category, ascending, sdkCursor)),
              6000
            );
            batches += 1;
            rawFull = snap.docs.length === HOME_PAGE_SIZE;
            if (!snap.docs.length) break;
            sdkCursor = snap.docs[snap.docs.length - 1];
            lastDoc = sdkCursor;
            for (const doc of snap.docs) {
              const listing = toListing(doc);
              if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
              collected.push(listing);
              lastDoc = doc;
              const iso = createdAtIso(listing.createdAt);
              if (iso) restCursor = { createdAt: iso };
              if (collected.length >= HOME_PAGE_SIZE) break;
            }
            if (!rawFull) break;
          }
        } else {
          let cursor = current.restCursor;
          let batches = 0;
          while (collected.length < HOME_PAGE_SIZE && batches < maxBatches) {
            const restPage = await fetchCountryListingsPage({
              country: canonical,
              category,
              limitCount: HOME_PAGE_SIZE,
              startAfterCreatedAt: cursor?.createdAt ?? null,
              ascending,
              signal: restAbort.signal,
            });
            batches += 1;
            rawFull = restPage.rawCount === HOME_PAGE_SIZE;
            if (!restPage.listings.length) break;
            cursor = restPage.cursor;
            restCursor = restPage.cursor;
            for (const listing of restPage.listings) {
              if (!keepListing(listing, debouncedSearch, debouncedLocation)) continue;
              collected.push(listing);
              const iso = createdAtIso(listing.createdAt);
              if (iso) restCursor = { createdAt: iso };
              if (collected.length >= HOME_PAGE_SIZE) break;
            }
            if (!rawFull) break;
          }
        }

        if (collected.length === 0) {
          pages.set(page, { ...current, hasMore: false });
          cacheRef.current.set(queryKey, pages);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const nextCache: PageCache = {
          listings: collected.slice(0, HOME_PAGE_SIZE),
          lastDoc,
          restCursor,
          hasMore: rawFull,
        };
        pages.set(target, nextCache);
        cacheRef.current.set(queryKey, pages);
        applyPage(nextCache, target);
      } catch (err) {
        if (isPermissionDenied(err)) {
          setLoading(false);
          return;
        }
        console.error("useListings page error:", err);
        setLoading(false);
        setError("Could not load listings. Check your connection and refresh.");
      } finally {
        restAbort.abort();
      }
    },
    [
      applyPage,
      ascending,
      canonical,
      category,
      debouncedLocation,
      debouncedSearch,
      page,
      queryKey,
    ]
  );

  const featuredListings = useMemo(() => {
    const byId = new Map<string, ListingRecord>();
    for (const listing of featured) {
      if (
        (!category || canonicalCategory(listing.category) === category) &&
        matchesSearch(listing, debouncedSearch) &&
        matchesLocation(listing, debouncedLocation)
      ) {
        byId.set(listing.id, listing);
      }
    }
    for (const listing of listings) {
      if (isActiveFeaturedListing(listing)) byId.set(listing.id, listing);
    }
    return [...byId.values()];
  }, [category, debouncedLocation, debouncedSearch, featured, listings]);

  const from = listings.length === 0 ? 0 : (page - 1) * HOME_PAGE_SIZE + 1;
  const to = listings.length === 0 ? 0 : from + listings.length - 1;

  return {
    listings,
    featuredListings,
    loading,
    error,
    page,
    from,
    to,
    hasPrev: page > 1,
    hasNext: hasMore,
    goPrev: () => void loadAdjacentPage(-1),
    goNext: () => void loadAdjacentPage(1),
  };
}
