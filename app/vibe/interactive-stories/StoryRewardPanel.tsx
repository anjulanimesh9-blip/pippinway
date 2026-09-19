"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useAuth from "@/app/hooks/useAuth";
import { useGuestAuthPrompt } from "@/app/components/GuestAuthPrompt";
import PrizeWheel from "@/app/rewards/components/PrizeWheel";
import { NORMAL_WHEEL_SEGMENTS, type PrizeKey } from "@/lib/rewards";
import { fetchPublishedStories, type InteractiveStory } from "@/lib/vibe/stories";
import { writeStoryRewardIntent } from "@/lib/vibe/stories/progress";
import {
  fetchStoryRewardStatus,
  recordStoryRewardEvent,
  requestStoryRewardSpin,
  storyRewardReturnPath,
  type StoryRewardSpinResult,
  type StoryRewardStatus,
} from "@/lib/vibe/stories/rewards";
import StoryFeaturedRedeem from "./StoryFeaturedRedeem";

function landingRotation(segmentIndex: number, count: number, previous: number) {
  const slice = 360 / count;
  const target = -((segmentIndex + 0.5) * slice);
  let next = target;
  while (next <= previous + 360 * 5) {
    next += 360;
  }
  return next;
}

function prizeCopy(result: {
  prizeKey?: PrizeKey | null;
  prizeLabel?: string | null;
  featuredCreditsAwarded?: number;
  cashAmount?: number;
  bonusSpin?: boolean;
}) {
  if ((result.featuredCreditsAwarded || 0) > 0) {
    const n = result.featuredCreditsAwarded || 0;
    return `You won ${n} Featured Ad credit${n === 1 ? "" : "s"} on the Pippinway Rewards wheel.`;
  }
  if ((result.cashAmount || 0) > 0) {
    return `You won $${result.cashAmount} cash. Submit payout details from Rewards.`;
  }
  if (result.bonusSpin) {
    return "You won an extra spin on the main Rewards wheel. Not every attempt is a Featured Ad.";
  }
  if (result.prizeKey === "try_again" || result.prizeLabel === "Try Again") {
    return "This spin did not win a Featured Ad. Explore the Marketplace, or try another story for a new chance.";
  }
  return result.prizeLabel || "Your attempt for this story has been used.";
}

export default function StoryRewardPanel({
  story,
  endingId,
  focus = false,
  welcome = false,
}: {
  story: InteractiveStory;
  endingId: string;
  focus?: boolean;
  welcome?: boolean;
}) {
  const { user, loading: authLoading } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const [status, setStatus] = useState<StoryRewardStatus | null>(null);
  const [statusReady, setStatusReady] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<StoryRewardSpinResult | null>(null);
  const [error, setError] = useState("");
  const [otherStories, setOtherStories] = useState<InteractiveStory[]>([]);
  const [showRedeem, setShowRedeem] = useState(false);
  const spinningLock = useRef(false);
  const spinTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnPath = storyRewardReturnPath(story.slug, endingId, true);
  const postAdHref = `/add-listing?from=story&story=${encodeURIComponent(story.slug)}`;

  useEffect(() => {
    if (focus || welcome) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focus, welcome]);

  useEffect(() => {
    return () => {
      if (spinTimer.current != null) window.clearTimeout(spinTimer.current);
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      setStatusReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await recordStoryRewardEvent({
          storySlug: story.slug,
          event: "complete",
          endingId,
        });
        const next = await fetchStoryRewardStatus(story.slug);
        if (!cancelled) {
          setStatus(next);
          if (next.attemptUsed && next.prizeKey) {
            setResult((prev) => prev ?? {
              type: "normal",
              prizeKey: next.prizeKey as PrizeKey,
              prizeLabel: next.prizeLabel || "Reward",
              status: next.cashAmount ? "Payment Details Required" : "Completed",
              featuredCreditsAwarded: next.featuredCreditsAwarded,
              cashAmount: next.cashAmount,
              bonusSpin: next.bonusSpin,
              historyId: next.historyId || "",
              availableSpins: 0,
              availableMegaSpins: 0,
              storySlug: story.slug,
              source: "interactive-story",
            });
          }
          setStatusReady(true);
        }
      } catch {
        if (!cancelled) {
          setStatusReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, endingId, story.slug, user]);

  const attemptUsed = Boolean(status?.attemptUsed || result);
  const featuredWin = (result?.featuredCreditsAwarded || status?.featuredCreditsAwarded || 0) > 0;

  useEffect(() => {
    if (!attemptUsed) return;
    let cancelled = false;
    void fetchPublishedStories().then(async (stories) => {
      const published = stories.filter((item) => item.published && item.slug !== story.slug);
      if (!user) {
        if (!cancelled) setOtherStories(published);
        return;
      }
      const available: InteractiveStory[] = [];
      await Promise.all(
        published.map(async (item) => {
          try {
            const next = await fetchStoryRewardStatus(item.slug);
            if (!next.attemptUsed) available.push(item);
          } catch {
            available.push(item);
          }
        })
      );
      if (!cancelled) setOtherStories(available);
    });
    return () => {
      cancelled = true;
    };
  }, [attemptUsed, story.slug, user]);

  const spin = async () => {
    writeStoryRewardIntent(story.slug, endingId);

    if (!user) {
      requireAuth(returnPath);
      return;
    }

    if (spinningLock.current || attemptUsed) return;
    spinningLock.current = true;
    setError("");
    setSpinning(true);
    try {
      const spinResult = await requestStoryRewardSpin(story.slug, endingId);
      const index = Math.max(
        0,
        NORMAL_WHEEL_SEGMENTS.findIndex((segment) => segment.key === spinResult.prizeKey)
      );
      setRotation((prev) => landingRotation(index, NORMAL_WHEEL_SEGMENTS.length, prev));
      spinTimer.current = window.setTimeout(() => {
        spinningLock.current = false;
        setResult(spinResult);
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                attemptUsed: true,
                prizeKey: spinResult.prizeKey,
                prizeLabel: spinResult.prizeLabel,
                featuredCreditsAwarded: spinResult.featuredCreditsAwarded,
                cashAmount: spinResult.cashAmount,
                bonusSpin: spinResult.bonusSpin,
                historyId: spinResult.historyId,
              }
            : prev
        );
        setSpinning(false);
        if (spinResult.featuredCreditsAwarded > 0) setShowRedeem(true);
      }, spinResult.alreadyCommitted ? 400 : 4800);
    } catch (err) {
      spinningLock.current = false;
      setSpinning(false);
      setError(err instanceof Error ? err.message : "Could not spin the wheel.");
    }
  };

  const shownPrize = result || status;
  const showWelcome = Boolean(user && welcome && !attemptUsed);

  return (
    <div
      ref={panelRef}
      id="story-reward"
      className="mt-6 w-full min-w-0 rounded-2xl border border-[#FBB03B]/35 bg-[#020817]/80 p-5 text-center"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">
        Pippinway Rewards
      </p>
      <h3 className="mt-2 font-serif text-xl text-white">
        {showWelcome ? "Welcome back! Your reward chance is ready." : "Unlock a reward chance"}
      </h3>
      <p className="mt-2 text-[17px] leading-8 text-gray-300">
        The story stays free to read. Signed-in members get one spin on the existing Pippinway
        Rewards wheel for this story — not every spin wins a Featured Ad.
      </p>

      {authLoading || (user && !statusReady) ? (
        <p className="mt-4 text-sm text-gray-400">Checking your account…</p>
      ) : attemptUsed ? (
        <div className="mt-5 space-y-4">
          <PrizeWheel segments={NORMAL_WHEEL_SEGMENTS} rotation={rotation} spinning={false} />
          <p className="text-lg font-semibold text-white">
            {shownPrize?.prizeLabel || "Attempt used"}
          </p>
          <p className="text-sm leading-6 text-gray-300">{prizeCopy(shownPrize || {})}</p>

          {featuredWin ? (
            <div>
              <button
                type="button"
                onClick={() => setShowRedeem(true)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]"
              >
                Use Your Free Featured Ad
              </button>
              {showRedeem && user ? (
                <StoryFeaturedRedeem
                  user={user}
                  storySlug={story.slug}
                  postAdHref={postAdHref}
                  onRedeemed={() =>
                    setStatus((prev) => (prev ? { ...prev, featuredRedeemed: true } : prev))
                  }
                />
              ) : null}
            </div>
          ) : (
            <Link
              href="/"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white"
            >
              Explore Marketplace
            </Link>
          )}

          {shownPrize?.cashAmount ? (
            <Link href="/rewards" className="block text-sm text-[#FBB03B]">
              Submit cash payout details
            </Link>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-left">
            <p className="font-semibold text-white">New Story, New Reward Chance</p>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              This story&apos;s attempt is used. Another published Interactive Story can still give
              you a new chance.
            </p>
            {otherStories.length > 0 ? (
              <div className="mt-3 space-y-2">
                {otherStories.map((item) => (
                  <Link
                    key={item.slug}
                    href={storyRewardReturnPath(item.slug)}
                    className="block rounded-xl border border-white/10 px-3 py-2 text-sm text-[#FBB03B]"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                More stories will appear here when they are published.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <PrizeWheel segments={NORMAL_WHEEL_SEGMENTS} rotation={rotation} spinning={spinning} />
          <button
            type="button"
            disabled={spinning}
            onClick={() => void spin()}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220] disabled:opacity-60"
          >
            {spinning ? "Spinning…" : "Spin the Rewards Wheel"}
          </button>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            One attempt per account for this story, even if you reach another ending.
          </p>
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
