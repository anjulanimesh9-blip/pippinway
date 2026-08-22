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
} from "@/lib/rewards";

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
      className="rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-5"
    >
      <h2 className="text-lg font-bold text-white">🏆 Reward History</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">
          {hasAvailableSpin
            ? REWARD_HISTORY_EMPTY_SPIN_READY
            : REWARD_HISTORY_EMPTY}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4 font-semibold">Date</th>
                <th className="pb-2 pr-4 font-semibold">Reward</th>
                <th className="pb-2 pr-4 font-semibold">Type</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/8">
                  <td className="py-3 pr-4 whitespace-nowrap align-top text-gray-300">
                    {formatRewardDate(item.createdAt)}
                  </td>
                  <td className="py-3 pr-4 align-top font-semibold text-white">
                    {item.prizeLabel}
                    {needsPaymentDetails(item) && (
                      <p className="mt-1 text-xs font-normal text-amber-200">
                        Submit your payment details in the banner above.
                      </p>
                    )}
                    {isCashAwaitingPayout(item) && (
                      <p className="mt-1 text-xs font-normal text-amber-200">
                        {CASH_PAYMENT_24H_MESSAGE}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 align-top capitalize text-gray-300">
                    {item.type === "mega" ? "Mega" : "Normal"}
                  </td>
                  <td className="py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(
                        item.paymentStatus || item.status
                      )}`}
                    >
                      {item.paymentStatus || item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
