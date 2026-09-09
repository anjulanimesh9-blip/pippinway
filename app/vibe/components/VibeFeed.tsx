"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import useAuth from "@/app/hooks/useAuth";
import {
  fetchBlockedIds,
  fetchSavedPosts,
  fetchVibeFeed,
  isCurrentUserAdmin,
} from "@/lib/vibe/client";
import type { VibePost, VibePostCategory } from "@/lib/vibe/types";
import VibePostCard from "./VibePostCard";

function mergeFeedPosts(prev: VibePost[], next: VibePost[]): VibePost[] {
  if (prev.length === 0) return next;
  const seen = new Set(prev.map((post) => post.id));
  const extra = next.filter((post) => !seen.has(post.id));
  return extra.length === 0 ? prev : [...prev, ...extra];
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-[#0F172A] p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-2/3 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function VibeFeed({
  category = "all",
  authorId,
  savedOnly = false,
  refreshKey = 0,
}: {
  category?: VibePostCategory | "all";
  authorId?: string;
  savedOnly?: boolean;
  refreshKey?: number;
}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const blockedRef = useRef<string[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);
  const loadGen = useRef(0);
  const loadingMoreRef = useRef(false);

  const applyFilter = useCallback((list: VibePost[]) => {
    const blocked = new Set(blockedRef.current);
    return list.filter((post) => !blocked.has(post.authorId));
  }, []);

  const load = useCallback(
    async (next?: QueryDocumentSnapshot | null) => {
      const gen = loadGen.current;
      if (savedOnly) {
        if (!user) {
          setPosts([]);
          setLoading(false);
          return;
        }
        try {
          const saved = applyFilter(await fetchSavedPosts(user.uid));
          if (gen !== loadGen.current) return;
          setPosts(saved);
          setCursor(null);
          setError("");
        } catch {
          if (gen !== loadGen.current) return;
          setError("Saved posts could not load.");
        } finally {
          if (gen === loadGen.current) setLoading(false);
        }
        return;
      }

      try {
        const page = await fetchVibeFeed({
          category,
          authorId,
          cursor: next ?? null,
        });
        if (gen !== loadGen.current) return;
        const filtered = applyFilter(page.posts);
        setPosts((prev) => (next ? mergeFeedPosts(prev, filtered) : filtered));
        setCursor(page.cursor);
        setError("");
      } catch {
        if (gen !== loadGen.current) return;
        setError("The feed could not load. Try again.");
      } finally {
        if (gen === loadGen.current) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [applyFilter, authorId, category, savedOnly, user]
  );

  useEffect(() => {
    let cancelled = false;
    loadGen.current += 1;
    const gen = loadGen.current;
    loadingMoreRef.current = false;
    (async () => {
      try {
        if (savedOnly) {
          if (!user) {
            if (!cancelled) {
              setPosts([]);
              setLoading(false);
            }
            return;
          }
          const saved = applyFilter(await fetchSavedPosts(user.uid));
          if (cancelled || gen !== loadGen.current) return;
          setPosts(saved);
          setCursor(null);
          setError("");
        } else {
          const page = await fetchVibeFeed({ category, authorId });
          if (cancelled || gen !== loadGen.current) return;
          setPosts(applyFilter(page.posts));
          setCursor(page.cursor);
          setError("");
        }
      } catch {
        if (!cancelled && gen === loadGen.current) {
          setError(savedOnly ? "Saved posts could not load." : "The feed could not load. Try again.");
        }
      } finally {
        if (!cancelled && gen === loadGen.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyFilter, authorId, category, refreshKey, savedOnly, user]);

  useEffect(() => {
    void isCurrentUserAdmin().then(setIsAdmin);
  }, [user]);

  useEffect(() => {
    if (!user) {
      blockedRef.current = [];
      return;
    }
    void fetchBlockedIds(user.uid).then((ids) => {
      blockedRef.current = ids;
    });
  }, [user]);

  useEffect(() => {
    if (!sentinel.current || !cursor || savedOnly) return;
    const node = sentinel.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingMoreRef.current || loadingMore) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        void load(cursor);
      },
      { rootMargin: "240px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, load, loadingMore, savedOnly]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
        {error}
        <button type="button" className="ml-3 underline" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-8 text-center">
        <p className="text-lg font-semibold">No vibes here yet</p>
        <p className="mt-2 text-sm text-gray-400">
          Be the first to share something kind, funny or useful.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <VibePostCard
          key={post.id}
          post={post}
          isAdmin={isAdmin}
          onRemoved={(id) => setPosts((prev) => prev.filter((item) => item.id !== id))}
        />
      ))}
      {cursor && !savedOnly ? <div ref={sentinel} className="h-8" /> : null}
      {loadingMore ? (
        <p className="pb-4 text-center text-xs text-gray-500">Loading more…</p>
      ) : !cursor && !savedOnly ? (
        <p className="pb-4 text-center text-xs text-gray-500">You’re all caught up</p>
      ) : null}
      <div className="h-4 lg:hidden" aria-hidden />
    </div>
  );
}
