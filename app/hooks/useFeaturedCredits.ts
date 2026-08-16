"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/app/firebase";

export default function useFeaturedCredits(user: User | null) {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setCredits(snap.exists() ? Number(snap.data().featuredCredits ?? 0) : 0);
        setLoading(false);
      },
      (err) => {
        console.error("useFeaturedCredits error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  return { credits, loading };
}
