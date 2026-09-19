"use client";

import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/firebase";
import type { PrizeKey, SpinResult } from "@/lib/rewards";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { storySpinRequestId } from "./progress";

export type StoryRewardEvent =
  | "read"
  | "complete"
  | "signup"
  | "verified"
  | "listing_created"
  | "featured_redeemed";

export type StoryRewardStatus = {
  storySlug: string;
  completed: boolean;
  registeredFromStory: boolean;
  verified: boolean;
  attemptUsed: boolean;
  prizeKey: PrizeKey | null;
  prizeLabel: string | null;
  featuredCreditsAwarded: number;
  cashAmount: number;
  bonusSpin: boolean;
  featuredRedeemed: boolean;
  historyId: string | null;
  listingId: string | null;
};

export type StoryRewardSpinResult = SpinResult & {
  storySlug?: string;
  source?: "interactive-story";
  alreadyCommitted?: boolean;
};

export type StoryRewardAnalyticsRow = {
  storySlug: string;
  title: string;
  readers: number;
  completions: number;
  registrationConversions: number;
  verifiedRegistrations: number;
  rewardAttempts: number;
  featuredIssued: number;
  featuredRedeemed: number;
  listingsCreated: number;
};

export type StoryRewardAnalytics = {
  totals: StoryRewardAnalyticsRow;
  stories: StoryRewardAnalyticsRow[];
};

export function storyRewardReturnPath(slug: string, endingId?: string, welcome = false) {
  return VIBE_PATHS.storyReward(slug, endingId, welcome);
}

export function storyEndingFromReturnUrl(url: string): string {
  try {
    const parsed = new URL(url, "https://pippinway.local");
    return parsed.searchParams.get("scene") || "";
  } catch {
    const match = url.match(/[?&]scene=([^&]+)/);
    if (!match?.[1]) return "";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
}

export function storySlugFromReturnUrl(url: string): string {
  const match = url.match(/\/vibe\/interactive-stories\/([^/?#]+)/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function callableError(err: unknown) {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : "";
  return { code, message };
}

export async function recordStoryRewardEvent(input: {
  storySlug: string;
  event: StoryRewardEvent;
  endingId?: string;
  listingId?: string;
}): Promise<Partial<StoryRewardStatus>> {
  const call = httpsCallable<typeof input, Partial<StoryRewardStatus>>(
    functions,
    "recordStoryRewardEvent"
  );
  const response = await call(input);
  return response.data;
}

export async function fetchStoryRewardStatus(storySlug: string): Promise<StoryRewardStatus> {
  const call = httpsCallable<{ storySlug: string }, StoryRewardStatus>(
    functions,
    "getStoryRewardStatus"
  );
  const response = await call({ storySlug });
  return response.data;
}

export async function requestStoryRewardSpin(
  storySlug: string,
  endingId?: string
): Promise<StoryRewardSpinResult> {
  const requestId = storySpinRequestId(storySlug);

  const call = httpsCallable<
    { storySlug: string; requestId: string; endingId?: string },
    StoryRewardSpinResult
  >(functions, "spinStoryReward");

  try {
    const response = await call({ storySlug, requestId, endingId });
    return response.data;
  } catch (err) {
    console.error("spinStoryReward failed:", err);
    const { code, message } = callableError(err);
    if (message.includes("STORY_ATTEMPT_USED")) {
      throw new Error("You already used your reward attempt for this story.");
    }
    if (message.includes("STORY_NOT_COMPLETE")) {
      throw new Error("Finish the story to unlock this reward.");
    }
    if (message.includes("User profile not found")) {
      throw new Error("Your account profile is still missing. Sign out, register or log in again, then retry.");
    }
    if (message.includes("not published") || message.includes("Story not found")) {
      throw new Error("This story is not available for rewards.");
    }
    if (code === "functions/resource-exhausted") {
      throw new Error("Too many reward attempts. Try again later.");
    }
    if (code === "functions/unauthenticated") {
      throw new Error("Sign in to claim your reward.");
    }
    if (code === "functions/not-found" || code === "functions/unavailable") {
      throw new Error(
        "Rewards are temporarily unavailable. Deploy Cloud Functions, then try again."
      );
    }
    throw new Error("Could not complete this spin. Please try again.");
  }
}

export async function fetchStoryRewardAnalytics(): Promise<StoryRewardAnalytics> {
  const call = httpsCallable<Record<string, never>, StoryRewardAnalytics>(
    functions,
    "getStoryRewardAnalytics"
  );
  const response = await call({});
  return response.data;
}
