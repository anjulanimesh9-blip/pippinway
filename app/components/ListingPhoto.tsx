"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

export const LISTING_PHOTO_QUALITY = 65;
export const GALLERY_PHOTO_QUALITY = 50;

export const LISTING_THUMB_SIZES = "(min-width: 640px) 120px, 88px";
export const LISTING_GRID_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px";
export const FEATURED_CARD_SIZES = "(max-width: 1023px) 90vw, 32vw";
export const GALLERY_MAIN_SIZES = "(max-width: 640px) 100vw, 640px";
export const GALLERY_THUMB_SIZES = "76px";
export const RELATED_AD_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";
export const BANNER_INFEED_SIZES = "100vw";
export const BANNER_SIDEBAR_SIZES = "280px";

type ListingPhotoProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
  quality?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  onError?: () => void;
};

export function listingPhotoSrc(src?: string | null): string {
  if (typeof src === "string" && src.trim()) return src.trim();
  return "/placeholder.png";
}

const optimizeInProd = process.env.NODE_ENV === "production";

export default function ListingPhoto({
  src,
  alt,
  sizes,
  className,
  style,
  eager = false,
  quality = LISTING_PHOTO_QUALITY,
  fill = true,
  width,
  height,
  onError,
}: ListingPhotoProps) {
  const safeSrc = listingPhotoSrc(src);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <img
        src={safeSrc}
        alt={alt}
        className={className}
        style={
          fill
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                ...style,
              }
            : style
        }
        loading={eager ? "eager" : "lazy"}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      quality={quality}
      sizes={sizes}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={eager ? "eager" : "lazy"}
      unoptimized={!optimizeInProd}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
