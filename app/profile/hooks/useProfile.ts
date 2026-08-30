"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { trackFavorite, trackRemoveFavorite } from "@/lib/analytics";
import { auth, db } from "../../firebase";

function listingFromSnap(d: { id: string; data: () => Record<string, unknown> }) {
  return { id: d.id, ...d.data() };
}

function mergeListingSnaps(
  ...snaps: Array<QuerySnapshot | null | undefined>
) {
  const byId = new Map<string, any>();
  for (const snap of snaps) {
    if (!snap) continue;
    for (const d of snap.docs) {
      byId.set(d.id, listingFromSnap(d));
    }
  }
  return [...byId.values()];
}

function cheapAdsCount(userData: any): number {
  const raw =
    userData?.rewardApprovedAdsCount ??
    userData?.listingsCount ??
    userData?.adsCount ??
    0;
  return Number(raw) || 0;
}

function toTime(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const date = value instanceof Date ? value : new Date(value as string | number);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

async function queryOwnedListings(
  field: "ownerId" | "ownerEmail",
  value: string
) {
  const listingsRef = collection(db, "listings");
  try {
    return await getDocs(query(listingsRef, where(field, "==", value)));
  } catch (error) {
    console.error(`Profile listings ${field} query error:`, error);
    return null;
  }
}

export default function useProfile() {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const loadIdRef = useRef(0);
  const userRef = useRef<User | null>(auth.currentUser);
  const listingsRequestedRef = useRef(false);
  const favoritesRequestedRef = useRef(false);
  const favoriteIdsRef = useRef<string[]>([]);

  userRef.current = user;
  favoriteIdsRef.current = favoriteIds;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const prevUid = userRef.current?.uid;
      userRef.current = currentUser;
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        loadIdRef.current += 1;
        listingsRequestedRef.current = false;
        favoritesRequestedRef.current = false;
        setUserData(null);
        setMyAds([]);
        setFavoriteAds([]);
        setFavoriteIds([]);
        setTotalUsers(null);
        setUserDataLoading(false);
        setListingsLoading(false);
        setListingsLoaded(false);
        setFavoritesLoading(false);
        setFavoritesLoaded(false);
        return;
      }

      if (prevUid === currentUser.uid) {
        return;
      }

      listingsRequestedRef.current = false;
      favoritesRequestedRef.current = false;
      setMyAds([]);
      setFavoriteAds([]);
      setListingsLoaded(false);
      setFavoritesLoaded(false);
      setUserDataLoading(true);
      setListingsLoading(false);
      setFavoritesLoading(false);
      const loadId = ++loadIdRef.current;
      void fetchUserData(currentUser, () => loadIdRef.current === loadId);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const loadId = loadIdRef.current;
    void fetchUserData(user, () => loadIdRef.current === loadId);
  }, [user?.uid]);

  useEffect(() => {
    if (userData?.role !== "admin") {
      setTotalUsers(null);
      return;
    }

    let cancelled = false;

    const fetchTotalUsers = async () => {
      try {
        const snap = await getCountFromServer(collection(db, "users"));
        if (!cancelled) {
          setTotalUsers(snap.data().count);
        }
      } catch {
        if (!cancelled) {
          setTotalUsers(0);
        }
      }
    };

    fetchTotalUsers();

    return () => {
      cancelled = true;
    };
  }, [userData?.role]);

  const fetchUserData = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    try {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (!still()) return;

      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Profile user data error:", error);
      if (still()) setUserData(null);
    } finally {
      if (still()) setUserDataLoading(false);
    }
  };

  const fetchMyAds = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    try {
      const [byOwnerId, byEmail] = await Promise.all([
        queryOwnedListings("ownerId", currentUser.uid),
        currentUser.email
          ? queryOwnedListings("ownerEmail", currentUser.email)
          : Promise.resolve(null),
      ]);

      if (!still()) return;

      const ads = mergeListingSnaps(byOwnerId, byEmail).sort(
        (a, b) => toTime(b.createdAt) - toTime(a.createdAt)
      );
      setMyAds(ads);
      setListingsLoaded(true);
    } catch (error) {
      console.error("Profile listings error:", error);
      listingsRequestedRef.current = false;
      if (still()) setListingsLoaded(false);
    } finally {
      if (still()) setListingsLoading(false);
    }
  };

  const fetchFavoriteIds = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    try {
      const favSnapshot = await getDocs(
        collection(db, "users", currentUser.uid, "favorites")
      );
      if (!still()) return;
      setFavoriteIds(favSnapshot.docs.map((fav) => fav.id));
    } catch (error) {
      console.error("Profile favorite ids error:", error);
    }
  };

  const fetchFavoriteAds = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    try {
      let ids = favoriteIdsRef.current;
      if (ids.length === 0) {
        const favSnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "favorites")
        );
        if (!still()) return;
        ids = favSnapshot.docs.map((fav) => fav.id);
        setFavoriteIds(ids);
      }

      const ads = (
        await Promise.all(
          ids.map(async (id) => {
            const listing = await getDoc(doc(db, "listings", id));
            if (!listing.exists()) return null;
            return { id: listing.id, ...listing.data() };
          })
        )
      ).filter(Boolean);

      if (!still()) return;
      setFavoriteAds(ads);
      setFavoritesLoaded(true);
    } catch (error) {
      console.error("Profile favorites error:", error);
      favoritesRequestedRef.current = false;
    } finally {
      if (still()) setFavoritesLoading(false);
    }
  };

  const loadMyListings = useCallback(() => {
    const currentUser = userRef.current;
    if (!currentUser || listingsRequestedRef.current) return;

    listingsRequestedRef.current = true;
    setListingsLoading(true);
    const loadId = loadIdRef.current;
    void fetchFavoriteIds(currentUser, () => loadIdRef.current === loadId);
    return fetchMyAds(currentUser, () => loadIdRef.current === loadId);
  }, []);

  const loadFavorites = useCallback(() => {
    const currentUser = userRef.current;
    if (!currentUser || favoritesRequestedRef.current) return;

    favoritesRequestedRef.current = true;
    setFavoritesLoading(true);
    const loadId = loadIdRef.current;
    return fetchFavoriteAds(currentUser, () => loadIdRef.current === loadId);
  }, []);

  const removeFavorite = async (listingId: string) => {
    if (!user) return;

    const existing = favoriteAds.find((ad: any) => ad.id === listingId);
    await deleteDoc(doc(db, "users", user.uid, "favorites", listingId));

    setFavoriteIds((prev) => prev.filter((id) => id !== listingId));
    setFavoriteAds((prev) => prev.filter((ad: any) => ad.id !== listingId));
    trackRemoveFavorite({
      listing_id: listingId,
      category: existing?.category,
      country: existing?.country,
    });
  };

  const addFavorite = async (ad: any) => {
    if (!user || !ad?.id) return;

    await setDoc(doc(db, "users", user.uid, "favorites", ad.id), {
      createdAt: new Date(),
    });

    setFavoriteIds((prev) =>
      prev.includes(ad.id) ? prev : [...prev, ad.id]
    );
    setFavoriteAds((prev) =>
      prev.some((item: any) => item.id === ad.id) ? prev : [...prev, ad]
    );
    trackFavorite({
      listing_id: ad.id,
      category: ad.category,
      country: ad.country,
    });
  };

  const deleteListing = async (listingId: string) => {
    await deleteDoc(doc(db, "listings", listingId));

    setMyAds((prev) => prev.filter((ad: any) => ad.id !== listingId));
  };

  const requestProSeller = async () => {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      proRequest: true,
    });

    setUserData((prev: any) => ({
      ...prev,
      proRequest: true,
    }));
  };

  const adsCount = listingsLoaded ? myAds.length : cheapAdsCount(userData);

  return {
    loading,
    userDataLoading,
    listingsLoading,
    listingsLoaded,
    favoritesLoading,
    favoritesLoaded,
    countsLoading: userDataLoading,

    user,

    userData,
    myAds,
    favoriteAds,
    favoriteIds,
    adsCount,
    totalUsers,

    fetchUserData,
    fetchMyAds,
    loadMyListings,
    loadFavorites,

    removeFavorite,
    addFavorite,
    deleteListing,
    requestProSeller,
  };
}
