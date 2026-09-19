"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import { trackVibe } from "@/lib/analytics";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import {
  clearStoryProgress,
  getStoryScene,
  markStoryCompletedLocally,
  readStoryCompletedLocally,
  readStoryProgress,
  readStoryRewardIntent,
  shortestStepsToEnding,
  writeStoryProgress,
  type InteractiveStory,
} from "@/lib/vibe/stories";
import { recordStoryRewardEvent } from "@/lib/vibe/stories/rewards";
import StoryRewardPanel from "./StoryRewardPanel";
import StorySceneImage from "./StorySceneImage";
import StoryBeforeChoicesBanner from "./StoryBeforeChoicesBanner";
import StoryReaderLayout, {
  STORY_BODY_TEXT_CLASS,
  STORY_CHOICE_BUTTON_CLASS,
  STORY_CHOICE_LABEL_CLASS,
  STORY_INTRO_TEXT_CLASS,
} from "./StoryReaderLayout";

function sceneLabel(id: string) {
  return `Scene ${id}`;
}

function isScrollable(node: HTMLElement) {
  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;
  if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") {
    return false;
  }
  return node.scrollHeight > node.clientHeight + 1;
}

function withInstantDocumentScroll(run: () => void) {
  const html = document.documentElement;
  const body = document.body;
  const prevHtml = html.style.scrollBehavior;
  const prevBody = body.style.scrollBehavior;
  html.style.setProperty("scroll-behavior", "auto", "important");
  body.style.setProperty("scroll-behavior", "auto", "important");
  try {
    run();
  } finally {
    html.style.scrollBehavior = prevHtml;
    body.style.scrollBehavior = prevBody;
  }
}

function resetOverflowAncestors(origin: HTMLElement | null) {
  let node: HTMLElement | null = origin;
  while (node) {
    if (isScrollable(node) || node.scrollTop > 0 || node.scrollLeft > 0) {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    }
    node = node.parentElement;
  }
}

function scrollStoryToTop(origin: HTMLElement | null) {
  withInstantDocumentScroll(() => {
    const instant = { top: 0, left: 0, behavior: "instant" as ScrollBehavior };
    try {
      window.scrollTo(instant);
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
    resetOverflowAncestors(origin);
  });
}

export default function StoryReader({ story }: { story: InteractiveStory }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sceneId, setSceneId] = useState(story.startSceneId);
  const [path, setPath] = useState<string[]>([story.startSceneId]);
  const [restored, setRestored] = useState(false);
  const [focusReward, setFocusReward] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [sceneScrollToken, setSceneScrollToken] = useState(0);
  const readerRef = useRef<HTMLDivElement>(null);

  const scene = getStoryScene(story, sceneId) ?? story.scenes[0];
  const previousId = path.length > 1 ? path[path.length - 2] : "";
  const transition = previousId ? scene.arriveFrom?.[previousId] : undefined;
  const remaining = shortestStepsToEnding(story, sceneId);
  const progress = scene.isEnding
    ? 100
    : Math.min(96, Math.round((path.length / (path.length + remaining)) * 100));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("scene") || "";
    const intent = readStoryRewardIntent(story.slug);
    const wantReward = params.get("reward") === "1" || Boolean(intent);
    const saved = readStoryProgress(story.slug);
    const completedEnding = readStoryCompletedLocally(story.slug);
    const validRequested = requested && getStoryScene(story, requested) ? requested : "";
    const validCompleted =
      completedEnding && getStoryScene(story, completedEnding)?.isEnding
        ? completedEnding
        : intent?.endingId && getStoryScene(story, intent.endingId)?.isEnding
          ? intent.endingId
          : "";
    const firstEnding = story.scenes.find((item) => item.isEnding)?.id || "";
    const nextId =
      (wantReward && (validRequested || validCompleted || firstEnding)) ||
      validRequested ||
      saved?.sceneId ||
      story.startSceneId;
    const nextPath =
      saved && saved.path[saved.path.length - 1] === nextId
        ? saved.path
        : nextId === story.startSceneId
          ? [story.startSceneId]
          : [story.startSceneId, nextId];
    setSceneId(nextId);
    setPath(nextPath);
    setFocusReward(wantReward);
    setWelcomeBack(params.get("welcome") === "1" || intent?.welcome === true);
    if (getStoryScene(story, nextId)?.isEnding) {
      markStoryCompletedLocally(story.slug, nextId);
    }
    setRestored(true);
    trackVibe("vibe_page_view", {
      vibe_category: "interactive-stories",
      content_type: story.slug,
    });
  }, [story.slug, story.startSceneId]);

  useEffect(() => {
    if (!user) return;
    void recordStoryRewardEvent({ storySlug: story.slug, event: "read" }).catch(() => undefined);
  }, [story.slug, user]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (!restored) return;
    writeStoryProgress(story.slug, { sceneId, path });
    const params = new URLSearchParams(window.location.search);
    params.set("scene", sceneId);
    const hash = window.location.hash || "";
    window.history.replaceState(null, "", `${pathname}?${params.toString()}${hash}`);
    if (sceneScrollToken > 0) {
      scrollStoryToTop(readerRef.current);
    }
  }, [pathname, path, restored, sceneId, sceneScrollToken, story.slug]);

  useLayoutEffect(() => {
    if (sceneScrollToken === 0) return;
    const origin = readerRef.current;
    scrollStoryToTop(origin);
    let innerFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      scrollStoryToTop(origin);
      innerFrame = window.requestAnimationFrame(() => scrollStoryToTop(origin));
    });
    const timer = window.setTimeout(() => scrollStoryToTop(origin), 0);
    const late = window.setTimeout(() => scrollStoryToTop(origin), 50);
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(innerFrame);
      window.clearTimeout(timer);
      window.clearTimeout(late);
    };
  }, [sceneId, sceneScrollToken]);

  const paragraphs = useMemo(
    () => scene.text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
    [scene.text]
  );

  const requestSceneTop = () => {
    setSceneScrollToken((current) => current + 1);
  };

  const finishSceneScroll = () => {
    const origin = readerRef.current;
    scrollStoryToTop(origin);
    window.requestAnimationFrame(() => scrollStoryToTop(origin));
  };

  const openScene = (nextId: string) => {
    if (!getStoryScene(story, nextId)) return;
    const nextPath = [...path, nextId];
    flushSync(() => {
      setSceneId(nextId);
      setPath(nextPath);
      requestSceneTop();
    });
    finishSceneScroll();
    const destination = getStoryScene(story, nextId);
    if (destination?.isEnding) {
      markStoryCompletedLocally(story.slug, nextId);
      trackVibe("vibe_quiz_complete", {
        quiz_id: story.slug,
        content_type: `ending-${nextId}`,
      });
    }
  };

  const restart = () => {
    flushSync(() => {
      clearStoryProgress(story.slug);
      setSceneId(story.startSceneId);
      setPath([story.startSceneId]);
      requestSceneTop();
    });
    finishSceneScroll();
  };

  if (!scene) {
    return (
      <StoryReaderLayout>
        <p className="px-4 py-16 text-center text-[17px] leading-8 text-gray-400">
          This scene could not be found.
        </p>
      </StoryReaderLayout>
    );
  }

  return (
    <div ref={readerRef}>
    <StoryReaderLayout>
        <div className="h-1.5 bg-black/40">
          <div
            className="h-full bg-gradient-to-r from-[#FBB03B] to-[#f59e0b] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href={VIBE_PATHS.interactiveStories} className="text-sm text-[#FBB03B]">
            ← All stories
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              {path.length} scene{path.length === 1 ? "" : "s"} read
            </span>
            <button
              type="button"
              onClick={restart}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:border-[#FBB03B]/50"
            >
              Restart
            </button>
          </div>
        </div>

        <article className="w-full min-w-0 px-4 pb-24 sm:pb-14">
          <header className="mb-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FBB03B]">
              Interactive Story
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {story.title}
            </h1>
            {story.subtitle ? (
              <p className="mt-2 text-base leading-7 text-gray-300">{story.subtitle}</p>
            ) : null}
            {sceneId === story.startSceneId && path.length <= 1 ? (
              <p className={`mx-auto mt-4 ${STORY_INTRO_TEXT_CLASS}`}>
                {story.introduction}
              </p>
            ) : null}
          </header>

          <section className="w-full min-w-0 rounded-3xl border border-white/10 bg-[#0B1220]/80 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">
              {sceneLabel(scene.id)}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-white sm:text-[28px]">{scene.title}</h2>
            <p className="mt-2 text-sm text-gray-400">
              {scene.time}
              {scene.time && scene.location ? " · " : ""}
              {scene.location}
            </p>

            <StorySceneImage
              src={scene.imageUrl}
              alt=""
              priority={scene.id === story.startSceneId || path.length <= 1}
            />

            {transition ? (
              <p className="mt-6 border-l-2 border-[#FBB03B]/60 pl-4 font-serif text-[17px] italic leading-8 text-amber-100/90 sm:text-[18px] sm:leading-9">
                {transition}
              </p>
            ) : null}

            <div className={`mt-6 space-y-5 ${STORY_BODY_TEXT_CLASS}`}>
              {paragraphs.map((paragraph, index) => (
                <p key={`${scene.id}-${index}`}>{paragraph}</p>
              ))}
            </div>

            {scene.isEnding ? (
              <div className="mt-8 rounded-2xl border border-[#FBB03B]/30 bg-[#FBB03B]/10 p-5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">
                  Ending reached
                </p>
                <p className="mt-2 font-serif text-xl text-white">The End</p>
                <p className={`mt-2 ${STORY_INTRO_TEXT_CLASS}`}>
                  This path is complete. Another decision earlier tonight can still change how the
                  story ends.
                </p>
                <button
                  type="button"
                  onClick={restart}
                  className="mt-5 mb-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-[17px] font-semibold text-white"
                >
                  Try Another Path
                </button>
                <StoryRewardPanel
                  story={story}
                  endingId={scene.id}
                  focus={focusReward}
                  welcome={welcomeBack}
                />
              </div>
            ) : (
              <>
                <StoryBeforeChoicesBanner />
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    What do I do next?
                  </p>
                  <div className="mt-4 space-y-3">
                    {scene.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => openScene(choice.destinationId)}
                        className={STORY_CHOICE_BUTTON_CLASS}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FBB03B]/15 text-sm font-bold text-[#FBB03B]">
                          {choice.id}
                        </span>
                        <span className={STORY_CHOICE_LABEL_CLASS}>{choice.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </article>
    </StoryReaderLayout>
    </div>
  );
}
