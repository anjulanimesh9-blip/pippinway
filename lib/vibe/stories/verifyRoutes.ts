import { THE_LAST_WITNESS } from "./theLastWitness";
import { enumerateStoryRoutes, validateInteractiveStory } from "./validate";

export function verifyTheLastWitnessRoutes() {
  const check = validateInteractiveStory(THE_LAST_WITNESS);
  const routes = enumerateStoryRoutes(THE_LAST_WITNESS);
  const endings = routes.map((route) => route[route.length - 1]);
  return {
    ok: check.ok,
    errors: check.errors,
    routeCount: routes.length,
    ending11: endings.filter((id) => id === "11").length,
    ending12: endings.filter((id) => id === "12").length,
    startIs01: THE_LAST_WITNESS.startSceneId === "01",
    scenes: THE_LAST_WITNESS.scenes.map((scene) => scene.id),
  };
}
