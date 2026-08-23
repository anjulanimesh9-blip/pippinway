export const LISTING_IMAGE_MAX_EDGE_PX = 1600;
export const LISTING_IMAGE_JPEG_QUALITY = 0.85;
export const LISTING_IMAGE_SKIP_UNDER_BYTES = 200 * 1024;

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to decode image"));
    image.src = src;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

/**
 * Resize/compress a listing photo before Firebase Storage upload.
 * Skips files already under ~200KB. On decode failure, returns the original file.
 */
export async function compressListingImage(file: File): Promise<File> {
  if (file.size > 0 && file.size <= LISTING_IMAGE_SKIP_UNDER_BYTES) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(objectUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (width < 1 || height < 1) return file;

    const scale = Math.min(1, LISTING_IMAGE_MAX_EDGE_PX / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, targetW, targetH);

    const blob = await canvasToJpeg(canvas, LISTING_IMAGE_JPEG_QUALITY);
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^/.]+$/, "") || "listing";
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
