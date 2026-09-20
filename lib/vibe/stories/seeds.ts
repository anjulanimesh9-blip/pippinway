import { THE_LAST_WITNESS, THE_LAST_WITNESS_SLUG } from "./theLastWitness";
import { THE_WRONG_TRAIL, THE_WRONG_TRAIL_SLUG } from "./theWrongTrail";
import type { InteractiveStory } from "./types";

export const SEED_STORIES: InteractiveStory[] = [THE_LAST_WITNESS, THE_WRONG_TRAIL];

export const SEED_STORY_TITLES: Record<string, string> = {
  [THE_LAST_WITNESS_SLUG]: THE_LAST_WITNESS.title,
  [THE_WRONG_TRAIL_SLUG]: THE_WRONG_TRAIL.title,
};

export function getSeedStory(slug: string): InteractiveStory | null {
  return SEED_STORIES.find((story) => story.slug === slug) ?? null;
}

export function withMissingSeedStories(stories: InteractiveStory[]): InteractiveStory[] {
  const slugs = new Set(stories.map((story) => story.slug));
  const missing = SEED_STORIES.filter((story) => !slugs.has(story.slug));
  return [...missing, ...stories];
}
