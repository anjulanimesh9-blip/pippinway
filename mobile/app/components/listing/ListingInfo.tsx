"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatPrice";

type ListingInfoProps = {
  title: string;
  price: number;
  currency?: string;
  country?: string;
  category: string;
  location: string;
  createdAt: any;
  description: string;
};

export default function ListingInfo({
  title,
  price,
  currency,
  country,
  category,
  location,
  createdAt,
  description,
}: ListingInfoProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="mt-8 space-y-6">
      {/* Featured Badge */}
      <div className="flex items-center gap-3">
        <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold shadow">
          👑 FEATURED
        </span>

        <span className="text-xs text-gray-400">
          Premium Listing
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
        {title}
      </h1>

      {/* Price */}
      <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 shadow-xl">
        <p className="text-white/80 text-sm uppercase tracking-wider">
          Price
        </p>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-1">
          {formatPrice(price, country)}
        </h2>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-gray-400 mb-1">Category</p>
          <p className="text-white font-semibold">
            📂 {category}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-gray-400 mb-1">Location</p>
          <p className="text-white font-semibold">
            📍 {location}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-gray-400 mb-1">Posted</p>
          <p className="text-white font-semibold">
            🕒 {formattedDate}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-5">
          Description
        </h2>

        <div className="relative">
          <p
            className={`text-gray-300 whitespace-pre-line leading-8 transition-all duration-300 ${
              expanded ? "" : "line-clamp-6"
            }`}
          >
            {description}
          </p>

          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none rounded-b-3xl" />
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-3 text-white font-semibold transition"
          >
            {expanded ? "▲ Read Less" : "▼ Read More"}
          </button>
        </div>
      </div>
    </div>
  );
}