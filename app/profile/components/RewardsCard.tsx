"use client";

import Link from "next/link";
import { EMPTY_REWARDS, MEGA_CYCLE, NORMAL_CYCLE, normalSpinTrackDisplay } from "@/lib/rewards";
import { useI18n } from "@/lib/i18n";

type RewardsCardProps = {
  userData?: any;
  loading?: boolean;
};

function MiniBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((Math.min(Math.max(current, 0), total) / total) * 100);
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-[#FBB03B]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function RewardsCard({
  userData,
  loading = false,
}: RewardsCardProps) {
  const { t } = useI18n();
  const rewards = userData
    ? {
        availableSpins: Number(userData.availableSpins ?? 0),
        availableMegaSpins: Number(userData.availableMegaSpins ?? 0),
        rewardNormalProgress: Number(userData.rewardNormalProgress ?? 0),
        rewardMegaProgress: Number(userData.rewardMegaProgress ?? 0),
        rewardApprovedAdsCount: Number(userData.rewardApprovedAdsCount ?? 0),
      }
    : EMPTY_REWARDS;
  const spinReady =
    rewards.availableSpins > 0 || rewards.availableMegaSpins > 0;
  const normalTrack = normalSpinTrackDisplay(
    rewards.availableSpins,
    rewards.rewardNormalProgress
  );

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#FBB03B]/20 bg-[#151A22] px-3 py-2.5">
      <Link href="/rewards" className="shrink-0 text-sm font-bold text-white hover:text-[#FBB03B]">
        {t("profile.rewards")}
      </Link>

      {loading ? (
        <p className="text-xs text-gray-400">{t("common.loading")}</p>
      ) : (
        <>
          <div className="min-w-[120px] flex-1">
            <div className="mb-0.5 flex justify-between text-[10px] text-gray-400">
              <span>Spin {normalTrack.current}/{NORMAL_CYCLE}</span>
              <span>Mega {rewards.rewardMegaProgress}/{MEGA_CYCLE}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MiniBar current={normalTrack.current} total={NORMAL_CYCLE} />
              <MiniBar current={rewards.rewardMegaProgress} total={MEGA_CYCLE} />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            {rewards.availableSpins} spin · {rewards.availableMegaSpins} mega
          </p>

          <Link
            href="/rewards"
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${
              spinReady
                ? "bg-[#FBB03B] text-black"
                : "border border-white/10 text-gray-300 hover:bg-white/5"
            }`}
          >
            {spinReady ? t("rewards.spinNow") : t("rewards.open")}
          </Link>
        </>
      )}
    </section>
  );
}
