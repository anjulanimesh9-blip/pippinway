const bannerImages = [
  "/images/banner-ad-1.jpg",
  "/images/banner-ad-2.jpg",
  "/images/banner-ad-3.jpg",
];

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
