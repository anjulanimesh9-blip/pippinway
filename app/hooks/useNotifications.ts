"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { isPermissionDenied } from "@/lib/firestoreErrors";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userEmail: string;
  listingId?: string;
  createdAt?: any;
}

function getCreatedAtMs(item: Notification): number {
  const raw = item.createdAt;
  if (!raw) return 0;
  if (typeof (raw as { toMillis?: () => number }).toMillis === "function") {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (typeof (raw as { seconds?: number }).seconds === "number") {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return 0;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const stopSnapshot = () => {
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = undefined;
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      stopSnapshot();

      if (!user?.email || !user.emailVerified) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("userEmail", "==", user.email)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data: Notification[] = snapshot.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Notification, "id">),
            }))
            .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));

          setNotifications(data);
          setLoading(false);
        },
        (error) => {
          if (isPermissionDenied(error)) {
            setNotifications([]);
            setLoading(false);
            return;
          }
          console.error("Notification error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      stopSnapshot();
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true,
      });
    } catch (error) {
      if (isPermissionDenied(error)) return;
      console.error(error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
  };
}
