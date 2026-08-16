"use client";

import Link from "next/link";
import { FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

type RelatedAdsProps = {
  relatedAds: any[];
  currencyMap: Record<string, string>;
};

export default function RelatedAds({
  relatedAds,
  currencyMap,
}: RelatedAdsProps) {
  if (!relatedAds.length) return null;

  return (
    <section className="mt-14">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Similar Ads
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            You may also like these listings
          </p>
        </div>

        <span className="hidden md:flex items-center gap-2 text-blue-400 font-medium">
          Browse More
          <FaArrowRight />
        </span>
      </div>

      {/* Cards */}
      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">

        {relatedAds.map((ad) => {
          const currency =
            currencyMap[
              ad.country?.trim()?.toLowerCase()
            ] || "Rs.";

          return (
            <Link
              key={ad.id}
              href={`/listings/${ad.id}`}
              className="group min-w-[250px] md:min-w-[290px] rounded-3xl overflow-hidden border border-white/10 bg-[#111827] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500 snap-start"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={ad.imageUrls?.[0] || ad.imageUrl}
                  alt={ad.title}
                  className="h-[180px] w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {ad.featured && (
                  <div className="absolute top-3 left-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                    👑 FEATURED
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">

                <h3 className="line-clamp-2 text-lg font-bold text-white">
                  {ad.title}
                </h3>

                <p className="mt-3 text-2xl font-bold text-green-400">
                  {currency} {Number(ad.price).toLocaleString()}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span className="truncate">
                    {ad.location || "Unknown"}
                  </span>
                </div>

                <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white transition duration-300 group-hover:from-cyan-500 group-hover:to-blue-600">
                  View Details
                </button>

              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}