"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { trackFavorite, trackRemoveFavorite } from "@/lib/analytics";
import { isPermissionDenied } from "@/lib/firestoreErrors";

export type FavoriteTrackContext = {
  category?: string;
  country?: string;
};

export default function useFavorites(user: any) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "favorites")
        );
        setFavorites(snapshot.docs.map((doc) => doc.id));
      } catch (err) {
        if (isPermissionDenied(err)) {
          setFavorites([]);
          return;
        }
        console.error("useFavorites error:", err);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (
    e: any,
    listingId: string,
    context?: FavoriteTrackContext
  ) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    const favRef = doc(
      db,
      "users",
      user.uid,
      "favorites",
      listingId
    );

    if (favorites.includes(listingId)) {
      await deleteDoc(favRef);

      setFavorites((prev) =>
        prev.filter((id) => id !== listingId)
      );
      trackRemoveFavorite({
        listing_id: listingId,
        category: context?.category,
        country: context?.country,
      });
    } else {
      await setDoc(favRef, {
        createdAt: new Date(),
      });

      setFavorites((prev) => [
        ...prev,
        listingId,
      ]);
      trackFavorite({
        listing_id: listingId,
        category: context?.category,
        country: context?.country,
      });
    }
  };

  return {
    favorites,
    toggleFavorite,
  };
}