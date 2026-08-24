"use client";

import { useEffect, useMemo, useState } from "react";
import type { Banner } from "@/lib/types/featured";
import bannerImages, { isUsableBannerSrc } from "@/lib/bannerImages";
import { BANNER_ROTATION_MS } from "@/app/hooks/useBanners";
import FirestoreBanner from "./FirestoreBanner";

/**
 * ~1.5× a listing thumb (homepage list: h-[88px] / sm:h-[120px]).
 * 88×1.5=132, 120×1.5=180 — under 2 thumbs (176 / 240). Do not use
 * aspect-ratio (16:5 at 1600px ≈ 500px). Auto Fit contain + blur fills width.
 */
export const BANNER_ROW_HEIGHT_CLASS =
  "h-[132px] max-h-[132px] sm:h-[180px] sm:max-h-[180px]";

/** In-feed / list banners: same compact row as a listing, not a 16:5 hero. */
export const INFEED_BANNER_CLASS =
  `relative w-full overflow-hidden ${BANNER_ROW_HEIGHT_CLASS}`;
/** Profile banner: same listing-row height so a flyer cannot inflate the bar. */
export const PROFILE_BANNER_CLASS =
  `relative w-full shrink-0 overflow-hidden ${BANNER_ROW_HEIGHT_CLASS}`;

type Props = {
  banners: Banner[];
  fallbackImages?: string[];
  startOffset?: number;
  className?: string;
};

function toFirestoreSlides(banners: Banner[]): Banner[] {
  return banners
    .map((banner) => ({
      ...banner,
      imageUrl: isUsableBannerSrc(banner.imageUrl) ? banner.imageUrl.trim() : "",
    }))
    .filter((banner) => Boolean(banner.imageUrl));
}

function toFallbackSlides(fallbackImages: string[]): Banner[] {
  return fallbackImages.filter(isUsableBannerSrc).map((imageUrl, index) => ({
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
  const firestoreSlides = useMemo(() => toFirestoreSlides(banners), [banners]);
  const fallbackSlides = useMemo(
    () => toFallbackSlides(fallbackImages),
    [fallbackImages]
  );
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    const live = firestoreSlides.filter((slide) => !failedIds.has(slide.id));
    if (live.length > 0) return live;
    return fallbackSlides.filter((slide) => !failedIds.has(slide.id));
  }, [firestoreSlides, fallbackSlides, failedIds]);

  const slideKey = slides.map((slide) => slide.id).join(",");

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
      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        const isNext = slideIndex === (activeIndex + 1) % slides.length;
        if (!isActive && !isNext) {
          return (
            <div
              key={slide.id}
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              aria-hidden
            />
          );
        }
        return (
        <div
          key={slide.id}
          className={
            isActive
              ? "absolute inset-0 z-10 overflow-hidden opacity-100 transition-opacity duration-500"
              : "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-500"
          }
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          aria-hidden={!isActive}
        >
          <FirestoreBanner
            banner={slide}
            framed={false}
            eager={isActive}
            onImageError={() =>
              setFailedIds((current) => {
                if (current.has(slide.id)) return current;
                const next = new Set(current);
                next.add(slide.id);
                return next;
              })
            }
          />
        </div>
        );
      })}

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
