import { isVibePostCategory } from "./categories";
import {
  VIBE_BIO_MAX,
  VIBE_COMMENT_MAX,
  VIBE_IMAGE_MAX_BYTES,
  VIBE_NAME_MAX,
  VIBE_REPORT_NOTE_MAX,
  VIBE_TEXT_MAX,
} from "./constants";
import {
  VIBE_REPORT_REASONS,
  type VibePostCategory,
  type VibeReportReason,
} from "./types";
import { isZodiacId, type ZodiacId } from "./zodiac";

export function clipText(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function sanitizeVibeText(value: string, max = VIBE_TEXT_MAX): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function countUrls(text: string): number {
  return (text.match(/https?:\/\/[^\s]+/gi) ?? []).length;
}

export function validatePostInput(input: {
  text: string;
  category: string;
  zodiacSign?: string;
  hasImage?: boolean;
}): { ok: true; text: string; category: VibePostCategory; zodiacSign?: ZodiacId } | { ok: false; error: string } {
  const text = sanitizeVibeText(input.text);
  if (!text) return { ok: false, error: "Write something before posting." };
  if (text.length > VIBE_TEXT_MAX) {
    return { ok: false, error: "This post is too long." };
  }
  if (countUrls(text) > 4) {
    return { ok: false, error: "Too many links. Please share your own words." };
  }
  if (!isVibePostCategory(input.category)) {
    return { ok: false, error: "Choose a Vibe category." };
  }
  let zodiacSign: ZodiacId | undefined;
  if (input.category === "your-stars" && input.zodiacSign) {
    if (!isZodiacId(input.zodiacSign)) {
      return { ok: false, error: "Choose a valid zodiac sign." };
    }
    zodiacSign = input.zodiacSign;
  }
  return { ok: true, text, category: input.category, zodiacSign };
}

export function validateCommentInput(text: string): { ok: true; text: string } | { ok: false; error: string } {
  const clean = sanitizeVibeText(text, VIBE_COMMENT_MAX);
  if (!clean) return { ok: false, error: "Write a comment first." };
  if (countUrls(clean) > 2) {
    return { ok: false, error: "Comments can include at most two links." };
  }
  return { ok: true, text: clean };
}

export function validateBio(text: string): string {
  return sanitizeVibeText(text, VIBE_BIO_MAX);
}

export function validateDisplayName(name: string): string {
  return sanitizeVibeText(name, VIBE_NAME_MAX) || "Member";
}

export function isAllowedVibeImage(file: File): boolean {
  if (file.size <= 0 || file.size > VIBE_IMAGE_MAX_BYTES) return false;
  if (file.type && !/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
    return false;
  }
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name) || /^image\//i.test(file.type);
}

export function isVibeReportReason(value: string): value is VibeReportReason {
  return (VIBE_REPORT_REASONS as readonly string[]).includes(value);
}

export function validateReportNote(note: string): string {
  return sanitizeVibeText(note, VIBE_REPORT_NOTE_MAX);
}
