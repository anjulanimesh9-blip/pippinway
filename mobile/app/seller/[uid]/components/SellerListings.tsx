"use client";

import Link from "next/link";
import { Listing } from "../hooks/useSeller";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { ListingRecord } from "@/lib/types/featured";
import { formatPrice } from "@/lib/formatPrice";

interface SellerListingsProps {
  listings: Listing[];
}

export default function SellerListings({
  listings,
}: SellerListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-12 text-center">
        <div className="text-6xl mb-5">📦</div>

        <h2 className="text-2xl font-bold text-white">
          No Active Listings
        </h2>

        <p className="mt-3 text-slate-400">
          This seller hasn't published any active ads yet.
        </p>
      </div>
    );
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">
          Active Listings
        </h2>

        <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          {listings.length} Ads
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group overflow-hidden rounded-3xl border border-slate-800 bg-[#0F172A] transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl"
          >
            {/* Image */}
            <div className="relative overflow-hidden">

              <img
                src={
                  listing.imageUrls?.[0] ||
                  listing.imageUrl ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                alt={listing.title}
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
              />

              {isActiveFeaturedListing(listing as ListingRecord) && (
                <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
                  ⭐ FEATURED
                </span>
              )}

              <button
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                ❤️
              </button>

              <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                📷 {listing.imageUrls?.length || 1}
              </span>

            </div>

            {/* Content */}
            <div className="p-5">

              <h3 className="line-clamp-2 text-lg font-bold text-white">
                {listing.title}
              </h3>

              {listing.location && (
                <p className="mt-2 text-sm text-slate-400">
                  📍 {listing.location}
                </p>
              )}

              <p className="mt-4 text-3xl font-bold text-green-400">
                {formatPrice(listing.price, listing.country)}
              </p>

              <div className="mt-5 flex items-center justify-between">

                {listing.category ? (
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                    {listing.category}
                  </span>
                ) : (
                  <span />
                )}

                {listing.createdAt?.toDate && (
                  <span className="text-xs text-slate-500">
                    {listing.createdAt
                      .toDate()
                      .toLocaleDateString()}
                  </span>
                )}

              </div>

              <div className="mt-5 border-t border-slate-800 pt-4 text-center text-sm font-semibold text-blue-400 group-hover:text-blue-300">
                View Details →
              </div>

            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}