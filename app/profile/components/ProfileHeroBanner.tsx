"use client";

import Link from "next/link";
import useBanners, { bannersForPlacement } from "@/app/hooks/useBanners";
import BannerRotator, {
  PROFILE_BANNER_CLASS,
} from "@/app/components/homepage/Banner/BannerRotator";

type Props = {
  country?: string | null;
};

export default function ProfileHeroBanner({ country }: Props) {
  const { banners, loading } = useBanners(country ?? null);

  if (loading && banners.length === 0) {
    return (
      <section
        className={`animate-pulse rounded-2xl border border-white/8 bg-[#101826] ${PROFILE_BANNER_CLASS}`}
      />
    );
  }

  const profileBanners = bannersForPlacement(banners, "profile");
  if (profileBanners.length > 0) {
    return (
      <BannerRotator banners={profileBanners} className={PROFILE_BANNER_CLASS} />
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/8 bg-[#101826] ${PROFILE_BANNER_CLASS}`}
    >
      <img
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-[#0B0E14]/20" />
      <div className="absolute right-6 top-5 hidden rounded-lg bg-[#FBB03B] px-3 py-1 text-xs font-extrabold text-black sm:block">
        20% OFF
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-5 md:px-8">
        <p className="text-[10px] font-bold tracking-[0.22em] text-[#FBB03B] sm:text-xs">
          NEED A CAR?
        </p>
        <h2 className="mt-0.5 max-w-md text-lg font-extrabold leading-tight text-white sm:mt-1 sm:text-2xl md:text-3xl">
          FIND THE PERFECT RIDE
        </h2>
        <Link
          href="/?category=Cars"
          className="mt-2 inline-flex w-fit items-center rounded-lg bg-[#FBB03B] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#ffc14d] sm:mt-4 sm:px-4 sm:py-2 sm:text-sm"
        >
          Browse Cars
        </Link>
      </div>
    </section>
  );
}
