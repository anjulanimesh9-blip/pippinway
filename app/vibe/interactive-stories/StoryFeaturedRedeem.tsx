"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import ListingPhoto, { LISTING_THUMB_SIZES } from "@/app/components/ListingPhoto";
import useActivateCredit from "@/app/hooks/useActivateCredit";
import useSellerListings from "@/app/hooks/useSellerListings";
import { isEligibleForFeaturedCredit } from "@/lib/featuredCredits";
import { formatPrice } from "@/lib/formatPrice";
import { recordStoryRewardEvent } from "@/lib/vibe/stories/rewards";

export default function StoryFeaturedRedeem({
  user,
  storySlug,
  postAdHref,
  onRedeemed,
}: {
  user: User;
  storySlug: string;
  postAdHref: string;
  onRedeemed?: () => void;
}) {
  const { listings, loading } = useSellerListings(user);
  const { activate, activatingListingId } = useActivateCredit(user);
  const [message, setMessage] = useState("");
  const eligible = useMemo(
    () => listings.filter((listing) => isEligibleForFeaturedCredit(listing)),
    [listings]
  );

  const applyFeaturedCredit = async (listingId: string) => {
    setMessage("");
    const result = await activate(listingId);
    if (!result.ok) {
      setMessage(result.error || "Could not feature this ad.");
      return;
    }
    try {
      await recordStoryRewardEvent({
        storySlug,
        event: "featured_redeemed",
        listingId,
      });
    } catch {
      // The credit was already applied; analytics can catch up later.
    }
    setMessage("Your Featured Ad is now live.");
    onRedeemed?.();
  };

  if (loading) {
    return <p className="mt-4 text-sm text-gray-400">Checking your Marketplace ads…</p>;
  }

  if (listings.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-[#020817] p-4 text-left">
        <p className="text-sm leading-6 text-gray-300">
          You do not have a Marketplace listing yet. Post an ad, then use your Featured Ad reward
          on it.
        </p>
        <Link
          href={postAdHref}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#FBB03B] px-4 text-sm font-semibold text-[#0B1220]"
        >
          Post an Ad
        </Link>
      </div>
    );
  }

  if (eligible.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-[#020817] p-4 text-left">
        <p className="text-sm leading-6 text-gray-300">
          None of your current ads can use a Featured credit yet. Post a new live ad, or wait
          until an existing ad is approved and not already featured.
        </p>
        <Link
          href={postAdHref}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#FBB03B] px-4 text-sm font-semibold text-[#0B1220]"
        >
          Post an Ad
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 text-left">
      <p className="text-sm text-gray-300">Choose an eligible Marketplace ad to feature.</p>
      {eligible.map((listing) => (
        <div
          key={listing.id}
          className="flex gap-3 rounded-2xl border border-white/10 bg-[#020817] p-3"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            <ListingPhoto
              src={listing.imageUrls?.[0] || listing.imageUrl || "/logo.png"}
              alt=""
              sizes={LISTING_THUMB_SIZES}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
            <p className="text-xs text-emerald-400">
              {formatPrice(listing.price ?? listing.amount, listing.country)}
            </p>
            <button
              type="button"
              disabled={activatingListingId != null}
              onClick={() => void applyFeaturedCredit(listing.id)}
              className="mt-2 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#FBB03B] px-3 text-xs font-semibold text-[#0B1220] disabled:opacity-60"
            >
              {activatingListingId === listing.id ? "Featuring…" : "Use Featured Ad"}
            </button>
          </div>
        </div>
      ))}
      {message ? <p className="text-sm text-[#FBB03B]">{message}</p> : null}
    </div>
  );
}
