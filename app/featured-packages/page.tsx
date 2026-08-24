"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import useFeaturedPackages from "@/app/hooks/useFeaturedPackages";
import { buildPackageSnapshot, getPackageDurationDays } from "@/lib/featuredPackageUtils";

export default function FeaturedPackagesPage() {
  const { namedPackages, legacyPackages, loading } = useFeaturedPackages();
  const hasNamed = namedPackages.length > 0;

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Featured Packages</h1>
        <p className="text-gray-400 mb-8">
          Choose a package, select your ad, upload payment proof, and get credits after admin approval.
        </p>

        {loading ? (
          <p className="text-gray-400">Loading packages...</p>
        ) : !hasNamed && legacyPackages.length === 0 ? (
          <p className="text-gray-400">No featured packages are available right now.</p>
        ) : (
          <div className="space-y-4">
            {(hasNamed ? namedPackages : legacyPackages).map((pkg) => {
              const snapshot = buildPackageSnapshot(pkg);
              const duration = getPackageDurationDays(pkg);
              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {snapshot.packageName}
                    </h2>
                    {pkg.description ? (
                      <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>
                    ) : null}
                    <p className="text-sm text-gray-300 mt-2">
                      {snapshot.packageCredits} Featured Ads · {duration} days each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-300">
                      {snapshot.packageCurrency} {snapshot.packagePrice}
                    </p>
                    <Link
                      href={`/featured-packages/checkout?packageId=${encodeURIComponent(snapshot.packageId)}&packageName=${encodeURIComponent(snapshot.packageName)}&packageCredits=${snapshot.packageCredits}&packageDurationDays=${snapshot.packageDurationDays}&packagePrice=${snapshot.packagePrice}&packageCurrency=${encodeURIComponent(snapshot.packageCurrency)}${snapshot.country ? `&country=${encodeURIComponent(snapshot.country)}` : ""}`}
                      className="mt-3 inline-block rounded-xl bg-violet-600 px-5 py-2 font-bold text-white hover:bg-violet-500"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
