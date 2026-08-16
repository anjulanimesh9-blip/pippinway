"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import Navbar from "@/app/components/Navbar";
import { buildCreditLot } from "@/lib/featuredCredits";
import { sendNotification } from "@/lib/sendNotification";
import type { FeaturedCreditLot, FeaturedPackagePurchase } from "@/lib/types/featured";

export default function AdminFeaturedPaymentsPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<FeaturedPackagePurchase[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const snap = await (await import("firebase/firestore")).getDoc(
        doc(db, "users", user.uid)
      );
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
    const q = query(
      collection(db, "featured_package_purchases"),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setPurchases(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeaturedPackagePurchase))
      );
    });
    return unsub;
  }, [adminId]);

  const approve = async (purchase: FeaturedPackagePurchase) => {
    if (!adminId) return;
    setBusyId(purchase.id);
    setMessage(null);
    try {
      await runTransaction(db, async (transaction) => {
        const purchaseRef = doc(db, "featured_package_purchases", purchase.id);
        const purchaseSnap = await transaction.get(purchaseRef);
        if (!purchaseSnap.exists()) throw new Error("Purchase not found");
        const purchaseData = purchaseSnap.data();
        const listingId = purchaseData.listingId as string;
        if (purchaseData.status !== "pending") throw new Error("Already processed");

        const userRef = doc(db, "users", purchaseData.userId);
        const listingRef = doc(db, "listings", listingId);
        const [userSnap, listingSnap] = await Promise.all([
          transaction.get(userRef),
          transaction.get(listingRef),
        ]);

        if (!listingSnap.exists()) throw new Error("Listing not found");
        const listingData = listingSnap.data();
        if (listingData.ownerId && listingData.ownerId !== purchaseData.userId) {
          throw new Error("Listing owner mismatch");
        }
        if (listingData.approved !== true) throw new Error("Listing not approved");
        if (listingData.expired === true) throw new Error("Listing expired");

        const existingCredits = userSnap.exists()
          ? Number(userSnap.data().featuredCredits ?? 0)
          : 0;
        const purchaseCredits = Number(purchaseData.credits ?? 1);
        const durationDays = Number(purchaseData.packageDurationDays ?? 7);
        const existingLots: FeaturedCreditLot[] = userSnap.exists()
          ? ((userSnap.data().featuredCreditLots as FeaturedCreditLot[]) ?? [])
          : [];
        const newLot = buildCreditLot({
          purchaseId: purchase.id,
          packageId: purchaseData.packageId ?? null,
          durationDays,
          credits: purchaseCredits,
        });
        const featuredExpiry = Timestamp.fromMillis(
          Date.now() + durationDays * 24 * 60 * 60 * 1000
        );

        transaction.update(purchaseRef, {
          status: "approved",
          approvedAt: serverTimestamp(),
          approvedBy: adminId,
        });

        if (userSnap.exists()) {
          transaction.update(userRef, {
            featuredCredits: existingCredits + purchaseCredits,
            featuredCreditLots: [...existingLots, newLot],
            featuredCreditDurationDays: durationDays,
          });
        }

        transaction.update(listingRef, {
          featured: true,
          adType: "featured",
          featuredStartDate: serverTimestamp(),
          featuredExpiryDate: featuredExpiry,
          featuredExpiresAt: featuredExpiry,
          featuredPackageId: purchaseData.packageId ?? null,
          featuredPurchaseId: purchase.id,
          featuredBy: adminId,
        });
      });

      const userSnap = await (await import("firebase/firestore")).getDoc(
        doc(db, "users", purchase.userId)
      );
      const email = userSnap.data()?.email;
      if (email) {
        await sendNotification({
          userEmail: email,
          title: "Featured payment approved",
          message: `Your payment was approved. ${purchase.credits} credits added and your selected ad is now Featured.`,
          type: "featured",
          listingId: purchase.listingId,
        });
      }
      setMessage("Payment approved.");
    } catch (err) {
      console.error(err);
      setMessage("Could not approve payment.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (purchase: FeaturedPackagePurchase) => {
    if (!adminId) return;
    setBusyId(purchase.id);
    setMessage(null);
    try {
      await updateDoc(doc(db, "featured_package_purchases", purchase.id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
      });
      const userSnap = await (await import("firebase/firestore")).getDoc(
        doc(db, "users", purchase.userId)
      );
      const email = userSnap.data()?.email;
      if (email) {
        await sendNotification({
          userEmail: email,
          title: "Featured payment rejected",
          message: "Your Featured payment could not be verified.",
          type: "featured",
          listingId: purchase.listingId,
        });
      }
      setMessage("Payment rejected.");
    } catch (err) {
      console.error(err);
      setMessage("Could not reject payment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Featured Payment Approvals</h1>
        {message && <p className="mb-4 text-yellow-300">{message}</p>}
        {purchases.length === 0 ? (
          <p className="text-gray-400">No pending featured payments.</p>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-2xl border border-white/10 bg-[#111827] p-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-white font-bold">{purchase.listingTitle}</p>
                    <p className="text-sm text-gray-400">
                      {purchase.packageName} · {purchase.credits} credits · {purchase.country}
                    </p>
                    <p className="text-sm text-gray-400">
                      {purchase.currency} {purchase.amount}
                    </p>
                    {purchase.receiptUrl && (
                      <a
                        href={purchase.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm"
                      >
                        View receipt
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === purchase.id}
                      onClick={() => approve(purchase)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white font-bold disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === purchase.id}
                      onClick={() => reject(purchase)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white font-bold disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
