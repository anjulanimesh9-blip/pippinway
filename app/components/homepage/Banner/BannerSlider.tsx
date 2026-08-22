"use client";

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
      <img
        src={src}
        alt="Advertisement"
        className="banner-slot-img"
      />
    </div>
  );
}
