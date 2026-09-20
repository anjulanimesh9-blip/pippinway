import { SEED_STORIES } from "./seeds";
import type { InteractiveStory } from "./types";
import { enumerateStoryRoutes, validateInteractiveStory } from "./validate";

export function verifyStoryRoutes(story: InteractiveStory) {
  const check = validateInteractiveStory(story);
  const routes = enumerateStoryRoutes(story);
  const endings = routes.map((route) => route[route.length - 1]);
  const endingIds = story.scenes.filter((scene) => scene.isEnding).map((scene) => scene.id);
  return {
    slug: story.slug,
    title: story.title,
    ok: check.ok,
    errors: check.errors,
    routeCount: routes.length,
    startIs01: story.startSceneId === "01",
    scenes: story.scenes.map((scene) => scene.id),
    sceneCount: story.scenes.length,
    endingIds,
    endingCounts: Object.fromEntries(
      endingIds.map((id) => [id, endings.filter((ending) => ending === id).length])
    ),
  };
}

export function verifyTheLastWitnessRoutes() {
  const lastWitness = SEED_STORIES.find((story) => story.slug === "the-last-witness");
  if (!lastWitness) {
    throw new Error("The Last Witness seed is missing.");
  }
  return verifyStoryRoutes(lastWitness);
}

export function verifySeedStoryRoutes() {
  return SEED_STORIES.map(verifyStoryRoutes);
}
