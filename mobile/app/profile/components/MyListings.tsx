"use client";

import { formatPrice } from "@/lib/formatPrice";
import ListingPhoto from "@/app/components/ListingPhoto";

type MyListingsProps = {
  myAds: any[];
  userCurrency: string;
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function listingImage(ad: any): string {
  const first =
    ad.imageUrls?.[0] ||
    ad.imageUrl ||
    ad.images?.[0] ||
    ad.photos?.[0] ||
    ad.photo;
  return typeof first === "string" && first.trim() ? first : "/placeholder.png";
}

export default function MyListings({
  myAds,
  userCurrency,
  loading = false,
  onEdit,
  onDelete,
}: MyListingsProps) {
  return (
    <div
      id="my-listings"
      className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
        My Ads
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {loading && myAds.length === 0 ? (
          Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="bg-[#111827] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <div className="h-32 animate-pulse bg-white/5" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))
        ) : myAds.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No ads yet.
          </div>
        ) : (
          myAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#111827] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <ListingPhoto
                  src={listingImage(ad)}
                  alt={ad.title || "Listing"}
                  sizes="(max-width: 640px) 50vw, 200px"
                  quality={40}
                  className="object-cover"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm md:text-lg font-bold line-clamp-2">
                  {ad.title}
                </h3>

                <p className="text-gray-400 mt-1">{ad.location}</p>

                <p className="text-green-400 text-lg font-bold mt-2">
                  {formatPrice(ad.price ?? ad.amount, ad.country)}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => onEdit(ad.id)}
                    className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl w-full"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => onDelete(ad.id)}
                    className="bg-red-600 hover:bg-red-700 py-2 rounded-xl w-full"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
