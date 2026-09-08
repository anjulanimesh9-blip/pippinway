"use client";

import { useMemo, useState } from "react";
import { trackVibe } from "@/lib/analytics";
import { dailyStarReading, defaultSignForDate } from "@/lib/vibe/starReadings";
import { ZODIAC_SIGNS } from "@/lib/vibe/zodiac";
import EntertainmentNote from "../components/EntertainmentNote";
import VibeComposer from "../components/VibeComposer";
import VibeFeed from "../components/VibeFeed";

export default function StarsClient() {
  const [signId, setSignId] = useState(defaultSignForDate());
  const [refreshKey, setRefreshKey] = useState(0);
  const reading = useMemo(() => dailyStarReading(signId), [signId]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
        <h2 className="text-xl font-bold">Your Stars ⭐</h2>
        <p className="mt-1 text-sm text-gray-300">
          Pick a sign for today&apos;s light reading, then share a starry note with the community.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ZODIAC_SIGNS.map((sign) => {
            const active = sign.id === signId;
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => {
                  setSignId(sign.id);
                  trackVibe("vibe_stars_open", { sign: sign.id });
                }}
                className={`rounded-xl border px-2 py-3 text-center transition ${
                  active
                    ? "border-[#FBB03B] bg-[#FBB03B]/10"
                    : "border-white/10 bg-[#020817] hover:border-white/20"
                }`}
              >
                <div className="text-lg">{sign.emoji}</div>
                <p className="text-xs font-semibold">{sign.name}</p>
                <p className="text-[10px] text-gray-500">{sign.dates}</p>
              </button>
            );
          })}
        </div>

        {reading ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#FBB03B]/20 bg-gradient-to-br from-indigo-950 via-[#0F172A] to-[#020817] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBB03B]">
              Today&apos;s {reading.name} reading
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                {reading.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white">
                  {reading.name} Today
                </p>
                <p className="mt-1 text-sm text-gray-200">{reading.message}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-black/30 px-2 py-3">
                <p className="text-[10px] text-gray-500">Lucky number</p>
                <p className="mt-1 text-xl font-bold text-[#FBB03B]">{reading.luckyNumber}</p>
              </div>
              <div className="rounded-xl bg-black/30 px-2 py-3">
                <p className="text-[10px] text-gray-500">Lucky colour</p>
                <p className="mt-1 text-sm font-semibold text-white">{reading.luckyColor}</p>
              </div>
              <div className="rounded-xl bg-black/30 px-2 py-3">
                <p className="text-[10px] text-gray-500">Best time</p>
                <p className="mt-1 text-sm font-semibold text-white">{reading.bestTime}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-500">{reading.dateLabel}</p>
          </div>
        ) : null}

        <div className="mt-3">
          <EntertainmentNote />
        </div>
      </section>

      <VibeComposer
        key={signId}
        defaultCategory="your-stars"
        defaultZodiacSign={signId}
        onCreated={() => setRefreshKey((value) => value + 1)}
      />
      <VibeFeed category="your-stars" refreshKey={refreshKey} />
    </div>
  );
}
