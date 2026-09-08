"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminSetCommentStatus,
  adminSetPostStatus,
  fetchAdminReports,
  fetchAdminVibePosts,
} from "@/lib/vibe/client";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import type { VibePost } from "@/lib/vibe/types";

type ReportRow = {
  id: string;
  targetType?: string;
  targetId?: string;
  postId?: string;
  reason?: string;
  note?: string;
  reporterId?: string;
};

export default function AdminVibePage() {
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const [nextPosts, nextReports] = await Promise.all([
        fetchAdminVibePosts(),
        fetchAdminReports(),
      ]);
      setPosts(nextPosts);
      setReports(nextReports as ReportRow[]);
    } catch {
      setMessage("Could not load Vibe moderation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [nextPosts, nextReports] = await Promise.all([
          fetchAdminVibePosts(),
          fetchAdminReports(),
        ]);
        if (cancelled) return;
        setPosts(nextPosts);
        setReports(nextReports as ReportRow[]);
      } catch {
        if (!cancelled) setMessage("Could not load Vibe moderation data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Vibe moderation</h1>
      <p className="mt-1 text-sm text-gray-400">
        Hide or remove community posts and comments. Reports are listed below.
      </p>
      {message ? <p className="mt-3 text-sm text-red-300">{message}</p> : null}

      <h2 className="mt-8 text-lg font-semibold">Reports</h2>
      {loading ? (
        <p className="mt-3 text-sm text-gray-400">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No reports yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2">Open</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-white/10">
                  <td className="px-3 py-2">{report.targetType}</td>
                  <td className="px-3 py-2">{report.reason}</td>
                  <td className="px-3 py-2 text-gray-400">{report.note || "—"}</td>
                  <td className="px-3 py-2">
                    {report.postId ? (
                      <Link className="text-[#FBB03B]" href={VIBE_PATHS.post(report.postId)}>
                        Post
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold">Posts</h2>
      <div className="mt-3 space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {post.status} · {post.category} · {post.authorName}
                </p>
                <p className="mt-1 text-sm">{post.text}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1 text-xs"
                  onClick={async () => {
                    await adminSetPostStatus(post.id, "hidden");
                    void reload();
                  }}
                >
                  Hide
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-300"
                  onClick={async () => {
                    await adminSetPostStatus(post.id, "removed");
                    void reload();
                  }}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="rounded-full border border-green-500/30 px-3 py-1 text-xs text-green-300"
                  onClick={async () => {
                    await adminSetPostStatus(post.id, "visible");
                    void reload();
                  }}
                >
                  Restore
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Comments: hide from the post page with Remove on the comment, or paste a comment id:
            </p>
            <form
              className="mt-2 flex gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const commentId = String(form.get("commentId") || "").trim();
                if (!commentId) return;
                await adminSetCommentStatus(post.id, commentId, "removed");
                event.currentTarget.reset();
              }}
            >
              <input
                name="commentId"
                placeholder="Comment id"
                className="flex-1 rounded-lg border border-white/10 bg-[#020817] px-2 py-1 text-xs"
              />
              <button type="submit" className="rounded-lg border border-white/10 px-2 py-1 text-xs">
                Hide comment
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
