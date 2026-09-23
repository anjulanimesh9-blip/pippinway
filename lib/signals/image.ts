export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function sniffImage(bytes: Uint8Array): { mime: (typeof ALLOWED_RECEIPT_TYPES)[number]; ext: string } | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", ext: "png" };
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export function validateReceipt(bytes: Uint8Array, claimedType?: string | null) {
  if (bytes.length < 32) return { ok: false as const, error: "Receipt image is too small." };
  if (bytes.length > MAX_RECEIPT_BYTES) return { ok: false as const, error: "Receipt must be 5MB or smaller." };
  const sniffed = sniffImage(bytes);
  if (!sniffed) return { ok: false as const, error: "Upload a JPEG, PNG or WebP receipt." };
  if (claimedType && claimedType !== "application/octet-stream" && claimedType !== sniffed.mime) {
    return { ok: false as const, error: "The file content does not match the declared image type." };
  }
  return { ok: true as const, mime: sniffed.mime, ext: sniffed.ext };
}
