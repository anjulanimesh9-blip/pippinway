/** Longest side after resize. Smaller images are left at native size. */
export const VIBE_IMAGE_MAX_EDGE_PX = 1200;
/** Single-pass WebP/JPEG quality for feed/post display. */
export const VIBE_IMAGE_QUALITY = 0.76;

const PROCESSABLE_TYPE = /^image\/(jpeg|jpg|png|webp)$/i;
const PREPARE_ERROR = "Could not prepare this photo. Please try another image.";

export function vibeImageExtension(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/png") return "png";
  if (normalized === "image/gif") return "gif";
  return "jpg";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function supportsWebPEncode(): boolean {
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    return probe.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function canvasHasTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

async function decodeImage(
  file: File
): Promise<{ width: number; height: number; image: CanvasImageSource; release: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        width: bitmap.width,
        height: bitmap.height,
        image: bitmap,
        release: () => bitmap.close(),
      };
    } catch {
      // Fall back to an <img> decode below.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(PREPARE_ERROR));
      el.src = objectUrl;
    });
    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      image,
      release: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

async function encodeVibeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  decoded: CanvasImageSource,
  width: number,
  height: number
): Promise<Blob> {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(decoded, 0, 0, width, height);

  if (supportsWebPEncode()) {
    const webp = await canvasToBlob(canvas, "image/webp", VIBE_IMAGE_QUALITY);
    if (webp && webp.size > 0 && webp.type === "image/webp") return webp;
  }

  const transparent = canvasHasTransparency(ctx, width, height);
  if (transparent) {
    const png = await canvasToBlob(canvas, "image/png");
    if (png && png.size > 0) return png;
    throw new Error(PREPARE_ERROR);
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(decoded, 0, 0, width, height);
  const jpeg = await canvasToBlob(canvas, "image/jpeg", VIBE_IMAGE_QUALITY);
  if (jpeg && jpeg.size > 0) return jpeg;
  throw new Error(PREPARE_ERROR);
}

/**
 * Resize and compress a Vibe post photo in the browser before Storage upload.
 * JPEG / PNG / WebP only. GIFs are returned unchanged so animation is kept.
 * Throws if the file cannot be decoded or encoded — never returns a broken blob.
 */
export async function optimizeVibeImage(file: File): Promise<File> {
  if (file.type && /^image\/gif$/i.test(file.type)) {
    return file;
  }
  if (file.type && !PROCESSABLE_TYPE.test(file.type)) {
    throw new Error(PREPARE_ERROR);
  }

  let decoded: Awaited<ReturnType<typeof decodeImage>> | null = null;
  try {
    decoded = await decodeImage(file);
    const { width, height, image } = decoded;
    if (width < 1 || height < 1) throw new Error(PREPARE_ERROR);

    const scale = Math.min(1, VIBE_IMAGE_MAX_EDGE_PX / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error(PREPARE_ERROR);

    const blob = await encodeVibeCanvas(canvas, ctx, image, targetW, targetH);
    if (scale === 1 && blob.size >= file.size) {
      return file;
    }

    const base = file.name.replace(/\.[^/.]+$/, "") || "vibe";
    const ext = vibeImageExtension(blob.type);
    return new File([blob], `${base}.${ext}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    if (err instanceof Error && err.message === PREPARE_ERROR) throw err;
    throw new Error(PREPARE_ERROR);
  } finally {
    decoded?.release();
  }
}
