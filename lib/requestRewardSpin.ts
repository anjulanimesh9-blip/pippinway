"use client";

import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/firebase";
import type { SpinResult, SpinType } from "@/lib/rewards";

export async function requestRewardSpin(
  type: SpinType
): Promise<SpinResult> {
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `spin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const spinReward = httpsCallable<
    { type: SpinType; requestId: string },
    SpinResult
  >(functions, "spinReward");

  try {
    const response = await spinReward({ type, requestId });
    return response.data;
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "";

    if (code === "functions/failed-precondition" || message.includes("NO_SPINS")) {
      throw new Error(
        type === "mega"
          ? "You don't have a Mega Spin available yet."
          : "You don't have a spin available yet."
      );
    }
    if (code === "functions/unauthenticated") {
      throw new Error("Please log in to spin.");
    }
    if (code === "functions/not-found" || code === "functions/unavailable") {
      throw new Error(
        "Rewards are temporarily unavailable. Deploy Cloud Functions, then try again."
      );
    }

    console.error("spinReward failed:", err);
    throw new Error("Could not complete this spin. Please try again.");
  }
}
