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
import {
  FEATURED_COUNTRIES,
  isFeaturedCountry,
  paymentMethodForCountry,
} from "@/lib/featuredCountries";
import { formatPrice } from "@/lib/formatPrice";
import { trackFeaturedPurchase } from "@/lib/analytics";
import type { PaymentSettings } from "@/lib/types/featured";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-2.5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

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

  const countryParam = params.get("country") ?? "";
  const [listingId, setListingId] = useState("");
  const [country, setCountry] = useState<string>(
    isFeaturedCountry(countryParam) ? countryParam : FEATURED_COUNTRIES[0]
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const packageId = params.get("packageId") ?? "";
  const packageName = params.get("packageName") ?? "";
  const packageCredits = Number(params.get("packageCredits") ?? 1);
  const packageDurationDays = Number(params.get("packageDurationDays") ?? 7);
  const packagePrice = Number(params.get("packagePrice") ?? 0);
  const packageCurrency = params.get("packageCurrency") ?? "";
  const paymentMethod = paymentMethodForCountry(country);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSettingsLoading(true);
      try {
        const snap = await getDoc(doc(db, "payment_settings", country));
        if (cancelled) return;
        setSettings(snap.exists() ? (snap.data() as PaymentSettings) : null);
      } catch (err) {
        console.error("Failed to load payment details:", err);
        if (!cancelled) setSettings(null);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [country]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!listingId) {
      setError("Select the ad you want to feature.");
      return;
    }
    if (!settings) {
      setError("Payment details unavailable. Please try again later.");
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
        paymentMethod,
        receiptUrl,
        status: "pending",
        packageId,
        packageName,
        packageDurationDays,
        createdAt: serverTimestamp(),
      });

      trackFeaturedPurchase({
        package_id: packageId,
        credits: packageCredits,
        duration_days: packageDurationDays,
        payment_country: country,
        value: packagePrice,
        currency: packageCurrency,
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
          <p className="text-sm text-gray-400">Amount to pay</p>
          <p className="text-white font-bold text-lg mt-1">{packageName}</p>
          <p className="text-gray-400 mt-1">
            {packageCredits} Featured Ads · {packageDurationDays} days each
          </p>
          <p className="text-yellow-300 text-2xl font-bold mt-3">
            {formatPrice(packagePrice, country) || `${packageCurrency} ${packagePrice}`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Select ad to feature
          </label>
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Payment country
          </label>
          <p className="text-xs text-gray-500 mb-2">
            This determines the payment details shown to you.
          </p>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-white"
          >
            {FEATURED_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c} · {paymentMethodForCountry(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <div className="mb-4 inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-sky-300">
            {paymentMethod}
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Payment Details</h2>
          {settingsLoading ? (
            <p className="text-sm text-gray-400">Loading payment details...</p>
          ) : settings ? (
            <>
              {paymentMethod === "Bank Transfer" ? (
                <>
                  {settings.bankName ? (
                    <DetailRow label="Bank Name" value={settings.bankName} />
                  ) : null}
                  {settings.accountName ? (
                    <DetailRow label="Account Name" value={settings.accountName} />
                  ) : null}
                  {settings.accountNumber ? (
                    <DetailRow label="Account Number" value={settings.accountNumber} />
                  ) : null}
                  {settings.branch ? (
                    <DetailRow label="Branch" value={settings.branch} />
                  ) : null}
                </>
              ) : (
                <>
                  {settings.ecoCashNumber ? (
                    <DetailRow label="EcoCash Number" value={settings.ecoCashNumber} />
                  ) : null}
                  {settings.accountName ? (
                    <DetailRow label="Account Name" value={settings.accountName} />
                  ) : null}
                </>
              )}
              {settings.qrImage ? (
                <div className="mt-4 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.qrImage}
                    alt="Scan to pay"
                    className="h-44 w-44 rounded-lg bg-white object-contain p-2"
                  />
                  <p className="mt-2 text-xs text-gray-400">Scan to pay</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Payment details for {country} aren&apos;t available right now.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Upload receipt
          </label>
          <p className="text-xs text-gray-500 mb-2">
            After making the payment, upload your receipt. Your ad will become Featured after admin
            verification.
          </p>
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
          disabled={submitting || !settings}
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "I've Made Payment"}
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
