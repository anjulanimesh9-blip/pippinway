"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function useProfile() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserData(null);
        setMyAds([]);
        setFavoriteAds([]);
        setTotalUsers(null);
        setLoading(false);
        return;
      }

      await loadProfile(currentUser);
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

  const loadProfile = async (currentUser: User) => {
    try {
      setLoading(true);

      await Promise.all([
        fetchUserData(currentUser),
        fetchMyAds(currentUser),
        fetchFavorites(currentUser),
      ]);
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (currentUser: User) => {
    const snap = await getDoc(doc(db, "users", currentUser.uid));

    if (snap.exists()) {
      setUserData(snap.data());
    } else {
      setUserData(null);
    }
  };

  const fetchMyAds = async (currentUser: User) => {
    const listingsRef = collection(db, "listings");
    const [byOwnerId, byEmail] = await Promise.all([
      getDocs(query(listingsRef, where("ownerId", "==", currentUser.uid))),
      currentUser.email
        ? getDocs(query(listingsRef, where("ownerEmail", "==", currentUser.email)))
        : Promise.resolve(null),
    ]);

    const byId = new Map<string, any>();
    for (const snap of [byOwnerId, byEmail]) {
      if (!snap) continue;
      for (const d of snap.docs) {
        byId.set(d.id, { id: d.id, ...d.data() });
      }
    }

    setMyAds([...byId.values()]);
  };

  const fetchFavorites = async (currentUser: User) => {
    const favSnapshot = await getDocs(
      collection(db, "users", currentUser.uid, "favorites")
    );

    const ads: any[] = [];

    for (const fav of favSnapshot.docs) {
      const listing = await getDoc(doc(db, "listings", fav.id));

      if (listing.exists()) {
        ads.push({
          id: listing.id,
          ...listing.data(),
        });
      }
    }

    setFavoriteAds(ads);
  };

  const removeFavorite = async (listingId: string) => {
    if (!user) return;

    await deleteDoc(
      doc(db, "users", user.uid, "favorites", listingId)
    );

    setFavoriteAds((prev) =>
      prev.filter((ad: any) => ad.id !== listingId)
    );
  };

  const addFavorite = async (ad: any) => {
    if (!user || !ad?.id) return;

    await setDoc(doc(db, "users", user.uid, "favorites", ad.id), {
      createdAt: new Date(),
    });

    setFavoriteAds((prev) =>
      prev.some((item: any) => item.id === ad.id) ? prev : [...prev, ad]
    );
  };

  const deleteListing = async (listingId: string) => {
    await deleteDoc(doc(db, "listings", listingId));

    setMyAds((prev) =>
      prev.filter((ad: any) => ad.id !== listingId)
    );
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

    user,

    userData,
    myAds,
    favoriteAds,
    totalUsers,

    fetchUserData,
    fetchMyAds,
    fetchFavorites,

    removeFavorite,
    addFavorite,
    deleteListing,
    requestProSeller,

    reloadProfile: () => {
      if (user) {
        loadProfile(user);
      }
    },
  };
}