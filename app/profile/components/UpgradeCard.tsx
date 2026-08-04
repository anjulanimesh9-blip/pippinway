type UpgradeCardProps = {
  membership?: string;
  proRequest?: boolean;
  onRequestPro: () => void;
};

export default function UpgradeCard({
  membership,
  proRequest,
  onRequestPro,
}: UpgradeCardProps) {
  if (membership === "pro") return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/40 rounded-3xl p-5 sm:p-8 mb-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        {/* Left */}
        <div className="flex-1">

          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 leading-tight">
            ⭐ Upgrade to
            <br className="sm:hidden" />
            <span className="sm:ml-2">Seller Pro</span>
          </h2>

          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            Get more power to sell faster.
          </p>

          <div className="mt-4 space-y-2 text-sm sm:text-base text-gray-300">

            <div>✅ 30 Ads / Month</div>

            <div>✅ 10 Featured Ads FREE</div>

            <div>✅ Verified Seller Badge</div>

            <div className="hidden sm:block">
              ✅ Priority Listings
            </div>

          </div>

        </div>

        {/* Right */}
        <div className="flex flex-col items-center lg:items-end">

          <div className="text-center">

            <h2 className="text-4xl sm:text-5xl font-bold text-green-400">
              $5
            </h2>

            <p className="text-gray-400 text-sm sm:text-base">
              / month
            </p>

          </div>

          {proRequest ? (
            <button
              className="mt-5 w-full lg:w-auto bg-gray-700 text-white px-6 py-3 rounded-2xl font-bold cursor-not-allowed"
            >
              ⏳ Waiting Approval
            </button>
          ) : (
            <button
              onClick={onRequestPro}
              className="mt-5 w-full lg:w-auto bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-2xl font-bold transition"
            >
              ⭐ Request Pro Seller
            </button>
          )}

        </div>

      </div>

    </div>
  );
}