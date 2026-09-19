import type { Metadata } from "next";
import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { THE_LAST_WITNESS } from "@/lib/vibe/stories/theLastWitness";
import StoryPageClient from "./StoryPageClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = slug === THE_LAST_WITNESS.slug ? THE_LAST_WITNESS : null;
  if (!story) {
    return vibeSectionMetadata(
      "Interactive Story",
      "Read a choose-your-path story on Pippinway Vibe.",
      VIBE_PATHS.story(slug)
    );
  }
  return vibeSectionMetadata(story.title, story.introduction, VIBE_PATHS.story(slug));
}

export default async function InteractiveStoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <StoryPageClient slug={slug} />;
}
