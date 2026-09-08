"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackVibe } from "@/lib/analytics";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { loveMatch } from "@/lib/vibe/loveMatch";
import { shareLoveMatch } from "@/lib/vibe/share";
import { isZodiacId, ZODIAC_SIGNS, type ZodiacId } from "@/lib/vibe/zodiac";
import EntertainmentNote from "../components/EntertainmentNote";
import VibeShell from "../components/VibeShell";

function LoveMatchInner() {
  const searchParams = useSearchParams();
  const startA = searchParams.get("a");
  const startB = searchParams.get("b");
  const [a, setA] = useState<ZodiacId>(startA && isZodiacId(startA) ? startA : "leo");
  const [b, setB] = useState<ZodiacId>(startB && isZodiacId(startB) ? startB : "virgo");
  const [used, setUsed] = useState(Boolean(startA && startB));
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => (used ? loveMatch(a, b) : null), [a, b, used]);

  useEffect(() => {
    if (startA && startB) {
      trackVibe("vibe_love_match", { sign: `${startA}-${startB}` });
    }
  }, [startA, startB]);

  const runShare = async (method: "native" | "whatsapp" | "facebook" | "copy") => {
    if (!result) return;
    const outcome = await shareLoveMatch({
      a: result.a.id,
      b: result.b.id,
      score: result.score,
      label: result.label,
      method,
    });
    if (outcome === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <VibeShell>
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
          <h1 className="text-2xl font-bold">Love Match ❤️</h1>
          <p className="mt-2 text-sm text-gray-300">
            Choose two signs for a playful compatibility snapshot. Share the result — image cards can land on this same layout later.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm">
              First sign
              <select
                value={a}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isZodiacId(next)) setA(next);
                }}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2"
              >
                {ZODIAC_SIGNS.map((sign) => (
                  <option key={sign.id} value={sign.id}>
                    {sign.emoji} {sign.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Second sign
              <select
                value={b}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isZodiacId(next)) setB(next);
                }}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2"
              >
                {ZODIAC_SIGNS.map((sign) => (
                  <option key={sign.id} value={sign.id}>
                    {sign.emoji} {sign.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-full bg-[#FBB03B] py-3 font-semibold text-[#0B1220]"
            onClick={() => {
              setUsed(true);
              trackVibe("vibe_love_match", { sign: `${a}-${b}` });
              window.history.replaceState(
                null,
                "",
                `${VIBE_PATHS.loveMatch}?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`
              );
            }}
          >
            See the match
          </button>
          {result ? (
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-pink-900/60 to-[#020817] p-5 text-center">
              <p className="text-sm text-gray-300">
                {result.a.emoji} {result.a.name} + {result.b.emoji} {result.b.name}
              </p>
              <p className="mt-2 text-5xl font-bold text-[#FBB03B]">{result.score}%</p>
              <p className="mt-1 font-semibold">{result.label}</p>
              <p className="mt-3 text-sm text-gray-300">{result.blurb}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
                    onClick={() => runShare("native")}
                  >
                    Share
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
                  onClick={() => runShare("whatsapp")}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
                  onClick={() => runShare("facebook")}
                >
                  Facebook
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
                  onClick={() => runShare("copy")}
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="mt-4">
            <EntertainmentNote />
          </div>
        </section>
      </div>
    </VibeShell>
  );
}

export default function LoveMatchPage() {
  return (
    <Suspense
      fallback={
        <VibeShell>
          <div className="px-4 py-10 text-center text-gray-400">Loading Love Match…</div>
        </VibeShell>
      }
    >
      <LoveMatchInner />
    </Suspense>
  );
}
