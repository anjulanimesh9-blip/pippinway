import Link from "next/link";
import { VIBE_PATHS } from "@/lib/vibe/constants";

const VIBE_CARDS = [
  {
    emoji: "📖",
    title: "Stories",
    blurb: "Real stories & series",
    href: VIBE_PATHS.home,
  },
  {
    emoji: "⭐",
    title: "Your Stars",
    blurb: "See what today brings",
    href: VIBE_PATHS.stars,
  },
  {
    emoji: "❤️",
    title: "Love & Relationships",
    blurb: "Talk about love & life",
    href: "/vibe?category=love-relationships",
  },
  {
    emoji: "💪",
    title: "Motivation",
    blurb: "A little push for your day",
    href: "/vibe?category=motivation",
  },
  {
    emoji: "😂",
    title: "Fun & Memes",
    blurb: "Laugh, share & enjoy",
    href: "/vibe?category=fun-memes",
  },
] as const;

export default function LandingVibePreview() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-purple-400/15 bg-[#111827] px-4 py-7 sm:mt-12 sm:px-6 sm:py-8 lg:mt-14 lg:px-8">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-[#FBB03B]/12 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 text-center sm:text-left">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#FBB03B]/90 sm:text-xs">
          ✨ PIPPINWAY VIBE
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
          Good Vibes. Brighter Days.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-400 sm:mx-0 sm:text-[15px]">
          Stories, conversations and a little something for every mood.
        </p>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {VIBE_CARDS.map((card, index) => {
          const isLast = index === VIBE_CARDS.length - 1;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`rounded-2xl border border-white/10 bg-[#0B1220]/90 px-3 py-3.5 transition hover:border-purple-300/35 hover:bg-[#131a2e] hover:shadow-[0_0_24px_rgba(168,85,247,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B] sm:px-3.5 sm:py-4 ${
                isLast
                  ? "col-span-2 mx-auto w-full max-w-[calc(50%-0.3125rem)] sm:col-span-1 sm:mx-0 sm:max-w-none"
                  : ""
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {card.emoji}
              </span>
              <p className="mt-2 text-sm font-semibold leading-5 text-white">
                {card.title}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-gray-400 sm:text-xs sm:leading-5">
                {card.blurb}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="relative z-10 mt-6 flex justify-center sm:mt-7 sm:justify-start">
        <Link
          href={VIBE_PATHS.home}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500/90 to-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
        >
          Explore Pippinway Vibe
        </Link>
      </div>
    </section>
  );
}
