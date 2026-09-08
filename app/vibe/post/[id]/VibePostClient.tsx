"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackVibe } from "@/lib/analytics";
import { getVibePost, isCurrentUserAdmin } from "@/lib/vibe/client";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import type { VibePost } from "@/lib/vibe/types";
import VibePostCard from "../../components/VibePostCard";
import VibeShell from "../../components/VibeShell";

export default function VibePostClient({ id }: { id: string }) {
  const [post, setPost] = useState<VibePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getVibePost(id).then((item) => {
      if (cancelled) return;
      setPost(item && item.status === "visible" ? item : null);
      setLoading(false);
      if (item?.status === "visible") {
        trackVibe("vibe_post_open", { post_id: id, vibe_category: item.category });
      }
    });
    void isCurrentUserAdmin().then(setIsAdmin);
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <VibeShell>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        {loading ? (
          <div className="animate-pulse rounded-2xl border border-white/10 bg-[#0F172A] p-8" />
        ) : post ? (
          <VibePostCard post={post} isAdmin={isAdmin} showComments />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-8 text-center">
            <p className="font-semibold">This post is not available</p>
            <p className="mt-2 text-sm text-gray-400">
              It may have been removed, or the link is incomplete.
            </p>
            <Link
              href={VIBE_PATHS.home}
              className="mt-4 inline-flex rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
            >
              Open Pippinway Vibe
            </Link>
          </div>
        )}
      </div>
    </VibeShell>
  );
}
