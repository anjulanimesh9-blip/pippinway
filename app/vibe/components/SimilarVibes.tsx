"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { vibeCategoryLabel } from "@/lib/vibe/categories";
import { fetchSimilarVibePosts } from "@/lib/vibe/client";
import { VIBE_PATHS, VIBE_SIMILAR_LIMIT } from "@/lib/vibe/constants";
import { vibePlainPreview } from "@/lib/vibe/richText";
import type { VibePost } from "@/lib/vibe/types";
import VibePostImage, { VIBE_SIMILAR_IMAGE_SIZES } from "./VibePostImage";

export default function SimilarVibes({ post }: { post: VibePost }) {
  const [items, setItems] = useState<VibePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchSimilarVibePosts({
      excludeId: post.id,
      category: post.category,
      limitCount: VIBE_SIMILAR_LIMIT,
    }).then((list) => {
      if (cancelled) return;
      setItems(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [post.id, post.category]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="min-w-0 overflow-x-hidden border-t border-white/10 pt-5 sm:pt-6">
      <h2 className="mb-3 text-base font-bold text-white sm:mb-4 sm:text-lg">
        Similar Vibes
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-[#0F172A]" />
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-[#0F172A]" />
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-[#0F172A]" />
          <div className="hidden h-36 animate-pulse rounded-xl border border-white/10 bg-[#0F172A] sm:block" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, index) => {
            const preview = vibePlainPreview(item.text, 110);
            return (
              <Link
                key={item.id}
                href={VIBE_PATHS.post(item.id)}
                className={`min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0F172A] transition hover:border-white/20 ${
                  index >= 3 ? "hidden sm:block" : ""
                }`}
              >
                {item.imageUrl ? (
                  <VibePostImage
                    src={item.imageUrl}
                    variant="similar"
                    sizes={VIBE_SIMILAR_IMAGE_SIZES}
                  />
                ) : null}
                <div className="min-w-0 space-y-1 p-2.5 sm:space-y-1.5 sm:p-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {item.authorName}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {vibeCategoryLabel(item.category)}
                  </p>
                  {preview ? (
                    <p className="line-clamp-2 text-[13px] leading-5 text-gray-300 sm:text-sm">
                      {preview}
                    </p>
                  ) : null}
                  <p className="flex items-center gap-3 pt-0.5 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likeCount === 1 ? "1 Pip" : `${item.likeCount} Pips`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {item.commentCount}
                    </span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
