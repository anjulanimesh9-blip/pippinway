"use client";

import Link from "next/link";
import { VIBE_PATHS } from "@/lib/vibe/constants";

const EXPERIENCES = [
  { href: VIBE_PATHS.stars, emoji: "⭐", title: "Your Stars", blurb: "Signs and readings" },
  { href: VIBE_PATHS.loveMatch, emoji: "❤️", title: "Love Match", blurb: "Two signs, one score" },
  { href: VIBE_PATHS.lucky, emoji: "🍀", title: "Lucky Today", blurb: "A number and colour" },
  { href: VIBE_PATHS.quizzes, emoji: "🧠", title: "Quizzes", blurb: "Personality and trivia" },
  { href: "/vibe?category=fun-memes", emoji: "😂", title: "Fun & Memes", blurb: "Light community jokes" },
  { href: VIBE_PATHS.trending, emoji: "🔥", title: "Trending in Zim", blurb: "Local conversation" },
];

export default function VibeExperienceGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {EXPERIENCES.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-3 py-3 transition hover:border-[#FBB03B]/40 hover:bg-[#131d35] sm:px-3.5 sm:py-3.5"
        >
          <div className="text-base leading-none">{item.emoji}</div>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-white sm:text-[13px]">{item.title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
            {item.blurb}
          </p>
        </Link>
      ))}
    </div>
  );
}
