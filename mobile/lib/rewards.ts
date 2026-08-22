export type SpinType = "normal" | "mega";

export type RewardType = "cash" | "featured" | "bonus_spin" | "try_again";

export type RewardHistoryStatus =
  | "Pending"
  | "Approved"
  | "Paid"
  | "Rejected"
  | "Completed"
  | "Payment Details Required"
  | "Payment Details Submitted"
  | "Payment Processing";

export type PrizeKey =
  | "try_again"
  | "featured_1"
  | "featured_3"
  | "featured_5"
  | "free_spin"
  | "bonus_spin"
  | "cash_5"
  | "cash_10"
  | "cash_25";

export type PaymentMethod = "paypal" | "bank_transfer" | "wise" | "other";

export type RewardPaymentDetails = {
  method: PaymentMethod;
  fullName: string;
  email?: string | null;
  accountIdentifier?: string | null;
  bankName?: string | null;
  notes?: string | null;
  submittedAt?: unknown;
};

export type WheelSegment = {
  key: PrizeKey;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
};

export type SpinResult = {
  type: SpinType;
  prizeKey: PrizeKey;
  prizeLabel: string;
  status: RewardHistoryStatus;
  featuredCreditsAwarded: number;
  cashAmount: number;
  bonusSpin: boolean;
  historyId: string;
  availableSpins: number;
  availableMegaSpins: number;
};

export type RewardHistoryItem = {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  type: SpinType;
  prizeKey: PrizeKey;
  prizeLabel: string;
  rewardType?: RewardType;
  rewardValue?: number;
  status: RewardHistoryStatus;
  featuredCreditsAwarded?: number;
  cashAmount?: number;
  bonusSpin?: boolean;
  paymentDetails?: RewardPaymentDetails | null;
  paymentStatus?: RewardHistoryStatus | null;
  paidAt?: unknown;
  paymentReference?: string | null;
  createdAt?: unknown;
};

export type RewardsState = {
  availableSpins: number;
  availableMegaSpins: number;
  rewardNormalProgress: number;
  rewardMegaProgress: number;
  rewardApprovedAdsCount: number;
};

export const NORMAL_CYCLE = 3;
export const MEGA_CYCLE = 10;

export const STATUS_COMPLETED = "Completed" as const;
export const STATUS_PAYMENT_DETAILS_REQUIRED = "Payment Details Required" as const;
export const STATUS_PAYMENT_DETAILS_SUBMITTED = "Payment Details Submitted" as const;
export const STATUS_PAYMENT_PROCESSING = "Payment Processing" as const;
export const STATUS_PAID = "Paid" as const;

export const CASH_PAYMENT_24H_MESSAGE =
  "Payment will be processed within 24 hours after valid payment details are submitted.";

export const EMPTY_REWARDS: RewardsState = {
  availableSpins: 0,
  availableMegaSpins: 0,
  rewardNormalProgress: 0,
  rewardMegaProgress: 0,
  rewardApprovedAdsCount: 0,
};

export const SPIN_AVAILABLE_LABEL = "SPIN AVAILABLE";

export const NORMAL_SPIN_LOCKED_HINT =
  "Post 3 approved ads to unlock a Spin.";

export const REWARD_HISTORY_EMPTY =
  "No spins yet. Post approved ads to unlock your first spin.";

export const REWARD_HISTORY_EMPTY_SPIN_READY =
  "No spins yet. You haven't spun, but a spin is ready.";

/** Display-only: after a cycle unlocks, progress resets to 0 — show complete, not empty. */
export function normalSpinTrackDisplay(
  availableSpins: number,
  progress: number
): { current: number; hint: string; unlocked: boolean } {
  const next = Math.min(Math.max(progress, 0), NORMAL_CYCLE);
  if (availableSpins > 0) {
    const spinLabel = availableSpins === 1 ? "1 spin" : `${availableSpins} spins`;
    return {
      current: NORMAL_CYCLE,
      hint: `3 approved ads unlocked ${spinLabel}. Next spin: ${next} / ${NORMAL_CYCLE}.`,
      unlocked: true,
    };
  }
  return {
    current: next,
    hint: NORMAL_SPIN_LOCKED_HINT,
    unlocked: false,
  };
}

export const NORMAL_WHEEL_SEGMENTS: WheelSegment[] = [
  { key: "try_again", label: "Try Again", shortLabel: "TRY AGAIN", color: "#475569", textColor: "#ffffff" },
  { key: "featured_1", label: "1 Featured Ad", shortLabel: "1 FEATURED", color: "#FBB03B", textColor: "#111827" },
  { key: "featured_3", label: "3 Featured Ads", shortLabel: "3 FEATURED", color: "#22c55e", textColor: "#052e16" },
  { key: "free_spin", label: "1 Free Spin", shortLabel: "FREE SPIN", color: "#3b82f6", textColor: "#ffffff" },
  { key: "cash_5", label: "$5 Cash", shortLabel: "$5 CASH", color: "#a855f7", textColor: "#ffffff" },
];

export const MEGA_WHEEL_SEGMENTS: WheelSegment[] = [
  { key: "try_again", label: "Try Again", shortLabel: "TRY AGAIN", color: "#475569", textColor: "#ffffff" },
  { key: "featured_3", label: "3 Featured Ads", shortLabel: "3 FEATURED", color: "#FBB03B", textColor: "#111827" },
  { key: "featured_5", label: "5 Featured Ads", shortLabel: "5 FEATURED", color: "#22c55e", textColor: "#052e16" },
  { key: "bonus_spin", label: "Bonus Spin", shortLabel: "BONUS SPIN", color: "#3b82f6", textColor: "#ffffff" },
  { key: "cash_10", label: "$10 Cash", shortLabel: "$10 CASH", color: "#a855f7", textColor: "#ffffff" },
  { key: "cash_25", label: "$25 Cash", shortLabel: "$25 CASH", color: "#ef4444", textColor: "#ffffff" },
];

export function wheelSegmentsFor(type: SpinType): WheelSegment[] {
  return type === "mega" ? MEGA_WHEEL_SEGMENTS : NORMAL_WHEEL_SEGMENTS;
}

export function isRealWin(prizeKey: PrizeKey): boolean {
  return prizeKey !== "try_again";
}

export function cashAmountOf(item: { cashAmount?: number } | null | undefined): number {
  return Number(item?.cashAmount ?? 0);
}

export function isCashReward(item: { cashAmount?: number } | null | undefined): boolean {
  return cashAmountOf(item) > 0;
}

export function needsPaymentDetails(item: RewardHistoryItem): boolean {
  if (!isCashReward(item)) return false;
  return (
    item.status === STATUS_PAYMENT_DETAILS_REQUIRED ||
    item.status === "Pending"
  );
}

export function isCashAwaitingPayout(item: RewardHistoryItem): boolean {
  if (!isCashReward(item)) return false;
  return (
    item.status === STATUS_PAYMENT_DETAILS_SUBMITTED ||
    item.status === STATUS_PAYMENT_PROCESSING
  );
}

export function cashWinCongratsMessage(amount: number): string {
  return [
    `Congratulations! You won a $${amount} cash reward! 🎉`,
    "Please submit your payment details to receive your prize.",
    "Payment will be processed within 24 hours after your payment details are verified.",
  ].join("\n");
}

export function prizeDetailMessage(result: SpinResult): string {
  if (result.cashAmount > 0) {
    return cashWinCongratsMessage(result.cashAmount);
  }
  if (result.featuredCreditsAwarded > 0) {
    const n = result.featuredCreditsAwarded;
    return `${n} Featured Credit${n === 1 ? "" : "s"} added to your account. Use them on Featured Ads.`;
  }
  if (result.bonusSpin) {
    return "1 extra spin was added to Available Spins. It will not spin automatically.";
  }
  return "Better luck next time. Post more approved ads to spin again.";
}

export function formatRewardDate(value: unknown): string {
  if (!value) return "—";
  let date: Date | null = null;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    date = (value as { toDate: () => Date }).toDate();
  } else if (typeof (value as { seconds?: number }).seconds === "number") {
    date = new Date((value as { seconds: number }).seconds * 1000);
  } else {
    const parsed = new Date(value as string | number);
    if (!isNaN(parsed.getTime())) date = parsed;
  }
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SUCCESS_STATUSES = new Set<string>(["Completed", "Paid", "Approved"]);
const PENDING_STATUSES = new Set<string>([
  "Pending",
  "Payment Details Required",
  "Payment Details Submitted",
  "Payment Processing",
]);

export function statusBadgeClass(status: RewardHistoryStatus | string): string {
  if (SUCCESS_STATUSES.has(status)) {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (PENDING_STATUSES.has(status)) {
    return "bg-amber-500/15 text-amber-300";
  }
  return "bg-red-500/15 text-red-300";
}
