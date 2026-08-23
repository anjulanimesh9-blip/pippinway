"use client";

import Link from "next/link";
import useRewards from "@/app/hooks/useRewards";
import {
  MEGA_CYCLE,
  NORMAL_CYCLE,
  normalSpinTrackDisplay,
} from "@/lib/rewards";

type RewardsCardProps = {
  userId: string;
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

export default function RewardsCard({ userId }: RewardsCardProps) {
  const { rewards, loading } = useRewards(userId);
  const spinReady =
    rewards.availableSpins > 0 || rewards.availableMegaSpins > 0;
  const normalTrack = normalSpinTrackDisplay(
    rewards.availableSpins,
    rewards.rewardNormalProgress
  );

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#FBB03B]/20 bg-[#151A22] px-3 py-2.5">
      <Link href="/rewards" className="shrink-0 text-sm font-bold text-white hover:text-[#FBB03B]">
        Rewards
      </Link>

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
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
            {spinReady ? "SPIN" : "Open"}
          </Link>
        </>
      )}
    </section>
  );
}
