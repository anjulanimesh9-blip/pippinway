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

export default function useFavorites(user: any) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "favorites")
      );

      setFavorites(snapshot.docs.map((doc) => doc.id));
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (
    e: any,
    listingId: string
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
    } else {
      await setDoc(favRef, {
        createdAt: new Date(),
      });

      setFavorites((prev) => [
        ...prev,
        listingId,
      ]);
    }
  };

  return {
    favorites,
    toggleFavorite,
  };
}