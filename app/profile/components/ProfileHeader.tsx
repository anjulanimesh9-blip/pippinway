"use client";

import {
  FaCheckCircle,
  FaCrown,
  FaGlobe,
  FaCalendarAlt,
  FaPlus,
  FaStore,
} from "react-icons/fa";
import Link from "next/link";

type ProfileHeaderProps = {
  greeting: string;
  userName: string;
  country?: string;
  membership?: string;
  proExpiryDate?: any;
};

export default function ProfileHeader({
  greeting,
  userName,
  country,
  membership,
  proExpiryDate,
}: ProfileHeaderProps) {
  const expiry =
    membership === "pro" && proExpiryDate?.seconds
      ? new Date(proExpiryDate.seconds * 1000).toLocaleDateString("en-GB")
      : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] p-4 shadow-2xl">

      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="flex items-center gap-5">

          {/* Avatar */}
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-cyan-400 bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl sm:text-2xl sm:text-3xl font-bold text-white shadow-[0_0_30px_rgba(34,211,238,0.35)]">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>

            <p className="text-sm text-slate-400">{greeting}</p>

            <div className="mt-1 flex flex-wrap items-center gap-3">

              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-white">
                {userName}
              </h1>

              {membership === "pro" && (
                <span className="flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
                  <FaCrown />
                  PRO
                </span>
              )}

              <span className="flex items-center gap-1 text-emerald-400">
                <FaCheckCircle />
                Verified
              </span>

            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-300">

              <span className="flex items-center gap-2">
                <FaGlobe className="text-cyan-400" />
                {country || "Unknown"}
              </span>

              {expiry && (
                <span className="flex items-center gap-2">
                  <FaCalendarAlt className="text-yellow-400" />
                  PRO until {expiry}
                </span>
              )}

            </div>

          </div>

        </div>

        {/* Right */}
        <div className="flex flex-wrap gap-4">

          <Link
            href="/add-listing"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-semibold text-white transition hover:scale-105"
          >
            <FaPlus />
            Post New Ad
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            <FaStore />
            Browse Ads
          </Link>

        </div>

      </div>
    </div>
  );
}