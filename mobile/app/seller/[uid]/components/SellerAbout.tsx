"use client";

import { Seller, Listing } from "../hooks/useSeller";

interface Props {
  seller: Seller;
  listings: Listing[];
}

export default function SellerAbout({
  seller,
  listings,
}: Props) {
  const memberSince =
    seller.createdAt?.seconds
      ? new Date(
          seller.createdAt.seconds * 1000
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div className="bg-[#0F172A] rounded-3xl border border-slate-800 p-6">
      <h2 className="text-xl font-bold text-white mb-5">
        About Seller
      </h2>

      <div className="space-y-4 text-slate-300">

        <p>📍 {seller.country || "Not specified"}</p>

        <p>📅 Member Since {memberSince}</p>

        <p>📦 {listings.length} Active Listings</p>

        {seller.membership === "pro" && (
          <div className="inline-flex items-center rounded-full bg-yellow-500/20 border border-yellow-500 px-3 py-1 text-yellow-400 text-sm font-semibold">
            ⭐ PRO Seller
          </div>
        )}
      </div>
    </div>
  );
}