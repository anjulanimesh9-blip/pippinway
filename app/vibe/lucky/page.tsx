"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trackVibe } from "@/lib/analytics";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { luckyToday } from "@/lib/vibe/luckyToday";
import { ZODIAC_SIGNS } from "@/lib/vibe/zodiac";
import EntertainmentNote from "../components/EntertainmentNote";
import VibePageTrack from "../components/VibePageTrack";
import VibeShell from "../components/VibeShell";

export default function LuckyTodayPage() {
  const [sign, setSign] = useState("");
  const result = useMemo(() => luckyToday(sign || undefined), [sign]);

  return (
    <VibeShell>
      <VibePageTrack event="vibe_lucky" />
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
          <h1 className="text-2xl font-bold">Lucky Today 🍀</h1>
          <p className="mt-2 text-sm text-gray-300">
            A light daily nudge. The number, colour and message stay the same for everyone on the same date and sign.
          </p>
          <label className="mt-4 block text-sm">
            Optional sign
            <select
              value={sign}
              onChange={(event) => {
                setSign(event.target.value);
                trackVibe("vibe_lucky", { sign: event.target.value || "any" });
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2"
            >
              <option value="">Any sign</option>
              {ZODIAC_SIGNS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.emoji} {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#020817] p-4">
              <p className="text-xs text-gray-500">Lucky number</p>
              <p className="mt-1 text-3xl font-bold text-[#FBB03B]">{result.number}</p>
            </div>
            <div className="rounded-2xl bg-[#020817] p-4">
              <p className="text-xs text-gray-500">Lucky colour</p>
              <p className="mt-1 text-xl font-semibold">{result.color}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-indigo-950/50 p-4 text-sm text-gray-200">
            {result.message}
          </p>
          <p className="mt-3 text-xs text-gray-500">{result.dateLabel}</p>
          <div className="mt-4">
            <EntertainmentNote />
          </div>
        </section>
      </div>
    </VibeShell>
  );
}
