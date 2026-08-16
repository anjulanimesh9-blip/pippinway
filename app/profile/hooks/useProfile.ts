"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function useProfile() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserData(null);
        setMyAds([]);
        setFavoriteAds([]);
        setLoading(false);
        return;
      }

      await loadProfile(currentUser);
    });

    return unsubscribe;
  }, []);

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
    const snapshot = await getDocs(collection(db, "listings"));

    const ads = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((ad: any) => ad.ownerEmail === currentUser.email);

    setMyAds(ads);
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