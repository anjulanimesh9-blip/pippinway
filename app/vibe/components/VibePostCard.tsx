"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, Flag, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { listingPhotoSrc } from "@/app/components/ListingPhoto";
import { useGuestAuthPrompt } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";
import { trackVibe } from "@/lib/analytics";
import { vibeCategoryLabel } from "@/lib/vibe/categories";
import {
  hasLiked,
  hasSaved,
  removeOwnVibePost,
  toggleLike,
  toggleSave,
} from "@/lib/vibe/client";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { vibeTimeAgo } from "@/lib/vibe/time";
import type { VibePost } from "@/lib/vibe/types";
import { zodiacById } from "@/lib/vibe/zodiac";
import VibeComments from "./VibeComments";
import VibeReportModal from "./VibeReportModal";
import VibeShareMenu from "./VibeShareMenu";

const TEXT_PREVIEW_CHARS = 220;

function Avatar({ src, name }: { src: string; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-10 w-10 rounded-full object-cover" />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800 text-sm font-semibold">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function VibePostCard({
  post,
  isAdmin = false,
  showComments = false,
  onRemoved,
}: {
  post: VibePost;
  isAdmin?: boolean;
  showComments?: boolean;
  onRemoved?: (id: string) => void;
}) {
  const { user } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeDelta, setLikeDelta] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(showComments);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [expanded, setExpanded] = useState(showComments);
  const sign = post.zodiacSign ? zodiacById(post.zodiacSign) : undefined;
  const likeCount = Math.max(0, post.likeCount + likeDelta);
  const isLong =
    post.text.length > TEXT_PREVIEW_CHARS || post.text.split("\n").length > 4;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void hasLiked(post.id, user.uid).then((value) => {
      if (!cancelled) setLiked(value);
    });
    void hasSaved(post.id, user.uid).then((value) => {
      if (!cancelled) setSaved(value);
    });
    return () => {
      cancelled = true;
    };
  }, [post.id, user]);

  const needAuth = (path: string) => {
    if (user) return false;
    requireAuth(path);
    return true;
  };

  const onLike = async () => {
    if (needAuth(VIBE_PATHS.post(post.id))) return;
    try {
      const next = await toggleLike(post, liked);
      setLiked(next);
      setLikeDelta((value) => value + (next ? 1 : -1));
      trackVibe(next ? "vibe_like" : "vibe_unlike", {
        post_id: post.id,
        vibe_category: post.category,
      });
    } catch {
      // Keep previous state if rules reject the write.
    }
  };

  const onSave = async () => {
    if (needAuth(VIBE_PATHS.post(post.id))) return;
    try {
      const next = await toggleSave(post.id, saved);
      setSaved(next);
    } catch {
      // Ignore.
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
      <div className="flex items-start gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
        <Link href={VIBE_PATHS.profile(post.authorId)} className="shrink-0">
          <Avatar src={post.authorPhoto} name={post.authorName} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={VIBE_PATHS.profile(post.authorId)} className="block truncate font-semibold text-white">
                {post.authorName}
              </Link>
              <p className="text-[12px] text-gray-500">
                {vibeTimeAgo(post.createdAt)} · {vibeCategoryLabel(post.category)}
                {sign ? ` · ${sign.emoji} ${sign.name}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="-mr-1 rounded-full p-1 text-gray-400 hover:bg-white/5"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Post menu"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {menuOpen ? (
        <div className="flex flex-wrap gap-2 px-3 pt-2 sm:px-4">
          <button
            type="button"
            className="rounded-full border border-white/10 px-2 py-1 text-xs text-gray-300"
            onClick={() => {
              setReportOpen(true);
              setMenuOpen(false);
            }}
          >
            <Flag className="mr-1 inline h-3 w-3" />
            Report
          </button>
          {(user?.uid === post.authorId || isAdmin) && (
            <button
              type="button"
              className="rounded-full border border-red-500/30 px-2 py-1 text-xs text-red-300"
              onClick={async () => {
                await removeOwnVibePost(post, isAdmin);
                onRemoved?.(post.id);
              }}
            >
              Remove
            </button>
          )}
        </div>
      ) : null}
      <div className="px-3 pt-2.5 sm:px-4">
        <p
          className={`text-[15px] leading-6 text-gray-100 ${
            expanded || !isLong ? "whitespace-pre-wrap" : "line-clamp-4"
          }`}
        >
          {post.text}
        </p>
        {isLong && !expanded ? (
          <button
            type="button"
            className="mt-1 text-sm font-medium text-[#FBB03B]"
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        ) : null}
      </div>
      {post.imageUrl ? (
        <Link
          href={VIBE_PATHS.post(post.id)}
          className="mt-3 block bg-black/40"
        >
          {/* Native img keeps each photo's aspect ratio instead of a cropped 16:10 or square box. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listingPhotoSrc(post.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            className="mx-auto block h-auto max-h-[min(72vh,820px)] w-full object-contain"
          />
        </Link>
      ) : null}
      <div className="flex items-center justify-between px-3 py-2 text-[12px] text-gray-500 sm:px-4">
        <span>{likeCount} likes</span>
        <span>{post.commentCount} comments</span>
      </div>
      <div className="grid grid-cols-4 border-t border-white/10">
        <button
          type="button"
          onClick={onLike}
          className={`inline-flex min-w-0 items-center justify-center gap-1 py-2.5 text-xs sm:text-sm ${
            liked ? "text-red-400" : "text-gray-300"
          }`}
        >
          <Heart className={`h-4 w-4 shrink-0 ${liked ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((value) => !value)}
          className="inline-flex min-w-0 items-center justify-center gap-1 py-2.5 text-xs text-gray-300 sm:text-sm"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Comment
        </button>
        <VibeShareMenu postId={post.id} text={post.text} category={post.category} />
        <button
          type="button"
          onClick={onSave}
          className={`inline-flex min-w-0 items-center justify-center gap-1 py-2.5 text-xs sm:text-sm ${
            saved ? "text-[#FBB03B]" : "text-gray-300"
          }`}
        >
          <Bookmark className={`h-4 w-4 shrink-0 ${saved ? "fill-current" : ""}`} />
          Save
        </button>
      </div>
      {commentsOpen ? <VibeComments postId={post.id} isAdmin={isAdmin} /> : null}
      <VibeReportModal
        open={reportOpen}
        postId={post.id}
        targetType="post"
        targetId={post.id}
        onClose={() => setReportOpen(false)}
      />
    </article>
  );
}
