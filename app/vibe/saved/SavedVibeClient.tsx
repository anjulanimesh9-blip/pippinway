"use client";

import Link from "next/link";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import VibeFeed from "../components/VibeFeed";
import VibeShell from "../components/VibeShell";

export default function SavedVibeClient() {
  const { user, loading } = useAuth();

  return (
    <VibeShell>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <h1 className="text-2xl font-bold">Saved posts</h1>
        {loading ? (
          <p className="text-sm text-gray-400">Checking account…</p>
        ) : user ? (
          <VibeFeed savedOnly />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center">
            <p className="text-sm text-gray-300">Sign in to see posts you saved.</p>
            <GuestAuthLink
              href={VIBE_PATHS.saved}
              className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
            >
              Sign in
            </GuestAuthLink>
          </div>
        )}
      </div>
    </VibeShell>
  );
}
