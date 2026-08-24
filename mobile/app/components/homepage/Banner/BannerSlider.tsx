"use client";

import { useMemo, useState } from "react";
import BannerFitImage from "./BannerFitImage";
import { BANNER_ROW_HEIGHT_CLASS } from "@/app/components/homepage/Banner/BannerRotator";

type BannerSliderProps = {
  bannerImages: string[];
  currentBanner: number;
};

function isUsableSrc(src: unknown): src is string {
  if (typeof src !== "string") return false;
  const url = src.trim();
  if (!url) return false;
  return /^(https?:\/\/|\/|blob:|data:image\/)/i.test(url);
}

export default function BannerSlider({
  bannerImages,
  currentBanner,
}: BannerSliderProps) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());

  const slides = useMemo(
    () =>
      bannerImages
        .map((src, index) => ({ src: src.trim(), key: `${src}-${index}` }))
        .filter((slide) => isUsableSrc(slide.src) && !failed.has(slide.key)),
    [bannerImages, failed]
  );

  if (!slides.length) return null;

  const activeIndex = currentBanner % slides.length;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.12)] ${BANNER_ROW_HEIGHT_CLASS}`}
      aria-roledescription="carousel"
      aria-label="Advertisement"
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.key}
          className={
            slideIndex === activeIndex
              ? "absolute inset-0 z-10 opacity-100 transition-opacity duration-500"
              : "pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
          }
          aria-hidden={slideIndex !== activeIndex}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            <BannerFitImage
              src={slide.src}
              alt="Advertisement"
              fitMode="auto"
              eager={slideIndex === activeIndex}
              onError={() =>
                setFailed((current) => {
                  if (current.has(slide.key)) return current;
                  const next = new Set(current);
                  next.add(slide.key);
                  return next;
                })
              }
            />
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
          {slides.map((slide, slideIndex) => (
            <span
              key={`${slide.key}-dot`}
              className={`h-2 rounded-full transition ${
                slideIndex === activeIndex
                  ? "w-5 bg-yellow-400"
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
