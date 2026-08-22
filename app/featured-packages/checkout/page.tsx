"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Navbar from "@/app/components/Navbar";
import useAuth from "@/app/hooks/useAuth";
import useSellerListings from "@/app/hooks/useSellerListings";
import { db, storage } from "@/app/firebase";
import { sendNotification } from "@/lib/sendNotification";
import { isLiveListing } from "@/lib/filterListings";

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { listings } = useSellerListings(user);

  const eligibleAds = useMemo(
    () =>
      listings.filter(
        (ad) => ad.approved === true && ad.rejected !== true && isLiveListing(ad)
      ),
    [listings]
  );

  const [listingId, setListingId] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packageId = params.get("packageId") ?? "";
  const packageName = params.get("packageName") ?? "";
  const packageCredits = Number(params.get("packageCredits") ?? 1);
  const packageDurationDays = Number(params.get("packageDurationDays") ?? 7);
  const packagePrice = Number(params.get("packagePrice") ?? 0);
  const packageCurrency = params.get("packageCurrency") ?? "";

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!listingId) {
      setError("Select the ad you want to feature.");
      return;
    }
    if (!receiptFile) {
      setError("Upload your payment receipt.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const listingSnap = await getDoc(doc(db, "listings", listingId));
      if (!listingSnap.exists()) throw new Error("Listing not found");
      const listing = listingSnap.data();
      if (listing.ownerId !== user.uid) throw new Error("Not your listing");

      const storageRef = ref(
        storage,
        `featured_receipts/${user.uid}/${Date.now()}.jpg`
      );
      await uploadBytes(storageRef, receiptFile);
      const receiptUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "featured_package_purchases"), {
        userId: user.uid,
        listingId,
        listingTitle: listing.title ?? "Selected ad",
        country,
        currency: packageCurrency,
        amount: packagePrice,
        credits: packageCredits,
        paymentMethod: country === "Sri Lanka" ? "Bank Transfer" : "EcoCash",
        receiptUrl,
        status: "pending",
        packageId,
        packageName,
        packageDurationDays,
        createdAt: serverTimestamp(),
      });

      if (user.email) {
        await sendNotification({
          userEmail: user.email,
          title: "Payment submitted",
          message: `"${listing.title ?? "Your ad"}" is waiting for Featured payment verification.`,
          type: "featured",
          listingId,
        });
      }

      router.push("/featured-ads?submitted=1");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while submitting payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Complete Featured Payment</h1>
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="text-white font-bold text-lg">{packageName}</p>
          <p className="text-gray-400 mt-1">
            {packageCredits} credits · {packageDurationDays} days each
          </p>
          <p className="text-yellow-300 text-2xl font-bold mt-3">
            {packageCurrency} {packagePrice}
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Select ad to feature</label>
          <select
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-white"
          >
            <option value="">Choose an approved ad</option>
            {eligibleAds.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Payment country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-white"
          >
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Upload receipt</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            className="w-full text-gray-300"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
      </form>
    </main>
  );
}

export default function FeaturedCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
