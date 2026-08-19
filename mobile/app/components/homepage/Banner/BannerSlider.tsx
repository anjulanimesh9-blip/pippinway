"use client";

type BannerSliderProps = {
  bannerImages: string[];
  currentBanner: number;
};

export default function BannerSlider({
  bannerImages,
  currentBanner,
}: BannerSliderProps) {
  if (!bannerImages.length) return null;

  const activeIndex = currentBanner % bannerImages.length;

  return (
    <div
      className="relative h-[140px] w-full overflow-hidden rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.12)]"
      aria-roledescription="carousel"
      aria-label="Advertisement"
    >
      {bannerImages.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          className={
            slideIndex === activeIndex
              ? "absolute inset-0 z-10 opacity-100 transition-opacity duration-500"
              : "pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
          }
          aria-hidden={slideIndex !== activeIndex}
        >
          <img
            src={src}
            alt="Advertisement"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      ))}

      {bannerImages.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
          {bannerImages.map((src, slideIndex) => (
            <span
              key={`${src}-dot-${slideIndex}`}
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
