"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { VIBE_REPORT_REASONS, type VibeReportReason } from "@/lib/vibe/types";
import { reportVibeContent } from "@/lib/vibe/client";

const LABELS: Record<VibeReportReason, string> = {
  spam: "Spam or ads",
  harassment: "Harassment",
  hate: "Hate or abuse",
  sexual: "Sexual content",
  misinformation: "Misleading claims",
  other: "Something else",
};

export default function VibeReportModal({
  open,
  postId,
  targetType,
  targetId,
  onClose,
}: {
  open: boolean;
  postId: string;
  targetType: "post" | "comment";
  targetId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<VibeReportReason>("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const close = () => {
    setDone(false);
    setNote("");
    setError("");
    setReason("spam");
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await reportVibeContent({
        targetType,
        targetId,
        postId,
        reason,
        note,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send report.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4" onClick={close}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A] p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-white">
          <Flag className="h-4 w-4 text-[#FBB03B]" />
          <h2 className="font-semibold">Report {targetType}</h2>
        </div>
        {done ? (
          <p className="mt-3 text-sm text-gray-300">
            Thanks. Pippinway will review this when a moderator is available.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-2">
              {VIBE_REPORT_REASONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="radio"
                    name="vibe-report"
                    checked={reason === item}
                    onChange={() => setReason(item)}
                  />
                  {LABELS[item]}
                </label>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 280))}
              rows={3}
              placeholder="Optional details (no personal contact info)"
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white"
            />
            {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={close} className="rounded-full px-4 py-2 text-sm text-gray-300">
            Close
          </button>
          {!done ? (
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
            >
              {busy ? "Sending…" : "Submit"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
