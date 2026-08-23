"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import ListingPhoto, { LISTING_THUMB_SIZES } from "@/app/components/ListingPhoto";
import Navbar from "@/app/components/Navbar";
import useAuth from "@/app/hooks/useAuth";
import useFeaturedCredits from "@/app/hooks/useFeaturedCredits";
import useActivateCredit from "@/app/hooks/useActivateCredit";
import useSellerListings from "@/app/hooks/useSellerListings";
import {
  formatFeaturedUntil,
  getFeaturedStatus,
} from "@/lib/listingFeatured";
import { isEligibleForFeaturedCredit } from "@/lib/featuredCredits";
import type { ListingRecord } from "@/lib/types/featured";

function ListingRow({
  listing,
  credits,
  activatingListingId,
  onUseCredit,
}: {
  listing: ListingRecord;
  credits: number;
  activatingListingId: string | null;
  onUseCredit: (id: string) => void;
}) {
  const status = getFeaturedStatus(listing);
  const eligible = isEligibleForFeaturedCredit(listing);
  const isActivating = activatingListingId === listing.id;
  const image = listing.imageUrls?.[0] || listing.imageUrl || "/logo.png";

  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <ListingPhoto
          src={image}
          alt={listing.title || "Listing"}
          sizes={LISTING_THUMB_SIZES}
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-white truncate">{listing.title}</h3>
            <p className="text-emerald-400 font-semibold">
              {listing.currency || ""} {Number(listing.price ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {listing.category} • {listing.location}, {listing.country}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              status === "featured"
                ? "bg-green-500/15 text-green-300"
                : status === "expired"
                  ? "bg-red-500/15 text-red-300"
                  : "bg-white/10 text-gray-300"
            }`}
          >
            {status === "featured" ? "★ Featured" : status === "expired" ? "Expired" : "Normal"}
          </span>
        </div>

        <div className="mt-3">
          {status === "featured" && (
            <p className="text-sm text-yellow-300 inline-flex items-center gap-1">
              <Star size={14} /> Featured until {formatFeaturedUntil(listing)}
            </p>
          )}

          {listing.approved !== true && listing.rejected !== true && (
            <p className="text-sm text-gray-400">Pending admin approval</p>
          )}

          {listing.rejected === true && (
            <p className="text-sm text-red-400">Rejected</p>
          )}

          {listing.expired === true && status !== "featured" && (
            <p className="text-sm text-red-400">Listing expired</p>
          )}

          {eligible && credits > 0 && (
            <button
              type="button"
              disabled={isActivating || activatingListingId != null}
              onClick={() => onUseCredit(listing.id)}
              className="mt-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {isActivating ? "Featuring..." : "Use 1 Featured Credit"}
            </button>
          )}

          {eligible && credits === 0 && (
            <p className="mt-2 text-sm text-amber-300">No Featured Credits Remaining</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedAdsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading } = useFeaturedCredits(user);
  const { listings, loading: listingsLoading } = useSellerListings(user);
  const { activate, activatingListingId } = useActivateCredit(user);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const onUseCredit = async (listingId: string) => {
    setMessage(null);
    const result = await activate(listingId);
    setMessage({
      text: result.ok
        ? "Ad featured instantly — 1 credit used."
        : result.error ?? "Couldn't use credit.",
      ok: result.ok,
    });
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Featured Ads</h1>
            <p className="text-gray-400 mt-1">
              Use your package credits to feature approved listings instantly.
            </p>
          </div>
          <Link
            href="/featured-packages"
            className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black"
          >
            Buy Package
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-[#111827] p-5">
          <p className="text-sm text-gray-400">★ Featured Credits</p>
          <p className="text-3xl font-bold text-yellow-300">
            {creditsLoading ? "..." : credits} Remaining
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              message.ok
                ? "bg-green-500/10 text-green-300 border border-green-500/20"
                : "bg-red-500/10 text-red-300 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {listingsLoading ? (
          <p className="text-gray-400">Loading your ads...</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-400">You haven&apos;t posted any ads yet.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                credits={credits}
                activatingListingId={activatingListingId}
                onUseCredit={onUseCredit}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
