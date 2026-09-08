"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trackVibe } from "@/lib/analytics";
import { isVibeCategoryId } from "@/lib/vibe/categories";
import type { VibeCategoryId, VibePostCategory } from "@/lib/vibe/types";
import VibeCategoryNav from "./components/VibeCategoryNav";
import VibeComposer from "./components/VibeComposer";
import VibeExperienceGrid from "./components/VibeExperienceGrid";
import VibeFeed from "./components/VibeFeed";
import VibeHero from "./components/VibeHero";
import VibeShell from "./components/VibeShell";
import VibeSidebar from "./components/VibeSidebar";

function VibeHomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("category") || "all";
  const active: VibeCategoryId = isVibeCategoryId(raw) ? raw : "all";
  const [refreshKey, setRefreshKey] = useState(0);
  const compose = searchParams.get("compose") === "1";

  useEffect(() => {
    trackVibe("vibe_page_view", { vibe_category: active });
  }, [active]);

  useEffect(() => {
    if (!compose) return;
    document.getElementById("vibe-composer-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    const timer = window.setTimeout(() => {
      document.getElementById("vibe-composer")?.focus();
    }, 320);
    return () => window.clearTimeout(timer);
  }, [compose]);

  const onSelect = (id: VibeCategoryId) => {
    trackVibe("vibe_category", { vibe_category: id });
    if (id === "all") router.push("/vibe");
    else router.push(`/vibe?category=${id}`);
  };

  return (
    <VibeShell>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:gap-8 lg:py-8">
        <aside className="hidden lg:block">
          <VibeSidebar />
        </aside>
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <VibeHero compact />
          <VibeExperienceGrid />
          <VibeComposer
            key={active}
            defaultCategory={active === "all" ? "lifestyle" : (active as VibePostCategory)}
            onCreated={() => setRefreshKey((value) => value + 1)}
          />
          <VibeCategoryNav active={active} onSelect={onSelect} />
          <VibeFeed
            category={active === "all" ? "all" : active}
            refreshKey={refreshKey}
          />
        </div>
        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
            <p className="text-sm font-semibold text-white">Try today</p>
            <div className="mt-3 space-y-2.5 text-sm leading-5">
              <Link href="/vibe/stars" className="block rounded-xl bg-[#020817] px-3 py-2 hover:text-[#FBB03B]">
                ⭐ Your Stars
              </Link>
              <Link href="/vibe/love-match" className="block rounded-xl bg-[#020817] px-3 py-2 hover:text-[#FBB03B]">
                ❤️ Love Match
              </Link>
              <Link href="/vibe/lucky" className="block rounded-xl bg-[#020817] px-3 py-2 hover:text-[#FBB03B]">
                🍀 Lucky Today
              </Link>
              <Link href="/vibe/quizzes" className="block rounded-xl bg-[#020817] px-3 py-2 hover:text-[#FBB03B]">
                🧠 Quizzes
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-sm leading-6 text-gray-400">
            <p className="font-semibold text-white">Marketplace stays next door</p>
            <p className="mt-2">
              Vibe is for conversation. Listings, prices and Post Ad live in the marketplace. The gold plus button lets you choose Marketplace or Vibe.
            </p>
          </div>
        </aside>
      </div>
    </VibeShell>
  );
}

export default function VibeHomeClient() {
  return (
    <Suspense
      fallback={
        <VibeShell>
          <div className="px-4 py-10 text-center text-gray-400">Loading Vibe…</div>
        </VibeShell>
      }
    >
      <VibeHomeInner />
    </Suspense>
  );
}
