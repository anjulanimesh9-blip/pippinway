import type { CSSProperties } from "react";

const bannerImages = [
  "/images/banner-ad-1.jpg",
  "/images/banner-ad-2.jpg",
  "/images/banner-ad-3.jpg",
];

/**
 * Inline cover fill. Tailwind v4 / globals `img { height: auto }` beats
 * utility `h-full` and can beat a class on replaced <img>s, leaving a
 * landscape strip at the top of a tall slot. Inline height:100% + cover wins.
 */
export const BANNER_SLOT_IMG_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  maxWidth: "none",
  maxHeight: "none",
  objectFit: "cover",
  objectPosition: "center",
};

export function isUsableBannerSrc(src: unknown): src is string {
  if (typeof src !== "string") return false;
  const url = src.trim();
  if (!url) return false;
  return /^(https?:\/\/|\/|blob:|data:image\/)/i.test(url);
}

export function resolveBannerImageUrl(
  data: Record<string, unknown> | null | undefined
): string {
  if (!data) return "";
  for (const key of ["imageUrl", "imageURL", "image", "url", "src", "photoUrl"]) {
    const value = data[key];
    if (isUsableBannerSrc(value)) return value.trim();
  }
  return "";
}

export default bannerImages;
