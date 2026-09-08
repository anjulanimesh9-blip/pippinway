"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { shareVibePost } from "@/lib/vibe/share";

export default function VibeShareMenu({
  postId,
  text,
  category,
}: {
  postId: string;
  text: string;
  category?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const native = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const run = async (method: "native" | "whatsapp" | "facebook" | "copy") => {
    try {
      const result = await shareVibePost({ id: postId, text, category, method });
      if (result === "copied") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
      setOpen(false);
    } catch {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs text-gray-300 hover:bg-white/5 sm:text-sm"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      {open ? (
        <div className="absolute bottom-11 right-0 z-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#020817] shadow-xl">
          {native ? (
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => run("native")}>
              <Share2 className="h-4 w-4" /> Device share
            </button>
          ) : null}
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => run("whatsapp")}>
            <span>🟢</span> WhatsApp
          </button>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => run("facebook")}>
            <span>📘</span> Facebook
          </button>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => run("copy")}>
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            Copy link
          </button>
        </div>
      ) : null}
    </div>
  );
}
