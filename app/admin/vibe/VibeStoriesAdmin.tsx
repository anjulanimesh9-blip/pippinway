"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteInteractiveStory,
  fetchAdminStories,
  saveInteractiveStory,
  THE_LAST_WITNESS,
  type InteractiveStory,
} from "@/lib/vibe/stories";

export default function VibeStoriesAdmin() {
  const [stories, setStories] = useState<InteractiveStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      setStories(await fetchAdminStories());
    } catch {
      setMessage("Could not load interactive stories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Interactive Stories</h2>
          <p className="mt-1 text-sm text-gray-400">
            Create branching stories separately from ordinary Vibe posts. Publish when every scene
            and choice is valid.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
            onClick={async () => {
              try {
                await saveInteractiveStory(THE_LAST_WITNESS);
                setMessage("The Last Witness is saved and ready to edit.");
                await reload();
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Could not import the story.");
              }
            }}
          >
            Import The Last Witness
          </button>
          <Link
            href="/admin/vibe/stories/new"
            className="rounded-full bg-[#FBB03B] px-3 py-1.5 text-xs font-semibold text-[#0B1220]"
          >
            New story
          </Link>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-gray-300">{message}</p> : null}
      {loading ? (
        <p className="mt-3 text-sm text-gray-400">Loading stories…</p>
      ) : (
        <div className="mt-4 space-y-3">
          {stories.map((story) => (
            <article
              key={story.id || story.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0F172A] p-4"
            >
              <div>
                <p className="font-semibold">{story.title || "Untitled story"}</p>
                <p className="text-xs text-gray-500">
                  {story.published ? "Published" : "Draft"} · {story.scenes.length} scenes · /
                  {story.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/vibe/stories/${encodeURIComponent(story.id || story.slug)}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs"
                >
                  Edit
                </Link>
                {story.id && story.id !== THE_LAST_WITNESS.id ? (
                  <button
                    type="button"
                    className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-300"
                    onClick={async () => {
                      if (!window.confirm("Delete this story?")) return;
                      await deleteInteractiveStory(story.id);
                      await reload();
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
