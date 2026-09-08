"use client";

import Link from "next/link";
import { VIBE_PATHS } from "@/lib/vibe/constants";

const EXPERIENCES = [
  { href: VIBE_PATHS.stars, emoji: "⭐", title: "Your Stars", blurb: "Signs, readings and starry posts" },
  { href: VIBE_PATHS.loveMatch, emoji: "❤️", title: "Love Match", blurb: "Two signs, one playful score" },
  { href: VIBE_PATHS.lucky, emoji: "🍀", title: "Lucky Today", blurb: "A number, a colour, a nudge" },
  { href: VIBE_PATHS.quizzes, emoji: "🧠", title: "Quizzes & Trivia", blurb: "Personality and Zimbabwe fun" },
  { href: "/vibe?category=fun-memes", emoji: "😂", title: "Fun & Memes", blurb: "Light jokes from the community" },
  { href: VIBE_PATHS.trending, emoji: "🔥", title: "Trending in Zim", blurb: "Local conversation, not ads" },
];

export default function VibeExperienceGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:gap-3">
      {EXPERIENCES.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-3 py-3 transition hover:border-[#FBB03B]/40 hover:bg-[#131d35] sm:px-4"
        >
          <div className="text-lg">{item.emoji}</div>
          <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-gray-400 sm:text-xs">
            {item.blurb}
          </p>
        </Link>
      ))}
    </div>
  );
}
