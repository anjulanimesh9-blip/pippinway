"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user?.email) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("userEmail", "==", user.email),
        orderBy("createdAt", "desc")
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data: Notification[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Notification, "id">),
          }));

          setNotifications(data);
          setLoading(false);
        },
        (error) => {
          console.error("Notification error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

 const unreadCount = notifications.filter(
  (item) => !item.isRead
).length;

const markAsRead = async (id: string) => {
  try {
    await updateDoc(doc(db, "notifications", id), {
      isRead: true,
    });
  } catch (error) {
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

