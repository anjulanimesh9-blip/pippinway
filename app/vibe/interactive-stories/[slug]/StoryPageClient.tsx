"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { fetchPublicStory, getSeedStory, type InteractiveStory } from "@/lib/vibe/stories";
import StoryReader from "../StoryReader";
import StoryReaderLayout from "../StoryReaderLayout";

function initialStory(slug: string): InteractiveStory | null {
  return getSeedStory(slug);
}

export default function StoryPageClient({ slug }: { slug: string }) {
  const [story, setStory] = useState<InteractiveStory | null>(() => initialStory(slug));
  const [loading, setLoading] = useState(!initialStory(slug));

  useEffect(() => {
    let cancelled = false;
    void fetchPublicStory(slug).then((next) => {
      if (cancelled) return;
      setStory(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading && !story) {
    return (
      <StoryReaderLayout>
        <p className="px-4 py-16 text-center text-[17px] leading-8 text-gray-400">
          Opening the story…
        </p>
      </StoryReaderLayout>
    );
  }

  if (!story) {
    return (
      <StoryReaderLayout>
        <div className="px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Story not found</h1>
          <p className="mt-2 text-[17px] leading-8 text-gray-400">
            This interactive story is unpublished or does not exist.
          </p>
          <Link href={VIBE_PATHS.interactiveStories} className="mt-5 inline-block text-[#FBB03B]">
            ← All stories
          </Link>
        </div>
      </StoryReaderLayout>
    );
  }

  return <StoryReader story={story} />;
}
