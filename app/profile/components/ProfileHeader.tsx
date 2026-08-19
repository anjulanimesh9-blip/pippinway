"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { formatMemberSince, makeHandle } from "../utils";

type ProfileHeaderProps = {
  userName: string;
  email?: string | null;
  country?: string;
  membership?: string;
  verifiedSeller?: boolean;
  profileImage?: string;
  featuredCredits: number;
  memberSince?: unknown;
  accountCreatedAt?: string;
  reviewCount?: number;
};

export default function ProfileHeader({
  userName,
  email,
  country,
  membership,
  verifiedSeller,
  profileImage,
  featuredCredits,
  memberSince,
  accountCreatedAt,
  reviewCount = 0,
}: ProfileHeaderProps) {
  const isVerified = Boolean(verifiedSeller || membership === "pro");
  const handle = makeHandle(userName, email);
  const since = formatMemberSince(memberSince, accountCreatedAt);

  return (
    <section className="rounded-xl border border-white/8 bg-[#151A22] px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2.5 sm:gap-3 sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-3">
          <div className="relative shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={userName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0B0E14] sm:h-14 sm:w-14"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold ring-2 ring-[#0B0E14] sm:h-14 sm:w-14 sm:text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#151A22] sm:h-2.5 sm:w-2.5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-[15px] font-bold leading-tight text-white sm:text-base">
                {userName}
              </h1>
              {isVerified && (
                <BadgeCheck size={16} className="fill-sky-500 text-white" />
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
              <span>{handle}</span>
              {isVerified && (
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] font-semibold text-emerald-400">
                  Verified Seller
                </span>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 sm:mt-1 sm:gap-2.5">
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} className="text-sky-400" />
                {country || "Not set"}
              </span>
              <span>Member since {since}</span>
            </div>

            <div className="mt-0.5 flex items-center gap-1 sm:mt-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={12}
                  className={
                    reviewCount > 0
                      ? "fill-[#FBB03B] text-[#FBB03B]"
                      : "text-gray-600"
                  }
                />
              ))}
              <span className="ml-1 text-[11px] text-gray-400">
                ({reviewCount} Reviews)
              </span>
            </div>

            <p className="mt-1 text-[11px] sm:hidden">
              <span className="font-bold text-[#FBB03B]">
                {featuredCredits} credits
              </span>
              {" · "}
              <Link
                href="/featured-packages"
                className="font-semibold text-sky-400 hover:text-sky-300"
              >
                View Packages
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden rounded-xl border border-[#FBB03B]/20 bg-[#0B0E14] px-3.5 py-2.5 sm:block sm:min-w-[180px]">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            Available Credits
          </p>
          <p className="mt-0.5 text-lg font-extrabold leading-tight text-[#FBB03B]">
            {featuredCredits}{" "}
            <span className="text-xs font-semibold text-gray-300">
              Featured Credits
            </span>
          </p>
          <Link
            href="/featured-packages"
            className="mt-1 inline-block text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            View Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
