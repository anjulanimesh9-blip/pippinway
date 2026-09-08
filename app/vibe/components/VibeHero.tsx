"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ListingPhoto from "@/app/components/ListingPhoto";
import {
  bannerObjectPosition,
  DEFAULT_VIBE_BANNER,
  getVibeBannerSettings,
  resolveVibeBanner,
  type VibeBannerSettings,
} from "@/lib/vibe/banner";
import { VIBE_PATHS } from "@/lib/vibe/constants";

export default function VibeHero({ compact = false }: { compact?: boolean }) {
  const [banner, setBanner] = useState<VibeBannerSettings>(DEFAULT_VIBE_BANNER);

  useEffect(() => {
    let cancelled = false;
    void getVibeBannerSettings()
      .then((data) => {
        if (!cancelled) setBanner(resolveVibeBanner(data));
      })
      .catch(() => {
        if (!cancelled) setBanner(DEFAULT_VIBE_BANNER);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const imageUrl = banner.enabled ? banner.imageUrl : "";
  const ctaHref = banner.enabled ? banner.ctaHref : "";
  const ctaLabel = banner.enabled ? banner.ctaLabel : "";
  const showCta = Boolean(ctaHref && ctaLabel);
  const fallbackCta = !compact && !showCta;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#0f172a] ${
        compact ? "px-4 py-4 sm:px-6 sm:py-5" : "px-4 py-5 sm:px-8 sm:py-8"
      }`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FBB03B]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-3 text-lg opacity-50 sm:right-10 sm:text-2xl">✦</div>
      <div className="pointer-events-none absolute right-16 bottom-3 text-sm text-[#FBB03B]/70 sm:right-24">✧</div>
      <div
        className={`relative z-10 grid items-center gap-4 ${
          imageUrl ? "md:grid-cols-[minmax(0,1fr)_minmax(140px,42%)]" : ""
        }`}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">
            {banner.eyebrow}
          </p>
          <h1 className={`font-bold tracking-tight text-white ${compact ? "mt-1 text-2xl" : "mt-1 text-3xl sm:text-4xl"}`}>
            {banner.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-100 sm:text-base">
            {banner.subtitle}
          </p>
          <p className="mt-1 text-xs text-gray-300 sm:text-sm">
            {banner.supportingText}
          </p>
          {showCta ? (
            ctaHref.startsWith("/") ? (
              <Link
                href={ctaHref}
                className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
              >
                {ctaLabel}
              </Link>
            ) : (
              <a
                href={ctaHref}
                className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
                rel="noopener noreferrer"
                target="_blank"
              >
                {ctaLabel}
              </a>
            )
          ) : fallbackCta ? (
            <Link
              href={VIBE_PATHS.home}
              className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
            >
              Open the feed
            </Link>
          ) : null}
        </div>
        {imageUrl ? (
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <ListingPhoto
              src={imageUrl}
              alt=""
              fill={false}
              width={900}
              height={600}
              sizes="(max-width: 768px) 100vw, 360px"
              className={`${compact ? "max-h-36 sm:max-h-44" : "max-h-44 sm:max-h-56"} mx-auto h-auto w-full object-contain`}
              style={{
                width: "100%",
                height: "auto",
                objectPosition: bannerObjectPosition(banner.imagePosition),
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
