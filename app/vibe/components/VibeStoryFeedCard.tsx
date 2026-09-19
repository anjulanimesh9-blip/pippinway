"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { trackVibe } from "@/lib/analytics";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { vibeTimeAgo } from "@/lib/vibe/time";
import type { InteractiveStory } from "@/lib/vibe/stories";
import VibePostImage, { VIBE_FEED_IMAGE_SIZES } from "./VibePostImage";

function storyBlurb(story: InteractiveStory) {
  const text = (story.subtitle || story.introduction).replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trimEnd()}…`;
}

export default function VibeStoryFeedCard({ story }: { story: InteractiveStory }) {
  const href = VIBE_PATHS.story(story.slug);
  const cover = story.coverImageUrl || story.scenes.find((scene) => scene.imageUrl)?.imageUrl || "";
  const stamp = vibeTimeAgo(story.updatedAt ?? story.createdAt);

  return (
    <article
      data-vibe-story-card={story.slug}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]"
    >
      <Link
        href={href}
        className="block"
        onClick={() =>
          trackVibe("vibe_category", {
            vibe_category: "interactive-stories",
            content_type: story.slug,
          })
        }
      >
        <div className="flex items-start gap-2.5 px-4 pt-4 sm:gap-3 sm:px-5 sm:pt-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-800 text-lg">
            📖
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">Pippinway Vibe</p>
              <span className="rounded-full border border-[#FBB03B]/40 bg-[#FBB03B]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FBB03B]">
                Interactive Story
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {stamp ? `${stamp} · ` : ""}
              Interactive Stories
            </p>
          </div>
        </div>

        <div className="px-4 pt-3 sm:px-5">
          <h2 className="text-[17px] font-semibold leading-6 text-white">{story.title}</h2>
          <p className="mt-1.5 text-[15px] leading-6 text-gray-200">{storyBlurb(story)}</p>
        </div>

        {cover ? (
          <div className="mt-3 bg-black/40">
            <VibePostImage src={cover} variant="feed" sizes={VIBE_FEED_IMAGE_SIZES} />
          </div>
        ) : null}

        <div className="px-4 py-3 sm:px-5">
          <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FBB03B] px-4 text-sm font-semibold text-[#0B1220]">
            <BookOpen className="h-4 w-4" />
            Start Reading
          </span>
        </div>
      </Link>
    </article>
  );
}
