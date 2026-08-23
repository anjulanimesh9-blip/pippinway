"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ListingPhoto, {
  GALLERY_MAIN_SIZES,
  GALLERY_PHOTO_QUALITY,
  GALLERY_THUMB_SIZES,
} from "@/app/components/ListingPhoto";

type ImageGalleryProps = {
  imageUrls?: string[];
  imageUrl?: string;
  title: string;
};

export default function ImageGallery({
  imageUrls,
  imageUrl,
  title,
}: ImageGalleryProps) {
  const images =
    imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") previousImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0B0E14]">
        <div className="relative h-[280px] sm:h-[380px] lg:h-[420px]">
          <ListingPhoto
            src={images[selectedImage]}
            alt={title}
            sizes={GALLERY_MAIN_SIZES}
            quality={GALLERY_PHOTO_QUALITY}
            eager
            className="cursor-zoom-in object-contain bg-[#0B0E14] select-none"
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label="Open image fullscreen"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <span className="absolute bottom-2 right-2 z-20 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {selectedImage + 1} / {images.length}
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`relative h-16 w-[76px] shrink-0 overflow-hidden rounded border ${
                selectedImage === index
                  ? "border-emerald-400"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <ListingPhoto
                src={image}
                alt={`${title} ${index + 1}`}
                sizes={GALLERY_THUMB_SIZES}
                quality={GALLERY_PHOTO_QUALITY}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(false);
            }}
            className="absolute right-5 top-5 text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-5 text-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
          )}
          <div
            className="relative h-[90vh] w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <ListingPhoto
              src={images[selectedImage]}
              alt={title}
              sizes="(max-width: 1024px) 95vw, 960px"
              quality={GALLERY_PHOTO_QUALITY}
              eager
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-5 text-white"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
