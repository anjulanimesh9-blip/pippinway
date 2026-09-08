import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/app/firebase";
import { compressListingImage } from "@/lib/compressImage";

export const VIBE_BANNER_DOC = ["siteSettings", "vibe"] as const;
export const VIBE_BANNER_STORAGE_PREFIX = "banners/vibe-hero-";

export type VibeBannerPosition = "center" | "top" | "left" | "right";

export type VibeBannerSettings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  supportingText: string;
  imageUrl: string;
  imagePath: string;
  imagePosition: VibeBannerPosition;
  ctaLabel: string;
  ctaHref: string;
  enabled: boolean;
  updatedAt?: unknown;
  updatedBy?: string;
};

export const DEFAULT_VIBE_BANNER: VibeBannerSettings = {
  eyebrow: "COMMUNITY",
  title: "Pippinway Vibe ✨",
  subtitle: "Good Vibes. Brighter Days.",
  supportingText: "Share • Read • Connect • Discover",
  imageUrl: "",
  imagePath: "",
  imagePosition: "center",
  ctaLabel: "",
  ctaHref: "",
  enabled: true,
};

const POSITIONS: VibeBannerPosition[] = ["center", "top", "left", "right"];

let cached: { at: number; data: VibeBannerSettings } | null = null;
const CACHE_MS = 60_000;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function isVibeBannerPosition(value: string): value is VibeBannerPosition {
  return POSITIONS.includes(value as VibeBannerPosition);
}

export function bannerObjectPosition(position: VibeBannerPosition): string {
  if (position === "top") return "center top";
  if (position === "left") return "left center";
  if (position === "right") return "right center";
  return "center";
}

export function safeBannerHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return "";
}

export function parseVibeBanner(data: Record<string, unknown> | undefined): VibeBannerSettings {
  if (!data) return { ...DEFAULT_VIBE_BANNER };
  const position = asString(data.imagePosition);
  return {
    eyebrow: asString(data.eyebrow),
    title: asString(data.title),
    subtitle: asString(data.subtitle),
    supportingText: asString(data.supportingText),
    imageUrl: asString(data.imageUrl),
    imagePath: asString(data.imagePath),
    imagePosition: isVibeBannerPosition(position) ? position : "center",
    ctaLabel: asString(data.ctaLabel),
    ctaHref: asString(data.ctaHref),
    enabled: asBool(data.enabled, true),
    updatedAt: data.updatedAt,
    updatedBy: asString(data.updatedBy) || undefined,
  };
}

export function resolveVibeBanner(raw: VibeBannerSettings): VibeBannerSettings {
  if (!raw.enabled) {
    return { ...DEFAULT_VIBE_BANNER, enabled: false };
  }
  return {
    ...DEFAULT_VIBE_BANNER,
    ...raw,
    eyebrow: raw.eyebrow.trim() || DEFAULT_VIBE_BANNER.eyebrow,
    title: raw.title.trim() || DEFAULT_VIBE_BANNER.title,
    subtitle: raw.subtitle.trim() || DEFAULT_VIBE_BANNER.subtitle,
    supportingText: raw.supportingText.trim() || DEFAULT_VIBE_BANNER.supportingText,
    imageUrl: raw.imageUrl.trim(),
    imagePath: raw.imagePath.trim(),
    imagePosition: raw.imagePosition,
    ctaLabel: raw.ctaLabel.trim(),
    ctaHref: safeBannerHref(raw.ctaHref),
    enabled: true,
  };
}

export function bustVibeBannerCache() {
  cached = null;
}

export async function getVibeBannerSettings(force = false): Promise<VibeBannerSettings> {
  if (!force && cached && Date.now() - cached.at < CACHE_MS) {
    return cached.data;
  }
  const snap = await getDoc(doc(db, ...VIBE_BANNER_DOC));
  const data = snap.exists()
    ? parseVibeBanner(snap.data() as Record<string, unknown>)
    : { ...DEFAULT_VIBE_BANNER };
  cached = { at: Date.now(), data };
  return data;
}

export async function uploadVibeBannerImage(file: File): Promise<{ url: string; path: string }> {
  const compressed = await compressListingImage(file);
  const path = `${VIBE_BANNER_STORAGE_PREFIX}${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: "image/jpeg" });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function removeVibeBannerImage(path: string) {
  if (!path.startsWith(VIBE_BANNER_STORAGE_PREFIX)) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Keep going if the old file is already gone.
  }
}

export async function saveVibeBannerSettings(
  input: VibeBannerSettings
): Promise<VibeBannerSettings> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in as admin to save.");
  const payload: VibeBannerSettings = {
    eyebrow: input.eyebrow.trim().slice(0, 40),
    title: input.title.trim().slice(0, 80),
    subtitle: input.subtitle.trim().slice(0, 120),
    supportingText: input.supportingText.trim().slice(0, 160),
    imageUrl: input.imageUrl.trim(),
    imagePath: input.imagePath.trim(),
    imagePosition: input.imagePosition,
    ctaLabel: input.ctaLabel.trim().slice(0, 40),
    ctaHref: safeBannerHref(input.ctaHref).slice(0, 300),
    enabled: input.enabled,
    updatedBy: user.uid,
  };
  await setDoc(
    doc(db, ...VIBE_BANNER_DOC),
    { ...payload, updatedAt: serverTimestamp() },
    { merge: true }
  );
  cached = { at: Date.now(), data: payload };
  return payload;
}
