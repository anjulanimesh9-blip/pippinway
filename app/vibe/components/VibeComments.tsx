"use client";

import { useEffect, useState } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useGuestAuthPrompt } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";
import { trackVibe } from "@/lib/analytics";
import {
  addVibeComment,
  fetchComments,
  removeOwnComment,
} from "@/lib/vibe/client";
import { VIBE_COMMENT_MAX } from "@/lib/vibe/constants";
import { vibeTimeAgo } from "@/lib/vibe/time";
import type { VibeComment } from "@/lib/vibe/types";
import VibeReportModal from "./VibeReportModal";

function Avatar({ src, name }: { src: string; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-8 w-8 rounded-full object-cover" />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-800 text-xs font-semibold">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function VibeComments({
  postId,
  isAdmin = false,
}: {
  postId: string;
  isAdmin?: boolean;
}) {
  const { user } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const [comments, setComments] = useState<VibeComment[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await fetchComments(postId);
        if (cancelled) return;
        setComments(page.comments);
        setCursor(page.cursor);
        setError("");
      } catch {
        if (!cancelled) setError("Comments could not load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const submit = async () => {
    if (!user) {
      requireAuth(`/vibe/post/${postId}`);
      return;
    }
    setBusy(true);
    try {
      const created = await addVibeComment(postId, text);
      trackVibe("vibe_comment", { post_id: postId });
      setComments((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not comment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-white/10 px-3 py-3 sm:px-4">
      {loading ? (
        <p className="text-xs text-gray-500">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500">Be the first to comment.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-2">
              <Avatar src={comment.authorPhoto} name={comment.authorName} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-white">{comment.authorName}</span>{" "}
                  <span className="text-[11px] text-gray-500">{vibeTimeAgo(comment.createdAt)}</span>
                </p>
                <p className="text-sm text-gray-200">{comment.text}</p>
                <div className="mt-1 flex gap-3 text-[11px] text-gray-500">
                  <button type="button" onClick={() => setReportId(comment.id)}>
                    Report
                  </button>
                  {(user?.uid === comment.authorId || isAdmin) && (
                    <button
                      type="button"
                      onClick={async () => {
                        await removeOwnComment(postId, comment, isAdmin);
                        setComments((prev) => prev.filter((item) => item.id !== comment.id));
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {cursor ? (
        <button type="button" className="mt-3 text-xs text-[#FBB03B]" onClick={() => {
          void (async () => {
            try {
              const page = await fetchComments(postId, cursor);
              setComments((prev) => [...prev, ...page.comments]);
              setCursor(page.cursor);
            } catch {
              setError("Comments could not load.");
            }
          })();
        }}>
          More comments
        </button>
      ) : null}
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, VIBE_COMMENT_MAX))}
          placeholder="Write a comment…"
          className="flex-1 rounded-full border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white"
        />
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={submit}
          className="rounded-full bg-[#FBB03B] px-3 py-2 text-sm font-semibold text-[#0B1220] disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      <p className="mt-2 text-[10px] text-gray-600">
        Replies can be added later; each comment already stores an optional parent.
      </p>
      <VibeReportModal
        open={Boolean(reportId)}
        postId={postId}
        targetType="comment"
        targetId={reportId || ""}
        onClose={() => setReportId(null)}
      />
    </div>
  );
}
