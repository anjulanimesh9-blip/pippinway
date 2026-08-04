"use client";

type BannerSliderProps = {
  bannerImages: string[];
  currentBanner: number;
};

export default function BannerSlider({
  bannerImages,
  currentBanner,
}: BannerSliderProps) {
  return (
    <div className="my-5 w-full flex justify-center">
      <img
        src={bannerImages[currentBanner]}
        alt="Banner"
        className="
          w-full
          max-w-[1200px]
          h-auto
          rounded-2xl
          object-contain
        "
      />
    </div>
  );
}