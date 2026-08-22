"use client";

import {
  CASH_PAYMENT_24H_MESSAGE,
  REWARD_HISTORY_EMPTY,
  REWARD_HISTORY_EMPTY_SPIN_READY,
  formatRewardDate,
  isCashAwaitingPayout,
  needsPaymentDetails,
  statusBadgeClass,
  type RewardHistoryItem,
} from "../../../lib/rewards";

type RewardHistoryProps = {
  items: RewardHistoryItem[];
  hasAvailableSpin?: boolean;
};

export default function RewardHistory({
  items,
  hasAvailableSpin = false,
}: RewardHistoryProps) {
  return (
    <section
      id="reward-history"
      className="rounded-2xl border border-white/10 bg-[#111827] p-4"
    >
      <h2 className="text-lg font-bold text-white">🏆 Reward History</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">
          {hasAvailableSpin
            ? REWARD_HISTORY_EMPTY_SPIN_READY
            : REWARD_HISTORY_EMPTY}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-white/8 bg-[#020817] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{item.prizeLabel}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.type === "mega" ? "Mega" : "Normal"} ·{" "}
                    {formatRewardDate(item.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(
                    item.paymentStatus || item.status
                  )}`}
                >
                  {item.paymentStatus || item.status}
                </span>
              </div>
              {needsPaymentDetails(item) && (
                <p className="mt-2 text-xs text-amber-200">
                  Submit your payment details in the banner above.
                </p>
              )}
              {isCashAwaitingPayout(item) && (
                <p className="mt-2 text-xs text-amber-200">
                  {CASH_PAYMENT_24H_MESSAGE}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
