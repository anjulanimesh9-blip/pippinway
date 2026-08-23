import { formatPrice } from "@/lib/formatPrice";

type MyListingsProps = {
  myAds: any[];
  userCurrency: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MyListings({
  myAds,
  userCurrency,
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

        {myAds.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No ads yet.
          </div>
        ) : (
          myAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#111827] border border-gray-800 rounded-[22px] overflow-hidden"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-32 object-cover"
              />

              <div className="p-3">
                <h3 className="text-sm md:text-lg font-bold line-clamp-2">
                  {ad.title}
                </h3>

                <p className="text-gray-400 mt-1">
                  {ad.location}
                </p>

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