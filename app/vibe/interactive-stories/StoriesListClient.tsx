"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingPhoto from "@/app/components/ListingPhoto";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { fetchPublishedStories, type InteractiveStory } from "@/lib/vibe/stories";
import { THE_LAST_WITNESS } from "@/lib/vibe/stories/theLastWitness";
import VibeCategoryNav from "../components/VibeCategoryNav";
import VibePageTrack from "../components/VibePageTrack";
import StoryReaderLayout, { STORY_INTRO_TEXT_CLASS } from "./StoryReaderLayout";

export default function StoriesListClient() {
  const [stories, setStories] = useState<InteractiveStory[]>([THE_LAST_WITNESS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedStories()
      .then((next) => {
        if (!cancelled) setStories(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoryReaderLayout framed={false} className="space-y-5">
      <VibePageTrack event="vibe_page_view" />
      <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
        ← Back to Vibe
      </Link>
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">
          Pippinway Vibe
        </p>
        <h1 className="mt-1 text-2xl font-bold">Interactive Stories 📖</h1>
        <p className={`mt-2 ${STORY_INTRO_TEXT_CLASS}`}>
          Read a scene, choose what happens next, and follow your own path to the ending. New
          stories can be published from the Vibe admin panel.
        </p>
      </section>
      <VibeCategoryNav active="interactive-stories" />
      {loading && stories.length === 0 ? (
        <p className="text-sm text-gray-400">Loading stories…</p>
      ) : null}
      <div className="grid gap-3">
        {stories.map((story) => (
          <Link
            key={story.id || story.slug}
            href={VIBE_PATHS.story(story.slug)}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] transition hover:border-[#FBB03B]/40"
          >
            {story.coverImageUrl ? (
              <ListingPhoto
                src={story.coverImageUrl}
                alt=""
                fill={false}
                width={1200}
                height={640}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-28 bg-gradient-to-r from-indigo-950 via-[#0F172A] to-[#020817]" />
            )}
            <div className="p-4 sm:p-5">
              <h2 className="text-lg font-semibold">{story.title}</h2>
              {story.subtitle ? (
                <p className="mt-1 text-sm text-[#FBB03B]">{story.subtitle}</p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-gray-400">{story.introduction}</p>
              <p className="mt-4 text-sm font-semibold text-[#FBB03B]">Begin reading →</p>
            </div>
          </Link>
        ))}
      </div>
    </StoryReaderLayout>
  );
}
