"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bookmark, Flag, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import AdsterraBanner from "@/app/components/ads/AdsterraBanner";
import { ADSTERRA_AD_KEY } from "@/app/components/ads/adsterraConfig";
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
import {
  isLongVibeText,
  VIBE_FEED_PREVIEW_CHARS,
  VIBE_FEED_PREVIEW_LINES,
  VibeRichText,
} from "@/lib/vibe/richText";
import { vibeTimeAgo } from "@/lib/vibe/time";
import type { VibePost } from "@/lib/vibe/types";
import { zodiacById } from "@/lib/vibe/zodiac";
import VibeComments from "./VibeComments";
import VibePostImage, {
  VIBE_DETAIL_IMAGE_SIZES,
  VIBE_FEED_IMAGE_SIZES,
} from "./VibePostImage";
import VibeReportModal from "./VibeReportModal";
import VibeShareMenu from "./VibeShareMenu";

const DOUBLE_TAP_MS = 350;
const EXPAND_CLICK_GUARD_MS = 450;
/** Article body is text-[17px] leading-[1.8]; 8 lines ≈ first screen of a long post. */
const DETAIL_COLLAPSE_LINES = 8;
const DETAIL_COLLAPSE_PX = 17 * 1.8 * DETAIL_COLLAPSE_LINES;

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
  detail = false,
  onRemoved,
}: {
  post: VibePost;
  isAdmin?: boolean;
  showComments?: boolean;
  detail?: boolean;
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
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const expanded = expandedPostId === post.id;
  const [detailOverflows, setDetailOverflows] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const detailTextRef = useRef<HTMLDivElement>(null);
  const expandGuardUntil = useRef(0);
  const lastTextTapAt = useRef(0);
  const sign = post.zodiacSign ? zodiacById(post.zodiacSign) : undefined;
  const likeCount = Math.max(0, post.likeCount + likeDelta);
  const isLong = detail
    ? detailOverflows
    : isLongVibeText(post.text, VIBE_FEED_PREVIEW_CHARS, VIBE_FEED_PREVIEW_LINES);
  const clampLines = VIBE_FEED_PREVIEW_LINES;

  useLayoutEffect(() => {
    if (!detail) return;
    const el = detailTextRef.current;
    if (!el) return;

    const measure = () => {
      setDetailOverflows(el.scrollHeight > DETAIL_COLLAPSE_PX + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [detail, post.id, post.text]);

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
    <article
      ref={articleRef}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]"
    >
      <div
        className={`flex items-start gap-2.5 sm:gap-3 ${
          detail ? "px-3 pt-3.5 sm:px-5 sm:pt-5" : "px-4 pt-4 sm:px-5 sm:pt-5"
        }`}
      >
        <Link href={VIBE_PATHS.profile(post.authorId)} className="shrink-0">
          <Avatar src={post.authorPhoto} name={post.authorName} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={VIBE_PATHS.profile(post.authorId)} className="block truncate text-sm font-semibold text-white">
                {post.authorName}
              </Link>
              {detail ? (
                <p className="truncate text-[12px] text-gray-500">
                  {vibeTimeAgo(post.createdAt)} · {vibeCategoryLabel(post.category)}
                  {sign ? ` · ${sign.emoji} ${sign.name}` : ""}
                </p>
              ) : (
                <Link
                  href={VIBE_PATHS.post(post.id)}
                  className="block text-[12px] text-gray-500 hover:text-[#FBB03B]"
                >
                  {vibeTimeAgo(post.createdAt)} · {vibeCategoryLabel(post.category)}
                  {sign ? ` · ${sign.emoji} ${sign.name}` : ""}
                </Link>
              )}
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
        <div className={`flex flex-wrap gap-2 pt-2 ${detail ? "px-3 sm:px-5" : "px-4 sm:px-5"}`}>
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
      {detail ? (
        <div className="flex justify-center px-3 py-3 sm:px-5">
          <AdsterraBanner adKey={ADSTERRA_AD_KEY} className="mb-0" />
        </div>
      ) : null}
      <div className={`${detail ? "px-3 pt-2.5 sm:px-5 sm:pt-4" : "px-4 pt-3 sm:px-5"}`}>
        <div
          className={`touch-manipulation overflow-hidden transition-[max-height] duration-300 ease-out ${
            !detail && !expanded && isLong ? "max-h-[14.5rem]" : ""
          }`}
          style={
            detail && !expanded ? { maxHeight: DETAIL_COLLAPSE_PX } : undefined
          }
          onDoubleClick={(event) => {
            if (!isLong || !expanded) return;
            if (window.matchMedia("(pointer: coarse)").matches) return;
            if (
              event.target instanceof Element &&
              event.target.closest("a, button")
            ) {
              return;
            }
            setExpandedPostId(null);
            if (!detail) return;
            const top = articleRef.current?.getBoundingClientRect().top ?? 0;
            if (top < 72) {
              articleRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
          onClick={() => {
            if (detail || !isLong || !expanded) return;
            const now = Date.now();
            if (now - lastTextTapAt.current < DOUBLE_TAP_MS) {
              lastTextTapAt.current = 0;
              setExpandedPostId(null);
              return;
            }
            lastTextTapAt.current = now;
          }}
        >
          <div ref={detail ? detailTextRef : undefined}>
            <VibeRichText
              text={post.text}
              variant={detail ? "article" : "feed"}
              clamped={!detail && !expanded && isLong}
              clampLines={clampLines}
            />
          </div>
        </div>
        {isLong ? (
          <button
            type="button"
            className="mt-1.5 min-h-10 touch-manipulation px-0.5 text-left text-[13px] font-semibold text-[#FBB03B] sm:mt-2 sm:min-h-11 sm:text-sm"
            aria-expanded={expanded}
            onClick={() => {
              if (expanded) {
                if (Date.now() < expandGuardUntil.current) return;
                setExpandedPostId(null);
                const top = articleRef.current?.getBoundingClientRect().top ?? 0;
                if (top < 72) {
                  articleRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
                return;
              }
              setExpandedPostId(post.id);
              expandGuardUntil.current = Date.now() + EXPAND_CLICK_GUARD_MS;
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>
      {post.imageUrl ? (
        detail ? (
          <div className="mt-3 w-full bg-black/40 sm:mt-4">
            <VibePostImage
              src={post.imageUrl}
              variant="detail"
              sizes={VIBE_DETAIL_IMAGE_SIZES}
              priority
            />
          </div>
        ) : (
          <Link href={VIBE_PATHS.post(post.id)} className="mt-3 block bg-black/40">
            <VibePostImage
              src={post.imageUrl}
              variant="feed"
              sizes={VIBE_FEED_IMAGE_SIZES}
            />
          </Link>
        )
      ) : null}
      <div
        className={`flex items-center justify-between text-xs text-gray-500 ${
          detail ? "px-3 py-2 sm:px-5 sm:py-2.5" : "px-4 py-2.5 sm:px-5"
        }`}
      >
        <span>{likeCount === 1 ? "1 Pip" : `${likeCount} Pips`}</span>
        <span>{post.commentCount} comments</span>
      </div>
      <div className="grid grid-cols-4 border-t border-white/10">
        <button
          type="button"
          onClick={onLike}
          className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-0.5 px-0.5 py-2 text-[11px] sm:gap-1 sm:text-sm ${
            liked ? "text-red-400" : "text-gray-300"
          }`}
        >
          <Heart className={`h-4 w-4 shrink-0 ${liked ? "fill-current" : ""}`} />
          <span className="truncate">{liked ? "Pipped" : "Pip"}</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((value) => !value)}
          className="inline-flex min-h-11 min-w-0 items-center justify-center gap-0.5 px-0.5 py-2 text-[11px] text-gray-300 sm:gap-1 sm:text-sm"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">Comment</span>
        </button>
        <VibeShareMenu postId={post.id} text={post.text} category={post.category} />
        <button
          type="button"
          onClick={onSave}
          className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-0.5 px-0.5 py-2 text-[11px] sm:gap-1 sm:text-sm ${
            saved ? "text-[#FBB03B]" : "text-gray-300"
          }`}
        >
          <Bookmark className={`h-4 w-4 shrink-0 ${saved ? "fill-current" : ""}`} />
          <span className="truncate">Save</span>
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
