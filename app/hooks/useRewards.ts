"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import {
  EMPTY_REWARDS,
  type RewardHistoryItem,
  type RewardsState,
} from "@/lib/rewards";

export default function useRewards(userId: string | null | undefined) {
  const [rewards, setRewards] = useState<RewardsState>(EMPTY_REWARDS);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRewards(EMPTY_REWARDS);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubUser = onSnapshot(
      doc(db, "users", userId),
      (snap) => {
        if (!snap.exists()) {
          setRewards(EMPTY_REWARDS);
          setLoading(false);
          return;
        }
        const data = snap.data();
        setRewards({
          availableSpins: Number(data.availableSpins ?? 0),
          availableMegaSpins: Number(data.availableMegaSpins ?? 0),
          rewardNormalProgress: Number(data.rewardNormalProgress ?? 0),
          rewardMegaProgress: Number(data.rewardMegaProgress ?? 0),
          rewardApprovedAdsCount: Number(data.rewardApprovedAdsCount ?? 0),
        });
        setLoading(false);
      },
      (err) => {
        console.error("useRewards user snapshot error:", err);
        setLoading(false);
      }
    );

    const historyQuery = query(
      collection(db, "users", userId, "rewardHistory"),
      orderBy("createdAt", "desc")
    );

    const unsubHistory = onSnapshot(
      historyQuery,
      (snap) => {
        setHistory(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<RewardHistoryItem, "id">),
          }))
        );
      },
      (err) => {
        console.error("useRewards history snapshot error:", err);
      }
    );

    return () => {
      unsubUser();
      unsubHistory();
    };
  }, [userId]);

  return { rewards, history, loading };
}
