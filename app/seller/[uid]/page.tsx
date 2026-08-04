"use client";

import LoadingScreen from "../../settings/components/LoadingScreen";

import { useSeller } from "./hooks/useSeller";

import SellerHeader from "./components/SellerHeader";
import SellerStats from "./components/SellerStats";
import SellerListings from "./components/SellerListings";
import SellerAbout from "./components/SellerAbout";
import SellerContact from "./components/SellerContact";

export default function SellerPage() {
  const { loading, seller, listings } = useSeller();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Seller not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="mx-auto max-w-7xl space-y-6 p-6">

        {/* Seller Header */}
        <SellerHeader
          seller={seller}
          totalListings={listings.length}
        />

        {/* Seller Stats */}
        <SellerStats
          totalListings={listings.length}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

          {/* Listings */}
          <div className="lg:col-span-3">
            <SellerListings
              listings={listings}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            <SellerAbout
              seller={seller}
              listings={listings}
            />

            <SellerContact
              seller={seller}
            />

          </div>

        </div>

      </div>
    </div>
  );
}