"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackVibe } from "@/lib/analytics";
import { getVibePost, isCurrentUserAdmin } from "@/lib/vibe/client";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import type { VibePost } from "@/lib/vibe/types";
import SimilarVibes from "../../components/SimilarVibes";
import VibePostBackLink from "../../components/VibePostBackLink";
import VibePostCard from "../../components/VibePostCard";
import VibeShell from "../../components/VibeShell";

function VibePostInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const [post, setPost] = useState<VibePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

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
      <div className="mx-auto min-w-0 max-w-2xl space-y-4 overflow-x-hidden px-2.5 py-3 pb-10 sm:space-y-6 sm:px-4 sm:py-4">
        <VibePostBackLink fromParam={fromParam} />
        {loading ? (
          <div className="animate-pulse rounded-2xl border border-white/10 bg-[#0F172A] p-8" />
        ) : post ? (
          <>
            <VibePostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              showComments
              detail
            />
            <SimilarVibes key={post.id} post={post} />
          </>
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

export default function VibePostClient({ id }: { id: string }) {
  return (
    <Suspense
      fallback={
        <VibeShell>
          <div className="mx-auto max-w-2xl px-2.5 py-3 sm:px-4 sm:py-4">
            <div className="animate-pulse rounded-2xl border border-white/10 bg-[#0F172A] p-8" />
          </div>
        </VibeShell>
      }
    >
      <VibePostInner key={id} id={id} />
    </Suspense>
  );
}
