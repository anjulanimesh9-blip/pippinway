"use client";

import { httpsCallable } from "firebase/functions";
import { functions } from "../app/firebase";
import type {
  PaymentMethod,
  RewardHistoryStatus,
  RewardPaymentDetails,
} from "./rewards";

export type PaymentDetailsInput = {
  method: PaymentMethod;
  fullName: string;
  email?: string;
  accountIdentifier?: string;
  bankName?: string;
  notes?: string;
};

function callableErrorMessage(err: unknown, fallback: string): string {
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : "";
  if (message.includes("unauthenticated")) {
    return "Please log in and try again.";
  }
  if (message) return message.replace(/^FirebaseError:\s*/i, "");
  return fallback;
}

export async function submitRewardPaymentDetails(
  historyId: string,
  paymentDetails: PaymentDetailsInput
): Promise<{ historyId: string; status: RewardHistoryStatus }> {
  const callable = httpsCallable<
    { historyId: string; paymentDetails: PaymentDetailsInput },
    { historyId: string; status: RewardHistoryStatus }
  >(functions, "submitRewardPaymentDetails");

  try {
    const response = await callable({ historyId, paymentDetails });
    return response.data;
  } catch (err: unknown) {
    throw new Error(
      callableErrorMessage(err, "Could not submit payment details. Please try again.")
    );
  }
}

export async function updateCashRewardStatus(params: {
  userId: string;
  historyId: string;
  nextStatus: "Payment Processing" | "Paid";
  paymentReference?: string;
}): Promise<{ historyId: string; status: RewardHistoryStatus }> {
  const callable = httpsCallable<
    {
      userId: string;
      historyId: string;
      nextStatus: "Payment Processing" | "Paid";
      paymentReference?: string;
    },
    { historyId: string; status: RewardHistoryStatus }
  >(functions, "updateCashRewardStatus");

  try {
    const response = await callable(params);
    return response.data;
  } catch (err: unknown) {
    throw new Error(
      callableErrorMessage(err, "Could not update this cash reward.")
    );
  }
}

export function paymentMethodLabel(method: RewardPaymentDetails["method"] | string): string {
  if (method === "paypal") return "PayPal";
  if (method === "wise") return "Wise";
  if (method === "bank_transfer") return "Bank transfer";
  if (method === "other") return "Other";
  return method || "—";
}
