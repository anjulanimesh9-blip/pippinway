"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { sendNotification } from "@/lib/sendNotification";
import type { ListingRecord } from "@/lib/types/featured";

export default function AdminAdApprovalsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        router.push("/");
        return;
      }
      setAdminId(user.uid);
    });
    return unsubAuth;
  }, [router]);

  useEffect(() => {
    if (!adminId) return;
    const q = query(collection(db, "listings"), where("approved", "==", false));
    const unsub = onSnapshot(q, (snapshot) => {
      setListings(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as ListingRecord))
          .filter((l) => l.rejected !== true && l.expired !== true)
      );
    });
    return unsub;
  }, [adminId]);

  const approve = async (listing: ListingRecord) => {
    if (!adminId) return;
    setBusyId(listing.id);
    try {
      await updateDoc(doc(db, "listings", listing.id), {
        approved: true,
        rejected: false,
        status: "active",
        approvedAt: serverTimestamp(),
        approvedBy: adminId,
      });
      if (listing.ownerEmail) {
        await sendNotification({
          userEmail: listing.ownerEmail,
          title: "Ad approved",
          message: `"${listing.title ?? "Your ad"}" is now live on Pippinway.`,
          type: "listing",
          listingId: listing.id,
        });
      }
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (listing: ListingRecord) => {
    if (!adminId) return;
    setBusyId(listing.id);
    try {
      await updateDoc(doc(db, "listings", listing.id), {
        approved: false,
        rejected: true,
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
      });
      if (listing.ownerEmail) {
        await sendNotification({
          userEmail: listing.ownerEmail,
          title: "Ad rejected",
          message: `"${listing.title ?? "Your ad"}" was not approved.`,
          type: "listing",
          listingId: listing.id,
        });
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-6">Normal Ad Approvals</h1>
        {listings.length === 0 ? (
          <p className="text-gray-400">No pending ads.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-white/10 bg-[#111827] p-4 flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-white font-bold">{listing.title}</p>
                  <p className="text-sm text-gray-400">{listing.category} · {listing.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === listing.id}
                    onClick={() => approve(listing)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white font-bold disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === listing.id}
                    onClick={() => reject(listing)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white font-bold disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
