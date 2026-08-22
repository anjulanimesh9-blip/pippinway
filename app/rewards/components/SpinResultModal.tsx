"use client";

import type { SpinResult } from "@/lib/rewards";
import {
  CASH_PAYMENT_24H_MESSAGE,
  isRealWin,
  prizeDetailMessage,
} from "@/lib/rewards";

type SpinResultModalProps = {
  result: SpinResult;
  onContinue: () => void;
  onViewHistory: () => void;
};

export default function SpinResultModal({
  result,
  onContinue,
  onViewHistory,
}: SpinResultModalProps) {
  const won = isRealWin(result.prizeKey);
  const isCash = result.cashAmount > 0;
  const detail = prizeDetailMessage(result);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#FBB03B]/30 bg-[#111827] p-6 text-center shadow-2xl">
        <p className="text-4xl" aria-hidden>
          {won ? "🎉" : "🎡"}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-white">
          🎉 Congratulations!
        </h2>
        <p className="mt-2 text-xl font-bold text-[#FBB03B]">{result.prizeLabel}</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">
          {detail}
        </p>
        {isCash && (
          <p className="mt-3 text-xs leading-relaxed text-amber-200">
            {CASH_PAYMENT_24H_MESSAGE}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 rounded-xl bg-[#FBB03B] px-4 py-3 text-sm font-extrabold text-black hover:bg-[#ffc14d]"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            {isCash ? "Submit payment details" : "View My Rewards"}
          </button>
        </div>
      </div>
    </div>
  );
}
