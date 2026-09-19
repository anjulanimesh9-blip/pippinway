import type { StoryProgress } from "./types";

function storageKey(slug: string) {
  return `vibe-story-progress:${slug}`;
}

export function readStoryProgress(slug: string): StoryProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryProgress;
    if (!parsed?.sceneId || !Array.isArray(parsed.path)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoryProgress(slug: string, progress: StoryProgress) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(storageKey(slug), JSON.stringify(progress));
}

export function clearStoryProgress(slug: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(slug));
}

function completedKey(slug: string) {
  return `vibe-story-completed:${slug}`;
}

export function markStoryCompletedLocally(slug: string, endingId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    completedKey(slug),
    JSON.stringify({ endingId, at: Date.now() })
  );
}

export function readStoryCompletedLocally(slug: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(completedKey(slug));
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { endingId?: string };
    return typeof parsed.endingId === "string" ? parsed.endingId : "";
  } catch {
    return "";
  }
}

function rewardIntentKey(slug: string) {
  return `vibe-story-reward-intent:${slug}`;
}

function spinRequestKey(slug: string) {
  return `vibe-story-spin-req:${slug}`;
}

export function writeStoryRewardIntent(slug: string, endingId: string) {
  if (typeof window === "undefined") return;
  markStoryCompletedLocally(slug, endingId);
  window.localStorage.setItem(
    rewardIntentKey(slug),
    JSON.stringify({ endingId, welcome: true, at: Date.now() })
  );
}

export function readStoryRewardIntent(slug: string): { endingId: string; welcome: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(rewardIntentKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { endingId?: string; welcome?: boolean };
    if (!parsed.endingId) return null;
    return { endingId: parsed.endingId, welcome: parsed.welcome === true };
  } catch {
    return null;
  }
}

export function storySpinRequestId(slug: string): string {
  if (typeof window === "undefined") {
    return `story-spin-${Date.now()}`;
  }
  const existing = window.localStorage.getItem(spinRequestKey(slug));
  if (existing && existing.length >= 8 && existing.length <= 80) return existing;
  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `story-spin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(spinRequestKey(slug), next);
  return next;
}
