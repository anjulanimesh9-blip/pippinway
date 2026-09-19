import type { InteractiveStory, StoryScene } from "./types";

export type StoryValidation = {
  ok: boolean;
  errors: string[];
};

function sceneMap(story: InteractiveStory): Map<string, StoryScene> {
  return new Map(story.scenes.map((scene) => [scene.id, scene]));
}

export function getStoryScene(
  story: InteractiveStory,
  sceneId: string
): StoryScene | undefined {
  return story.scenes.find((scene) => scene.id === sceneId);
}

export function shortestStepsToEnding(
  story: InteractiveStory,
  fromId: string
): number {
  const scenes = sceneMap(story);
  const queue: Array<{ id: string; steps: number }> = [{ id: fromId, steps: 0 }];
  const seen = new Set<string>([fromId]);

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    const scene = scenes.get(current.id);
    if (!scene) continue;
    if (scene.isEnding) return current.steps;
    for (const choice of scene.choices) {
      if (seen.has(choice.destinationId)) continue;
      seen.add(choice.destinationId);
      queue.push({ id: choice.destinationId, steps: current.steps + 1 });
    }
  }
  return 0;
}

export function enumerateStoryRoutes(story: InteractiveStory): string[][] {
  const scenes = sceneMap(story);
  const routes: string[][] = [];

  const walk = (path: string[]) => {
    const currentId = path[path.length - 1];
    const scene = scenes.get(currentId);
    if (!scene) return;
    if (scene.isEnding || scene.choices.length === 0) {
      routes.push(path);
      return;
    }
    for (const choice of scene.choices) {
      if (path.includes(choice.destinationId)) continue;
      walk([...path, choice.destinationId]);
    }
  };

  walk([story.startSceneId]);
  return routes;
}

export function validateInteractiveStory(story: InteractiveStory): StoryValidation {
  const errors: string[] = [];
  if (!story.slug.trim()) errors.push("Story slug is required.");
  if (!story.title.trim()) errors.push("Story title is required.");
  if (!story.introduction.trim()) errors.push("Story introduction is required.");
  if (!story.scenes.length) errors.push("A story needs at least one scene.");
  if (!story.startSceneId) errors.push("A starting scene is required.");

  const ids = story.scenes.map((scene) => scene.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) errors.push("Scene IDs must be unique.");

  const scenes = sceneMap(story);
  if (story.startSceneId && !scenes.has(story.startSceneId)) {
    errors.push(`Starting scene ${story.startSceneId} does not exist.`);
  }

  const start = scenes.get(story.startSceneId);
  if (start?.isEnding) errors.push("The starting scene cannot be an ending.");

  const endings = story.scenes.filter((scene) => scene.isEnding);
  if (!endings.length) errors.push("A story needs at least one ending.");

  for (const scene of story.scenes) {
    if (!scene.id.trim()) errors.push("Every scene needs an ID.");
    if (!scene.title.trim()) errors.push(`Scene ${scene.id || "?"} needs a title.`);
    if (!scene.text.trim()) errors.push(`Scene ${scene.id || "?"} needs narrative text.`);

    for (const fromId of Object.keys(scene.arriveFrom || {})) {
      if (!scenes.has(fromId)) {
        errors.push(`Scene ${scene.id} has a transition from missing scene ${fromId}.`);
      }
    }

    if (scene.isEnding) {
      if (scene.choices.length) {
        errors.push(`Ending scene ${scene.id} must not offer narrative choices.`);
      }
      continue;
    }

    if (scene.choices.length < 2 || scene.choices.length > 3) {
      errors.push(`Scene ${scene.id} must have two or three choices.`);
    }

    const choiceIds = new Set<string>();
    for (const choice of scene.choices) {
      if (!choice.label.trim()) {
        errors.push(`Scene ${scene.id} has a choice with no label.`);
      }
      if (choiceIds.has(choice.id)) {
        errors.push(`Scene ${scene.id} has duplicate choice ${choice.id}.`);
      }
      choiceIds.add(choice.id);
      if (!choice.destinationId) {
        errors.push(`Scene ${scene.id} choice ${choice.id} has no destination.`);
        continue;
      }
      if (!scenes.has(choice.destinationId)) {
        errors.push(
          `Scene ${scene.id} choice ${choice.id} points to missing scene ${choice.destinationId}.`
        );
      }
      if (choice.destinationId === story.startSceneId) {
        errors.push(
          `Scene ${scene.id} choice ${choice.id} unexpectedly restarts the story.`
        );
      }
    }
  }

  if (story.startSceneId && scenes.size) {
    const reachable = new Set<string>();
    const queue = [story.startSceneId];
    while (queue.length) {
      const id = queue.shift();
      if (!id || reachable.has(id)) continue;
      reachable.add(id);
      const scene = scenes.get(id);
      scene?.choices.forEach((choice) => queue.push(choice.destinationId));
    }

    for (const scene of story.scenes) {
      if (!reachable.has(scene.id)) {
        errors.push(`Scene ${scene.id} cannot be reached from the start.`);
      }
    }

    const routes = enumerateStoryRoutes(story);
    const endingIds = new Set(endings.map((scene) => scene.id));
    const reachedEndings = new Set(
      routes.map((route) => route[route.length - 1]).filter((id) => endingIds.has(id))
    );
    for (const ending of endings) {
      if (!reachedEndings.has(ending.id)) {
        errors.push(`Ending ${ending.id} cannot be reached from the start.`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
