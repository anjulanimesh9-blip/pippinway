"use client";

import Link from "next/link";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaPhoneAlt,
} from "react-icons/fa";

type SellerCardProps = {
  uid?: string;
  name?: string;
  phone?: string;
  location?: string;
};

export default function SellerCard({
  uid,
  name,
  phone,
  location,
}: SellerCardProps) {
  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Seller Information
        </h2>

        <span className="flex items-center gap-2 rounded-full bg-green-600/20 px-3 py-1 text-sm font-medium text-green-400">
          <FaCheckCircle />
          Verified
        </span>
      </div>

      {/* Seller */}
      <div className="flex items-center gap-5">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
          <FaUserCircle className="text-5xl text-white" />
        </div>

        <div className="flex-1">

          <h3 className="text-2xl font-bold text-white">
            {name || "Private Seller"}
          </h3>

          <p className="mt-2 flex items-center gap-2 text-gray-400">
            <FaMapMarkerAlt className="text-red-500" />
            {location || "Location not specified"}
          </p>

          {phone && (
            <p className="mt-2 flex items-center gap-2 text-gray-300">
              <FaPhoneAlt className="text-green-500" />
              {phone}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Trusted seller on Pippinway Marketplace
          </p>

        </div>

      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xl font-bold text-white">✔</p>
          <p className="mt-1 text-xs text-gray-400">
            Verified
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xl font-bold text-white">24h</p>
          <p className="mt-1 text-xs text-gray-400">
            Response
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xl font-bold text-white">100%</p>
          <p className="mt-1 text-xs text-gray-400">
            Active
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500"
          >
            <FaPhoneAlt />
            Call Seller
          </a>
        )}

        {uid && (
          <Link
            href={`/seller/${uid}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02]"
          >
            <FaUserCircle className="text-xl" />
            View Seller Profile
          </Link>
        )}

      </div>

    </div>
  );
}