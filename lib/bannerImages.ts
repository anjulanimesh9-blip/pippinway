import type { CSSProperties } from "react";

const bannerImages = [
  "/images/banner-ad-1.jpg",
  "/images/banner-ad-2.jpg",
  "/images/banner-ad-3.jpg",
];

/**
 * Absolute fill. Tailwind v4 / globals `img { height: auto }` beats
 * utility `h-full`. Inline height:100% wins. object-fit is set per layer
 * (contain vs cover) by BannerFitImage — do not force cover here.
 */
export const BANNER_SLOT_IMG_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  maxWidth: "none",
  maxHeight: "none",
  objectPosition: "center",
};

export const BANNER_CONTAIN_IMG_STYLE: CSSProperties = {
  ...BANNER_SLOT_IMG_STYLE,
  objectFit: "contain",
};

export const BANNER_COVER_IMG_STYLE: CSSProperties = {
  ...BANNER_SLOT_IMG_STYLE,
  objectFit: "cover",
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
