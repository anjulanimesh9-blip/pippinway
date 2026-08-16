"use client";

import Link from "next/link";
import {
  FaCheckCircle,
  FaWhatsapp,
  FaPhoneAlt,
  FaGlobe,
  FaCalendarAlt,
  FaBoxOpen,
  FaShareAlt,
  FaCrown,
} from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";

import { Seller } from "../hooks/useSeller";

interface SellerHeaderProps {
  seller: Seller;
  totalListings: number;
}

export default function SellerHeader({
  seller,
  totalListings,
}: SellerHeaderProps) {
  const memberSince =
    seller.membershipSince?.toDate
      ? seller.membershipSince
          .toDate()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
      : "N/A";

  return (
    <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0F172A] shadow-2xl">

      {/* Cover */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-sky-700 via-cyan-600 to-indigo-900">

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />

        <div className="absolute bottom-6 left-8">

          <span className="rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-white">
            Pippinway Seller
          </span>

        </div>

      </div>

      <div className="px-8 pb-8">

        <div className="-mt-20 flex flex-col gap-6 lg:flex-row lg:items-end">

          {/* Avatar */}
          <div className="relative">

            <img
              src={
                seller.profileImage ||
                "https://placehold.co/250x250?text=Seller"
              }
              alt={seller.displayName || "Seller"}
              className="h-40 w-40 rounded-full border-4 border-cyan-400 bg-slate-700 object-cover shadow-[0_0_40px_rgba(34,211,238,0.45)]"
            />

            <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 border-2 border-[#020817]">
              <FaCheckCircle className="text-white text-lg" />
            </div>

          </div>

          {/* Details */}
          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {seller.displayName || "Unknown Seller"}
              </h1>

              {seller.membership === "pro" && (
                <span className="flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black shadow-lg">
                  <FaCrown />
                  PRO
                </span>
              )}

              {seller.verifiedSeller && (
                <span className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow">
                  <FaCheckCircle />
                  Verified
                </span>
              )}

            </div>

            <p className="mt-3 max-w-3xl text-slate-300">
              Buy with confidence from this trusted seller on
              Pippinway Marketplace.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <div className="flex items-center gap-3">

                  <FaGlobe className="text-cyan-400 text-xl" />

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Country
                    </p>

                    <p className="font-semibold text-white">
                      {seller.country || "Not specified"}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <div className="flex items-center gap-3">

                  <FaCalendarAlt className="text-emerald-400 text-xl" />

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Member Since
                    </p>

                    <p className="font-semibold text-white">
                      {memberSince}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <div className="flex items-center gap-3">

                  <FaBoxOpen className="text-orange-400 text-xl" />

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Listings
                    </p>

                    <p className="font-semibold text-white">
                      {totalListings}
                    </p>

                  </div>

                </div>

              </div>

            </div>
                        {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02]"
              >
                <BsChatDotsFill className="text-lg" />
                Message Seller
              </Link>

              {seller.whatsapp && (
                <a
                  href={`https://wa.me/${seller.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02]"
                >
                  <FaWhatsapp className="text-xl" />
                  WhatsApp
                </a>
              )}

              {seller.phone && (
                <a
                  href={`tel:${seller.phone}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02]"
                >
                  <FaPhoneAlt />
                  Call
                </a>
              )}

              <button
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: seller.displayName || "Seller",
                        url: window.location.href,
                      });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                      alert("Profile link copied!");
                    }
                  } catch {
                    // User cancelled or share failed
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                <FaShareAlt />
                Share
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}