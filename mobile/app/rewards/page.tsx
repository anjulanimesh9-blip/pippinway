"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import useAuth from "../hooks/useAuth";
import useRewards from "../hooks/useRewards";
import { requestRewardSpin } from "../../lib/requestRewardSpin";
import {
  CASH_PAYMENT_24H_MESSAGE,
  MEGA_CYCLE,
  NORMAL_CYCLE,
  SPIN_AVAILABLE_LABEL,
  cashAmountOf,
  cashWinCongratsMessage,
  isCashAwaitingPayout,
  isRealWin,
  needsPaymentDetails,
  normalSpinTrackDisplay,
  wheelSegmentsFor,
  type SpinResult,
  type SpinType,
} from "../../lib/rewards";
import PrizeWheel from "./components/PrizeWheel";
import SpinResultModal from "./components/SpinResultModal";
import RewardHistory from "./components/RewardHistory";
import ConfettiBurst from "./components/ConfettiBurst";
import PaymentDetailsForm from "./components/PaymentDetailsForm";

function landingRotation(segmentIndex: number, count: number, previous: number) {
  const slice = 360 / count;
  const target = -((segmentIndex + 0.5) * slice);
  let next = target;
  while (next <= previous + 360 * 5) {
    next += 360;
  }
  return next;
}

export default function RewardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { rewards, history, loading: rewardsLoading } = useRewards(user?.uid);
  const [wheelType, setWheelType] = useState<SpinType>("normal");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const spinningLock = useRef(false);
  const spinTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    return () => {
      if (spinTimer.current != null) window.clearTimeout(spinTimer.current);
    };
  }, []);

  const segments = useMemo(() => wheelSegmentsFor(wheelType), [wheelType]);
  const hasAnySpin = rewards.availableSpins > 0 || rewards.availableMegaSpins > 0;
  const normalTrack = normalSpinTrackDisplay(
    rewards.availableSpins,
    rewards.rewardNormalProgress
  );
  const pendingCash = useMemo(
    () => history.filter(needsPaymentDetails),
    [history]
  );
  const cashBanners = useMemo(() => {
    if (pendingCash.length > 0) return pendingCash;
    if (
      result &&
      result.cashAmount > 0 &&
      (result.status === "Payment Details Required" || result.status === "Pending") &&
      !history.some((item) => item.id === result.historyId)
    ) {
      return [
        {
          id: result.historyId,
          cashAmount: result.cashAmount,
          status: result.status,
          type: result.type,
          prizeKey: result.prizeKey,
          prizeLabel: result.prizeLabel,
        },
      ];
    }
    return pendingCash;
  }, [pendingCash, result, history]);
  const awaitingPayout = useMemo(
    () => history.filter(isCashAwaitingPayout),
    [history]
  );

  const spin = async (type: SpinType) => {
    if (spinningLock.current) return;
    spinningLock.current = true;
    setError(null);
    setShowModal(false);
    setResult(null);
    setWheelType(type);
    setSpinning(true);

    try {
      const spinResult = await requestRewardSpin(type);
      const nextSegments = wheelSegmentsFor(type);
      const index = Math.max(
        0,
        nextSegments.findIndex((segment) => segment.key === spinResult.prizeKey)
      );
      const nextRotation = landingRotation(index, nextSegments.length, rotation);
      setRotation(nextRotation);

      spinTimer.current = window.setTimeout(() => {
        spinningLock.current = false;
        setResult(spinResult);
        setShowModal(true);
        setSpinning(false);
        if (isRealWin(spinResult.prizeKey)) {
          setConfettiKey((value) => value + 1);
        }
      }, 4800);
    } catch (err) {
      spinningLock.current = false;
      setSpinning(false);
      setError(err instanceof Error ? err.message : "Could not spin. Try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const viewHistory = () => {
    setShowModal(false);
    const targetId =
      result && result.cashAmount > 0
        ? `cash-banner-${result.historyId}`
        : cashBanners[0]
          ? `cash-banner-${cashBanners[0].id}`
          : "reward-history";
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      {confettiKey > 0 && <ConfettiBurst key={confettiKey} active />}

      <div className="mx-auto max-w-xl px-4 py-6 pb-28">
        <div className="mb-5 text-center">
          <p className="text-sm font-semibold tracking-wide text-[#FBB03B]">
            Pippinway Rewards
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">
            🎡 Pippinway Prize Wheel
          </h1>
          <p className="mt-2 text-gray-300">Post more. Spin more. Win more!</p>
          <p className="mt-2 text-sm text-gray-400">
            Normal: 3 approved ads = 1 spin · Mega: 10 approved ads = 1 mega spin
          </p>
        </div>

        {cashBanners.length > 0 && (
          <div className="mb-6 space-y-4">
            {cashBanners.map((item) => (
              <div
                key={item.id}
                id={`cash-banner-${item.id}`}
                className="rounded-2xl border border-[#FBB03B]/30 bg-[#FBB03B]/10 p-4"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-white">
                  {cashWinCongratsMessage(cashAmountOf(item))}
                </p>
                <p className="mt-2 text-xs text-amber-200">
                  {CASH_PAYMENT_24H_MESSAGE}
                </p>
                <div className="mt-4">
                  <PaymentDetailsForm
                    historyId={item.id}
                    amount={cashAmountOf(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {cashBanners.length === 0 && awaitingPayout.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {CASH_PAYMENT_24H_MESSAGE}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex justify-center px-2">
            <PrizeWheel
              segments={segments}
              rotation={rotation}
              spinning={spinning}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <ProgressBlock
              title="Normal Spin"
              current={normalTrack.current}
              total={NORMAL_CYCLE}
              hint={normalTrack.hint}
              status={normalTrack.unlocked ? SPIN_AVAILABLE_LABEL : undefined}
              loading={rewardsLoading}
            />
            <div className="mt-4">
              <ProgressBlock
                title="Mega Spin"
                current={rewards.rewardMegaProgress}
                total={MEGA_CYCLE}
                hint="Post 10 approved ads to unlock a Mega Spin."
                loading={rewardsLoading}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-[#020817] p-3">
                <p className="text-xs text-gray-400">🎟️ Available Spins</p>
                <p className="text-2xl font-extrabold">{rewards.availableSpins}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#020817] p-3">
                <p className="text-xs text-gray-400">🎁 Available Mega Spins</p>
                <p className="text-2xl font-extrabold">{rewards.availableMegaSpins}</p>
              </div>
            </div>

            {hasAnySpin && (
              <p className="mt-4 text-center text-sm font-extrabold tracking-wide text-[#FBB03B]">
                SPIN AVAILABLE
              </p>
            )}

            {!hasAnySpin && !rewardsLoading && (
              <p className="mt-4 text-sm text-amber-200">
                Post more approved ads to unlock your next spin.
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                disabled={spinning || rewards.availableSpins < 1}
                onClick={() => spin("normal")}
                className="min-h-14 w-full rounded-xl bg-[#FBB03B] px-4 py-3 text-base font-extrabold text-black transition hover:bg-[#ffc14d] disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
              >
                🎡 SPIN NOW
              </button>
              <button
                type="button"
                disabled={spinning || rewards.availableMegaSpins < 1}
                onClick={() => spin("mega")}
                className="min-h-14 w-full rounded-xl border border-[#FBB03B]/40 bg-[#020817] px-4 py-3 text-base font-extrabold text-[#FBB03B] transition hover:bg-[#FBB03B]/10 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
              >
                🎁 MEGA SPIN
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <RewardHistory items={history} hasAvailableSpin={hasAnySpin} />
        </div>
      </div>

      {showModal && result && (
        <SpinResultModal
          result={result}
          onContinue={closeModal}
          onViewHistory={viewHistory}
        />
      )}

      <MobileBottomNav />
    </main>
  );
}

function ProgressBlock({
  title,
  current,
  total,
  hint,
  status,
  loading,
}: {
  title: string;
  current: number;
  total: number;
  hint: string;
  status?: string;
  loading: boolean;
}) {
  const clamped = Math.min(Math.max(current, 0), total);
  const pct = loading ? 0 : Math.round((clamped / total) * 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-[#FBB03B]">
          Approved Ads: {loading ? "…" : clamped} / {total}
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#FBB03B] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {status && (
        <p className="mt-1.5 text-xs font-extrabold tracking-wide text-[#FBB03B]">
          {status}
        </p>
      )}
      <p className={`text-xs text-gray-400 ${status ? "mt-0.5" : "mt-1.5"}`}>
        {hint}
      </p>
    </div>
  );
}
