"use client";

import { useEffect, useState } from "react";

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
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : imageUrl
      ? [imageUrl]
      : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      if (e.key === "Escape") {
        setIsFullscreen(false);
      }

      if (e.key === "ArrowRight") {
        nextImage();
      }

      if (e.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, images.length]);

  if (!images.length) return null;

 return (
  <>
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black shadow-xl">

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => history.back()}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            ←
          </button>
        </div>

        {/* Favorite + Share */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition">
            ♡
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }
            }}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            ↗
          </button>
        </div>

        {/* Previous */}
        {images.length > 1 && (
          <button
            onClick={previousImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white text-2xl flex items-center justify-center hover:bg-black/80 transition"
          >
            ❮
          </button>
        )}

        {/* Main Image — keep all slides mounted so Next is instant */}
        <div className="relative w-full h-[260px] sm:h-[340px]">
          {images.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={title}
              onClick={() => setIsFullscreen(true)}
              loading={
                index === selectedImage ||
                index === (selectedImage + 1) % images.length
                  ? "eager"
                  : "lazy"
              }
              decoding="async"
              className={`absolute inset-0 h-full w-full object-contain cursor-zoom-in select-none ${
                index === selectedImage ? "z-[1]" : "invisible"
              }`}
            />
          ))}
        </div>

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white text-2xl flex items-center justify-center hover:bg-black/80 transition"
          >
            ❯
          </button>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full">
          📷 {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              selectedImage === index
                ? "w-8 bg-blue-500"
                : "w-2 bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
              selectedImage === index
                ? "border-blue-500"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-14 w-14 object-cover"
            />
          </button>
        ))}
      </div>
    </div>

    {/* Full Screen Viewer */}
    {isFullscreen && (
      <div
        onClick={() => setIsFullscreen(false)}
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(false);
          }}
          className="absolute top-5 right-5 text-white text-4xl"
        >
          ✕
        </button>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="absolute left-5 text-white text-5xl"
          >
            ❮
          </button>
        )}

        <img
          src={images[selectedImage]}
          alt={title}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[95vw] max-h-[90vh] object-contain select-none"
        />

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-5 text-white text-5xl"
          >
            ❯
          </button>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white">
          📷 {selectedImage + 1} / {images.length}
        </div>
      </div>
    )}
  </>
);
}