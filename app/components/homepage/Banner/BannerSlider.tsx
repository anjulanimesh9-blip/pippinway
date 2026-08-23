"use client";

import ListingPhoto, { BANNER_INFEED_SIZES } from "@/app/components/ListingPhoto";
import { BANNER_SLOT_IMG_STYLE } from "@/lib/bannerImages";

type BannerSliderProps = {
  bannerImages: string[];
  currentBanner: number;
};

export default function BannerSlider({
  bannerImages,
  currentBanner,
}: BannerSliderProps) {
  const slides = bannerImages.map((src) => src.trim()).filter(Boolean);
  if (!slides.length) return null;

  const activeIndex = currentBanner % slides.length;
  const src = slides[activeIndex];
  if (!src) return null;

  return (
    <div className="relative my-5 h-[140px] w-full overflow-hidden rounded-2xl border-2 border-yellow-500/50">
      <div className="relative h-full w-full overflow-hidden">
        <ListingPhoto
          src={src}
          alt="Advertisement"
          sizes={BANNER_INFEED_SIZES}
          className="banner-slot-img"
          style={BANNER_SLOT_IMG_STYLE}
        />
      </div>
    </div>
  );
}
