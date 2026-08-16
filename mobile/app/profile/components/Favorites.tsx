import Link from "next/link";

type FavoritesProps = {
  favoriteAds: any[];
  currencyMap: Record<string, string>;
  onRemove: (listingId: string) => void;
};

export default function Favorites({
  favoriteAds,
  currencyMap,
  onRemove,
}: FavoritesProps) {
  return (
    <div
      id="favorites"
      className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 mb-8 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
        My Favorites ❤️
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {favoriteAds.length === 0 ? (
          <p className="text-gray-400">
            No favorites yet
          </p>
        ) : (
          favoriteAds.map((ad) => (
            <Link
              key={ad.id}
              href={`/listings/${ad.id}`}
              className="bg-[#0f172a] border border-gray-800 rounded-[22px] overflow-hidden hover:scale-[1.02] transition"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-32 object-cover rounded-t-[22px]"
              />

              <div className="p-3">

                <h3 className="text-sm md:text-lg font-bold line-clamp-2">
                  {ad.title}
                </h3>

                <p className="text-gray-400 mt-1">
                  {ad.location}
                </p>

                <p className="text-green-400 text-lg font-bold mt-2">
                  {currencyMap[ad.country] || ""}{" "}
                  {Number(ad.price).toLocaleString()}
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(ad.id);
                  }}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium transition"
                >
                  ❤️ Remove
                </button>

              </div>
            </Link>
          ))
        )}

      </div>
    </div>
  );
}