import type { BannerFitMode } from "@/lib/types/featured";

/** Missing fitMode on older banners is Auto Fit. */
export function resolveBannerFitMode(
  fitMode?: BannerFitMode | string | null
): BannerFitMode {
  return fitMode === "cover" ? "cover" : "auto";
}

export function isValidHttpImageUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function preloadBannerImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = url;
  });
}

/** next/image only for hosts already allowed in next.config. */
export function canOptimizeBannerSrc(src: string): boolean {
  const url = src.trim();
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.startsWith("blob:") || url.startsWith("data:")) return false;
  try {
    const host = new URL(url).hostname;
    return (
      host === "firebasestorage.googleapis.com" ||
      host === "storage.googleapis.com" ||
      host.endsWith(".firebasestorage.app")
    );
  } catch {
    return false;
  }
}
