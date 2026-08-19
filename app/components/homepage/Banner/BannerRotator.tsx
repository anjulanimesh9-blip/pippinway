"use client";

import { useEffect, useMemo, useState } from "react";
import type { Banner } from "@/lib/types/featured";
import bannerImages from "@/lib/bannerImages";
import { BANNER_ROTATION_MS } from "@/app/hooks/useBanners";
import FirestoreBanner from "./FirestoreBanner";

/** In-feed / list banners: compact ~140px strip on phone/Capacitor (max-lg). Taller only on desktop. Never 9:16. */
export const INFEED_BANNER_CLASS =
  "h-[140px] w-full overflow-hidden max-lg:h-[140px] lg:h-[240px] xl:h-[280px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover";
/** Short on phones (~2 compact rows); taller only at lg+ so the image fills, no letterbox. */
export const PROFILE_BANNER_CLASS =
  "h-[140px] w-full overflow-hidden max-lg:h-[140px] lg:h-[240px] xl:h-[280px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover";
/** Desktop right-column skyscraper only — do not use this frame on small screens. */
export const SIDEBAR_BANNER_CLASS =
  "aspect-[9/16] w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover";
/** Mobile stand-in for the sidebar: wide ~140px strip (~2 list rows), not 9:16. */
export const MOBILE_SIDEBAR_BANNER_CLASS =
  "h-[140px] w-full overflow-hidden max-lg:h-[140px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

type Props = {
  banners: Banner[];
  fallbackImages?: string[];
  startOffset?: number;
  className?: string;
};

function toSlides(banners: Banner[], fallbackImages: string[]): Banner[] {
  const withImages = banners.filter((banner) => Boolean(banner.imageUrl));
  if (withImages.length > 0) return withImages;

  return fallbackImages.map((imageUrl, index) => ({
    id: `fallback-banner-${index}`,
    imageUrl,
    linkType: "none" as const,
  }));
}

export default function BannerRotator({
  banners,
  fallbackImages = bannerImages,
  startOffset = 0,
  className = "",
}: Props) {
  const slides = useMemo(
    () => toSlides(banners, fallbackImages),
    [banners, fallbackImages]
  );
  const slideKey = slides.map((slide) => slide.id).join(",");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length === 0) return;
    setIndex(startOffset % slides.length);
  }, [slideKey, startOffset, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, BANNER_ROTATION_MS);

    return () => clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const activeIndex = index % slides.length;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.12)] ${className || INFEED_BANNER_CLASS}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Advertisement"
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          className={
            slideIndex === activeIndex
              ? "absolute inset-0 z-10 opacity-100 transition-opacity duration-500"
              : "pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
          }
          aria-hidden={slideIndex !== activeIndex}
        >
          <FirestoreBanner banner={slide} framed={false} />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5 sm:bottom-3">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show advertisement ${slideIndex + 1}`}
              aria-current={slideIndex === activeIndex}
              className={`h-2 rounded-full transition ${
                slideIndex === activeIndex
                  ? "w-5 bg-yellow-400"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
