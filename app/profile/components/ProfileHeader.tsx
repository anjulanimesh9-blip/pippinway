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
    <section className="rounded-2xl border border-white/8 bg-[#151A22] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={userName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-[#0B0E14]"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-2xl font-bold ring-4 ring-[#0B0E14]">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-[#151A22]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{userName}</h1>
              {isVerified && (
                <BadgeCheck size={20} className="fill-sky-500 text-white" />
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span>{handle}</span>
              {isVerified && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  Verified Seller
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-sky-400" />
                {country || "Not set"}
              </span>
              <span>Member since {since}</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    reviewCount > 0
                      ? "fill-[#FBB03B] text-[#FBB03B]"
                      : "text-gray-600"
                  }
                />
              ))}
              <span className="ml-1 text-xs text-gray-400">
                ({reviewCount} Reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FBB03B]/20 bg-[#0B0E14] px-5 py-4 lg:min-w-[220px]">
          <p className="text-xs uppercase tracking-wider text-gray-400">
            Available Credits
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#FBB03B]">
            {featuredCredits}{" "}
            <span className="text-sm font-semibold text-gray-300">
              Featured Credits
            </span>
          </p>
          <Link
            href="/featured-packages"
            className="mt-2 inline-block text-sm font-semibold text-sky-400 hover:text-sky-300"
          >
            View Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
