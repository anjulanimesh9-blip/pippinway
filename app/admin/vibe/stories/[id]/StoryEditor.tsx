"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ListingPhoto from "@/app/components/ListingPhoto";
import {
  emptyStoryDraft,
  fetchAdminStory,
  removeStoryCover,
  saveInteractiveStory,
  uploadStoryCover,
  uploadStorySceneImage,
  validateInteractiveStory,
  type InteractiveStory,
  type StoryChoice,
  type StoryScene,
} from "@/lib/vibe/stories";

const INPUT =
  "w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white";
const LABEL = "mb-1.5 block text-sm font-semibold text-gray-300";

function nextSceneId(scenes: StoryScene[]) {
  const used = new Set(scenes.map((scene) => scene.id));
  for (let i = 1; i <= 99; i += 1) {
    const id = String(i).padStart(2, "0");
    if (!used.has(id)) return id;
  }
  return String(scenes.length + 1);
}

export default function StoryEditor({ storyId }: { storyId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [story, setStory] = useState<InteractiveStory>(emptyStoryDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const validation = useMemo(() => validateInteractiveStory(story), [story]);

  useEffect(() => {
    let cancelled = false;
    void fetchAdminStory(storyId)
      .then((next) => {
        if (cancelled) return;
        if (next) setStory(next);
        else setError("Story not found.");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this story.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const setField = <K extends keyof InteractiveStory>(key: K, value: InteractiveStory[K]) => {
    setStory((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  };

  const updateScene = (index: number, patch: Partial<StoryScene>) => {
    setStory((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene, i) => (i === index ? { ...scene, ...patch } : scene)),
    }));
  };

  const updateChoice = (sceneIndex: number, choiceIndex: number, patch: Partial<StoryChoice>) => {
    setStory((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene, i) => {
        if (i !== sceneIndex) return scene;
        return {
          ...scene,
          choices: scene.choices.map((choice, j) =>
            j === choiceIndex ? { ...choice, ...patch } : choice
          ),
        };
      }),
    }));
  };

  const save = async (published = story.published) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveInteractiveStory({ ...story, published });
      setStory(saved);
      setMessage(published ? "Story published." : "Draft saved.");
      if (!storyId || storyId === "new") {
        router.replace(`/admin/vibe/stories/${saved.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this story.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-sm text-gray-400 sm:p-6">Loading story…</p>;
  }

  return (
    <div className="p-4 sm:p-6">
      <Link href="/admin/vibe" className="text-sm text-[#FBB03B]">
        ← Vibe admin
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{story.title || "New interactive story"}</h1>
      <p className="mt-1 text-sm text-gray-400">
        Stories are stored separately from Vibe posts. Readers only see published stories.
      </p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-300">{message}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label>
          <span className={LABEL}>Title</span>
          <input className={INPUT} value={story.title} onChange={(e) => setField("title", e.target.value)} />
        </label>
        <label>
          <span className={LABEL}>Slug</span>
          <input className={INPUT} value={story.slug} onChange={(e) => setField("slug", e.target.value)} />
        </label>
        <label>
          <span className={LABEL}>Subtitle</span>
          <input
            className={INPUT}
            value={story.subtitle}
            onChange={(e) => setField("subtitle", e.target.value)}
          />
        </label>
        <label>
          <span className={LABEL}>Start scene</span>
          <select
            className={INPUT}
            value={story.startSceneId}
            onChange={(e) => setField("startSceneId", e.target.value)}
          >
            {story.scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.id} — {scene.title || "Untitled"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className={LABEL}>Introduction</span>
        <textarea
          rows={4}
          className={INPUT}
          value={story.introduction}
          onChange={(e) => setField("introduction", e.target.value)}
        />
      </label>

      <div className="mt-4">
        <span className={LABEL}>Cover image</span>
        {story.coverImageUrl ? (
          <ListingPhoto
            src={story.coverImageUrl}
            alt=""
            fill={false}
            width={900}
            height={420}
            sizes="(max-width: 768px) 100vw, 640px"
            className="mb-3 max-h-40 w-full rounded-xl object-cover"
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
            onClick={() => fileRef.current?.click()}
          >
            Upload cover
          </button>
          {story.coverImagePath ? (
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
              onClick={async () => {
                await removeStoryCover(story.coverImagePath);
                setField("coverImageUrl", "");
                setField("coverImagePath", "");
              }}
            >
              Remove cover
            </button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const uploaded = await uploadStoryCover(file);
              setStory((prev) => ({
                ...prev,
                coverImageUrl: uploaded.url,
                coverImagePath: uploaded.path,
              }));
            } catch {
              setError("Could not upload the cover image.");
            }
            event.target.value = "";
          }}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Scenes</h2>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
          onClick={() => {
            const id = nextSceneId(story.scenes);
            setStory((prev) => ({
              ...prev,
              scenes: [
                ...prev.scenes,
                {
                  id,
                  title: "",
                  time: "",
                  location: "",
                  text: "",
                  isEnding: false,
                  choices: [
                    { id: "A", label: "", destinationId: "" },
                    { id: "B", label: "", destinationId: "" },
                  ],
                },
              ],
            }));
          }}
        >
          Add scene
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {story.scenes.map((scene, sceneIndex) => (
          <article key={scene.id} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <label>
                <span className={LABEL}>ID</span>
                <input
                  className={INPUT}
                  value={scene.id}
                  onChange={(e) => updateScene(sceneIndex, { id: e.target.value })}
                />
              </label>
              <label className="sm:col-span-3">
                <span className={LABEL}>Title</span>
                <input
                  className={INPUT}
                  value={scene.title}
                  onChange={(e) => updateScene(sceneIndex, { title: e.target.value })}
                />
              </label>
              <label>
                <span className={LABEL}>Time</span>
                <input
                  className={INPUT}
                  value={scene.time}
                  onChange={(e) => updateScene(sceneIndex, { time: e.target.value })}
                />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL}>Location</span>
                <input
                  className={INPUT}
                  value={scene.location}
                  onChange={(e) => updateScene(sceneIndex, { location: e.target.value })}
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={scene.isEnding}
                  onChange={(e) =>
                    updateScene(sceneIndex, {
                      isEnding: e.target.checked,
                      choices: e.target.checked ? [] : scene.choices.length ? scene.choices : [
                        { id: "A", label: "", destinationId: "" },
                        { id: "B", label: "", destinationId: "" },
                      ],
                    })
                  }
                />
                Ending
              </label>
            </div>
            <div className="mt-3">
              <span className={LABEL}>Scene image</span>
              {scene.imageUrl ? (
                <ListingPhoto
                  src={scene.imageUrl}
                  alt=""
                  fill={false}
                  width={960}
                  height={540}
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="mb-3 aspect-video w-full rounded-xl object-cover"
                />
              ) : (
                <p className="mb-2 text-xs text-gray-500">No image yet. The scene still reads without one.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="rounded-full border border-white/10 px-3 py-1.5 text-xs">
                  {scene.imageUrl ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        if (scene.imagePath) await removeStoryCover(scene.imagePath);
                        const uploaded = await uploadStorySceneImage(file);
                        updateScene(sceneIndex, {
                          imageUrl: uploaded.url,
                          imagePath: uploaded.path,
                        });
                      } catch {
                        setError("Could not upload the scene image.");
                      }
                      event.target.value = "";
                    }}
                  />
                </label>
                {scene.imageUrl ? (
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
                    onClick={async () => {
                      if (scene.imagePath) await removeStoryCover(scene.imagePath);
                      updateScene(sceneIndex, { imageUrl: "", imagePath: "" });
                    }}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
            </div>
            <label className="mt-3 block">
              <span className={LABEL}>Narrative</span>
              <textarea
                rows={8}
                className={INPUT}
                value={scene.text}
                onChange={(e) => updateScene(sceneIndex, { text: e.target.value })}
              />
            </label>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Route-specific lead-in</p>
                <button
                  type="button"
                  className="text-xs text-[#FBB03B]"
                  onClick={() =>
                    updateScene(sceneIndex, {
                      arriveFrom: { ...(scene.arriveFrom || {}), "": "" },
                    })
                  }
                >
                  Add note
                </button>
              </div>
              {Object.entries(scene.arriveFrom || {}).map(([fromId, text], noteIndex) => (
                <div key={`${scene.id}-from-${noteIndex}`} className="grid gap-2 sm:grid-cols-[120px_1fr]">
                  <select
                    className={INPUT}
                    value={fromId}
                    onChange={(e) => {
                      const next = { ...(scene.arriveFrom || {}) };
                      delete next[fromId];
                      next[e.target.value] = text;
                      updateScene(sceneIndex, { arriveFrom: next });
                    }}
                  >
                    <option value="">From scene</option>
                    {story.scenes
                      .filter((option) => option.id !== scene.id)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.id}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      className={INPUT}
                      placeholder="Short lead-in if the reader arrives from that scene"
                      value={text}
                      onChange={(e) =>
                        updateScene(sceneIndex, {
                          arriveFrom: { ...(scene.arriveFrom || {}), [fromId]: e.target.value },
                        })
                      }
                    />
                    <button
                      type="button"
                      className="text-xs text-red-300"
                      onClick={() => {
                        const next = { ...(scene.arriveFrom || {}) };
                        delete next[fromId];
                        updateScene(sceneIndex, { arriveFrom: next });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!scene.isEnding ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Choices</p>
                  {scene.choices.length < 3 ? (
                    <button
                      type="button"
                      className="text-xs text-[#FBB03B]"
                      onClick={() =>
                        updateScene(sceneIndex, {
                          choices: [
                            ...scene.choices,
                            { id: String.fromCharCode(65 + scene.choices.length), label: "", destinationId: "" },
                          ],
                        })
                      }
                    >
                      Add choice
                    </button>
                  ) : null}
                </div>
                {scene.choices.map((choice, choiceIndex) => (
                  <div key={`${scene.id}-${choice.id}-${choiceIndex}`} className="grid gap-2 sm:grid-cols-[60px_1fr_120px]">
                    <input
                      className={INPUT}
                      value={choice.id}
                      onChange={(e) => updateChoice(sceneIndex, choiceIndex, { id: e.target.value })}
                    />
                    <input
                      className={INPUT}
                      placeholder="Choice label"
                      value={choice.label}
                      onChange={(e) => updateChoice(sceneIndex, choiceIndex, { label: e.target.value })}
                    />
                    <select
                      className={INPUT}
                      value={choice.destinationId}
                      onChange={(e) =>
                        updateChoice(sceneIndex, choiceIndex, { destinationId: e.target.value })
                      }
                    >
                      <option value="">Scene</option>
                      {story.scenes.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.id}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className="mt-4 text-xs text-red-300"
              onClick={() =>
                setStory((prev) => ({
                  ...prev,
                  scenes: prev.scenes.filter((_, i) => i !== sceneIndex),
                }))
              }
            >
              Remove scene
            </button>
          </article>
        ))}
      </div>

      {!validation.ok ? (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Needs attention before publishing</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.errors.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-green-300">Branching looks valid. Both structure and destinations check out.</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(false)}
          className="rounded-full border border-white/10 px-4 py-2 text-sm"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving || !validation.ok}
          onClick={() => void save(true)}
          className="rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220] disabled:opacity-50"
        >
          Publish
        </button>
        {story.published ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(false)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm"
          >
            Unpublish
          </button>
        ) : null}
      </div>
    </div>
  );
}
