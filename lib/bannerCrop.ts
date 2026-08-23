import type { BannerPlacement } from "@/lib/types/featured";

/**
 * Design sizes we asked advertisers to make (and the crop/export target).
 * Live slots use the same aspect (`aspect-[16/5]` / `aspect-[9/16]`) so
 * the crop matches what appears on the site.
 */
export const BANNER_SLOT_PX: Record<BannerPlacement, { width: number; height: number }> = {
  infeed: { width: 1600, height: 500 },
  profile: { width: 1600, height: 500 },
  sidebar: { width: 720, height: 1280 },
};

/** Locked crop aspect per banner slot (width / height). */
export const BANNER_CROP_ASPECT: Record<BannerPlacement, number> = {
  infeed: 16 / 5,
  profile: 16 / 5,
  sidebar: 9 / 16,
};

/** JPEG export matching the design size. */
export const BANNER_CROP_OUTPUT: Record<
  BannerPlacement,
  { width: number; height: number }
> = {
  infeed: { width: 1600, height: 500 },
  profile: { width: 1600, height: 500 },
  sidebar: { width: 720, height: 1280 },
};

export const BANNER_CROP_HINT: Record<BannerPlacement, string> = {
  infeed: "Crop to 16:5 — list banner size you were given (export 1600×500).",
  profile: "Crop to 16:5 — profile banner size you were given (export 1600×500).",
  sidebar: "Crop to 9:16 — sidebar banner size you were given (export 720×1280).",
};

/** Same frame language as live `BannerRotator`. */
export const BANNER_CROP_FRAME_CLASS =
  "rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.12)]";

export const BANNER_CROP_MAX_ZOOM = 4;

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Scale that fills the crop rectangle (no letterboxing). */
export function coverScale(nw: number, nh: number, cropW: number, cropH: number) {
  if (nw <= 0 || nh <= 0 || cropW <= 0 || cropH <= 0) return 1;
  return Math.max(cropW / nw, cropH / nh);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for crop"));
    image.src = src;
  });
}

function clampCrop(crop: PixelCrop, image: HTMLImageElement): PixelCrop {
  const maxW = image.naturalWidth;
  const maxH = image.naturalHeight;
  const x = Math.min(Math.max(0, crop.x), Math.max(0, maxW - 1));
  const y = Math.min(Math.max(0, crop.y), Math.max(0, maxH - 1));
  const width = Math.min(crop.width, maxW - x);
  const height = Math.min(crop.height, maxH - y);
  return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
}

export async function cropImageToJpeg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  output: { width: number; height: number },
  quality = 0.78
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const source = clampCrop(pixelCrop, image);
  const canvas = document.createElement("canvas");
  canvas.width = output.width;
  canvas.height = output.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    0,
    0,
    output.width,
    output.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to export cropped image"));
        else resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

export function croppedJpegFileName(originalName: string): string {
  const base = originalName.replace(/\.[^/.]+$/, "") || "banner";
  return `${base}.jpg`;
}
