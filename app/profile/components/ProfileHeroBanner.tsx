"use client";

import Link from "next/link";
import useBanners from "@/app/hooks/useBanners";
import FirestoreBanner from "@/app/components/homepage/Banner/FirestoreBanner";

type Props = {
  country?: string | null;
};

export default function ProfileHeroBanner({ country }: Props) {
  const { currentBanner, loading } = useBanners(country ?? null);

  if (loading && !currentBanner) {
    return (
      <section className="h-40 animate-pulse rounded-2xl border border-white/8 bg-[#101826] md:h-44" />
    );
  }

  if (currentBanner) {
    return (
      <section className="overflow-hidden rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        <FirestoreBanner banner={currentBanner} />
      </section>
    );
  }

  return (
    <section className="relative h-40 overflow-hidden rounded-2xl border border-white/8 bg-[#101826] md:h-44">
      <img
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-[#0B0E14]/20" />
      <div className="absolute right-6 top-5 hidden rounded-lg bg-[#FBB03B] px-3 py-1 text-xs font-extrabold text-black sm:block">
        20% OFF
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-5 md:px-8">
        <p className="text-xs font-bold tracking-[0.22em] text-[#FBB03B]">
          NEED A CAR?
        </p>
        <h2 className="mt-1 max-w-md text-2xl font-extrabold leading-tight text-white md:text-3xl">
          FIND THE PERFECT RIDE
        </h2>
        <Link
          href="/?category=Cars"
          className="mt-4 inline-flex w-fit items-center rounded-lg bg-[#FBB03B] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#ffc14d]"
        >
          Browse Cars
        </Link>
      </div>
    </section>
  );
}
