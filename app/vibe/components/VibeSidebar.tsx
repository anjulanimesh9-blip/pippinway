"use client";

import Link from "next/link";
import { VIBE_CATEGORY_LIST } from "@/lib/vibe/categories";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";

export default function VibeSidebar() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
        <h2 className="text-xs font-semibold text-white">Topics</h2>
        <ol className="mt-3 space-y-2 text-[13px] leading-5 text-gray-300">
          {VIBE_CATEGORY_LIST.filter((item) => item.id !== "all").map((item, index) => (
            <li key={item.id}>
              <Link href={item.href} className="flex items-center gap-2 hover:text-[#FBB03B]">
                <span className="w-4 text-[11px] text-gray-500">{index + 1}</span>
                <span>
                  {item.emoji} {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900 to-[#0F172A] p-4">
        <h2 className="text-sm font-semibold text-white">Join the conversation</h2>
        <p className="mt-2 text-xs leading-5 text-gray-300">
          Post thoughts, Your Stars notes and good vibes. Marketplace ads stay in Marketplace.
        </p>
        {user ? (
          <Link
            href={VIBE_PATHS.profile(user.uid)}
            className="mt-3 inline-flex rounded-full bg-[#FBB03B] px-3.5 py-2 text-xs font-semibold text-[#0B1220]"
          >
            My Vibe profile
          </Link>
        ) : (
          <GuestAuthLink
            href={VIBE_PATHS.home}
            className="mt-3 inline-flex rounded-full bg-[#FBB03B] px-3.5 py-2 text-xs font-semibold text-[#0B1220]"
          >
            Create account
          </GuestAuthLink>
        )}
        {user ? (
          <Link href={VIBE_PATHS.saved} className="mt-1.5 block text-xs text-gray-300 hover:text-[#FBB03B]">
            Saved posts
          </Link>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
        <h2 className="text-xs font-semibold text-white">Community rules</h2>
        <ul className="mt-3 space-y-1.5 text-xs leading-5 text-gray-400">
          <li>Be respectful.</li>
          <li>No spam, scams or marketplace ads here.</li>
          <li>No hate, harassment or illegal content.</li>
          <li>Your Stars and quizzes are entertainment.</li>
          <li>Report anything that feels unsafe.</li>
        </ul>
      </section>
    </div>
  );
}
