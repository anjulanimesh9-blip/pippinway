"use client";

import { useEffect, useState } from "react";
import {
  fetchStoryRewardAnalytics,
  type StoryRewardAnalytics,
} from "@/lib/vibe/stories/rewards";

const METRICS: { key: keyof Omit<StoryRewardAnalytics["totals"], "storySlug" | "title">; label: string; hint: string }[] = [
  { key: "readers", label: "Story readers", hint: "Unique signed-in UIDs who opened a story" },
  { key: "completions", label: "Completions", hint: "Unique UIDs who reached an ending" },
  { key: "registrationConversions", label: "Registrations from stories", hint: "New accounts created from a story reward CTA" },
  { key: "verifiedRegistrations", label: "Verified registrations", hint: "Those story signups that verified email" },
  { key: "rewardAttempts", label: "Reward attempts", hint: "One confirmed wheel spin per user per story" },
  { key: "featuredIssued", label: "Featured Ad rewards issued", hint: "Story spins that awarded Featured credits" },
  { key: "featuredRedeemed", label: "Featured Ad rewards redeemed", hint: "Those credits used on a Marketplace ad" },
  { key: "listingsCreated", label: "Listings created from stories", hint: "Ads posted from the story reward flow" },
];

export default function StoryRewardsAnalytics() {
  const [data, setData] = useState<StoryRewardAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchStoryRewardAnalytics()
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load story reward analytics. Deploy the latest Cloud Functions.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Interactive Story rewards</h2>
      <p className="mt-1 text-sm text-gray-400">
        Counts use authenticated UIDs and server-confirmed first writes. Refreshes and extra endings
        do not create duplicate registrations or extra spins.
      </p>

      {loading ? <p className="mt-3 text-sm text-gray-400">Loading analytics…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {data ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.key}
                className="rounded-2xl border border-white/10 bg-[#0F172A] p-4"
              >
                <p className="text-2xl font-bold text-white">{data.totals[metric.key]}</p>
                <p className="mt-1 text-sm font-semibold text-[#FBB03B]">{metric.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{metric.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-3 py-2">Story</th>
                  <th className="px-3 py-2">Readers</th>
                  <th className="px-3 py-2">Completions</th>
                  <th className="px-3 py-2">Signups</th>
                  <th className="px-3 py-2">Verified</th>
                  <th className="px-3 py-2">Attempts</th>
                  <th className="px-3 py-2">Featured issued</th>
                  <th className="px-3 py-2">Featured redeemed</th>
                  <th className="px-3 py-2">Listings</th>
                </tr>
              </thead>
              <tbody>
                {data.stories.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-gray-500" colSpan={9}>
                      No confirmed story reward events yet.
                    </td>
                  </tr>
                ) : (
                  data.stories.map((row) => (
                    <tr key={row.storySlug} className="border-t border-white/10">
                      <td className="px-3 py-2 font-medium text-white">{row.title}</td>
                      <td className="px-3 py-2">{row.readers}</td>
                      <td className="px-3 py-2">{row.completions}</td>
                      <td className="px-3 py-2">{row.registrationConversions}</td>
                      <td className="px-3 py-2">{row.verifiedRegistrations}</td>
                      <td className="px-3 py-2">{row.rewardAttempts}</td>
                      <td className="px-3 py-2">{row.featuredIssued}</td>
                      <td className="px-3 py-2">{row.featuredRedeemed}</td>
                      <td className="px-3 py-2">{row.listingsCreated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
