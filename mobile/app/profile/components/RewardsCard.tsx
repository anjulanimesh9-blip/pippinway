"use client";

import Link from "next/link";
import {
  MEGA_CYCLE,
  NORMAL_CYCLE,
  SPIN_AVAILABLE_LABEL,
  normalSpinTrackDisplay,
} from "../../../lib/rewards";

type RewardsCardProps = {
  userData?: any;
  loading?: boolean;
};

function ProgressRow({
  label,
  current,
  total,
  hint,
  status,
}: {
  label: string;
  current: number;
  total: number;
  hint: string;
  status?: string;
}) {
  const clamped = Math.min(Math.max(current, 0), total);
  const pct = Math.round((clamped / total) * 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-white">{label}</span>
        <span className="text-[#FBB03B]">
          Approved Ads: {clamped} / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#FBB03B] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {status && (
        <p className="mt-1 text-xs font-extrabold tracking-wide text-[#FBB03B]">
          {status}
        </p>
      )}
      <p className={`text-xs text-gray-400 ${status ? "mt-0.5" : "mt-1"}`}>
        {hint}
      </p>
    </div>
  );
}

export default function RewardsCard({
  userData,
  loading = false,
}: RewardsCardProps) {
  const rewards = userData
    ? {
        availableSpins: Number(userData.availableSpins ?? 0),
        availableMegaSpins: Number(userData.availableMegaSpins ?? 0),
        rewardNormalProgress: Number(userData.rewardNormalProgress ?? 0),
        rewardMegaProgress: Number(userData.rewardMegaProgress ?? 0),
        rewardApprovedAdsCount: Number(userData.rewardApprovedAdsCount ?? 0),
      }
    : {
        availableSpins: 0,
        availableMegaSpins: 0,
        rewardNormalProgress: 0,
        rewardMegaProgress: 0,
        rewardApprovedAdsCount: 0,
      };
  const spinReady =
    rewards.availableSpins > 0 || rewards.availableMegaSpins > 0;
  const normalTrack = normalSpinTrackDisplay(
    rewards.availableSpins,
    rewards.rewardNormalProgress
  );

  return (
    <section className="rounded-2xl border border-[#FBB03B]/25 bg-[#111827] px-4 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white">
          🎡 Pippinway Rewards
        </h2>
        {spinReady && (
          <span className="rounded-full bg-[#FBB03B]/15 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#FBB03B]">
            SPIN AVAILABLE
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading rewards...</p>
      ) : (
        <div className="space-y-3">
          <ProgressRow
            label="Normal Spin"
            current={normalTrack.current}
            total={NORMAL_CYCLE}
            hint={normalTrack.hint}
            status={normalTrack.unlocked ? SPIN_AVAILABLE_LABEL : undefined}
          />
          <ProgressRow
            label="Mega Spin"
            current={rewards.rewardMegaProgress}
            total={MEGA_CYCLE}
            hint="Post 10 approved ads to unlock a Mega Spin."
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/8 bg-[#020817] px-3 py-2">
              <p className="text-[11px] text-gray-400">🎟️ Available Spins</p>
              <p className="text-xl font-extrabold text-white">
                {rewards.availableSpins}
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#020817] px-3 py-2">
              <p className="text-[11px] text-gray-400">🎁 Available Mega Spins</p>
              <p className="text-xl font-extrabold text-white">
                {rewards.availableMegaSpins}
              </p>
            </div>
          </div>

          <Link
            href="/rewards"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#FBB03B] px-4 py-3 text-sm font-extrabold text-black transition hover:bg-[#ffc14d]"
          >
            {spinReady ? "SPIN NOW" : "View Rewards"}
          </Link>
        </div>
      )}
    </section>
  );
}
