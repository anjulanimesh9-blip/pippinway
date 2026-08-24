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
  limit,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export const PROFILE_LISTINGS_FIRST_PAGE = 24;

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

async function countOrNull(q: ReturnType<typeof query>) {
  try {
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch {
    return null;
  }
}

async function fetchOwnerListingsFirstPage(uid: string) {
  const listingsRef = collection(db, "listings");
  try {
    return await getDocs(
      query(
        listingsRef,
        where("ownerId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(PROFILE_LISTINGS_FIRST_PAGE)
      )
    );
  } catch {
    return await getDocs(
      query(
        listingsRef,
        where("ownerId", "==", uid),
        limit(PROFILE_LISTINGS_FIRST_PAGE)
      )
    );
  }
}

export default function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [adsCount, setAdsCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const loadIdRef = useRef(0);
  const userRef = useRef<User | null>(null);
  const listingsRequestedRef = useRef(false);
  const favoritesRequestedRef = useRef(false);
  const favoriteIdsRef = useRef<string[]>([]);

  userRef.current = user;
  favoriteIdsRef.current = favoriteIds;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
        setAdsCount(0);
        setTotalUsers(null);
        setUserDataLoading(false);
        setListingsLoading(false);
        setListingsLoaded(false);
        setFavoritesLoading(false);
        setFavoritesLoaded(false);
        setCountsLoading(false);
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
      setCountsLoading(true);
      const loadId = ++loadIdRef.current;
      const still = () => loadIdRef.current === loadId;
      void Promise.all([
        fetchUserData(currentUser, still),
        fetchAdsCount(currentUser, still),
      ]);
    });

    return unsubscribe;
  }, []);

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

  const fetchAdsCount = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    try {
      const total = await countOrNull(
        query(collection(db, "listings"), where("ownerId", "==", currentUser.uid))
      );
      if (!still()) return;
      setAdsCount(total ?? 0);
    } catch (error) {
      console.error("Profile ads count error:", error);
      if (still()) setAdsCount(0);
    } finally {
      if (still()) setCountsLoading(false);
    }
  };

  const fetchMyAds = async (
    currentUser: User,
    still: () => boolean = () => true
  ) => {
    const listingsRef = collection(db, "listings");

    try {
      const firstSnap = await fetchOwnerListingsFirstPage(currentUser.uid);
      if (!still()) return;
      setMyAds(firstSnap.docs.map(listingFromSnap));
      setListingsLoading(false);
      setListingsLoaded(true);

      const needFullOwnerQuery =
        firstSnap.size >= PROFILE_LISTINGS_FIRST_PAGE;

      const [byOwnerId, byEmail] = await Promise.all([
        needFullOwnerQuery
          ? getDocs(
              query(listingsRef, where("ownerId", "==", currentUser.uid))
            )
          : Promise.resolve(firstSnap),
        currentUser.email
          ? getDocs(
              query(
                listingsRef,
                where("ownerEmail", "==", currentUser.email)
              )
            )
          : Promise.resolve(null),
      ]);

      if (!still()) return;
      const ads = mergeListingSnaps(byOwnerId, byEmail);
      setMyAds(ads);
      setAdsCount(ads.length);
      setListingsLoaded(true);
    } catch (error) {
      console.error("Profile listings error:", error);
      listingsRequestedRef.current = false;
      if (still()) {
        setListingsLoading(false);
        setListingsLoaded(false);
      }
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

    await deleteDoc(doc(db, "users", user.uid, "favorites", listingId));

    setFavoriteIds((prev) => prev.filter((id) => id !== listingId));
    setFavoriteAds((prev) => prev.filter((ad: any) => ad.id !== listingId));
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
  };

  const deleteListing = async (listingId: string) => {
    await deleteDoc(doc(db, "listings", listingId));

    setMyAds((prev) => prev.filter((ad: any) => ad.id !== listingId));
    setAdsCount((prev) => Math.max(0, prev - 1));
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

  return {
    loading,
    userDataLoading,
    listingsLoading,
    listingsLoaded,
    favoritesLoading,
    favoritesLoaded,
    countsLoading,

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
