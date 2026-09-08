"use client";

import { useRef, useState } from "react";
import { Heart, ImagePlus, Send, Sparkles } from "lucide-react";
import { useGuestAuthPrompt } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";
import { trackVibe } from "@/lib/analytics";
import { VIBE_POST_CATEGORIES } from "@/lib/vibe/categories";
import { createVibePost } from "@/lib/vibe/client";
import { VIBE_TEXT_MAX } from "@/lib/vibe/constants";
import { isAllowedVibeImage } from "@/lib/vibe/validation";
import { ZODIAC_SIGNS } from "@/lib/vibe/zodiac";
import type { VibePostCategory } from "@/lib/vibe/types";

export default function VibeComposer({
  defaultCategory = "lifestyle",
  defaultZodiacSign = "",
  onCreated,
}: {
  defaultCategory?: VibePostCategory;
  defaultZodiacSign?: string;
  onCreated?: (id: string) => void;
}) {
  const { user, loading } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<VibePostCategory>(defaultCategory);
  const [zodiacSign, setZodiacSign] = useState(defaultZodiacSign);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pollNote, setPollNote] = useState(false);

  const needAuth = () => {
    if (loading) return true;
    if (user) return false;
    requireAuth("/vibe");
    return true;
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (needAuth()) return;
    if (!isAllowedVibeImage(file)) {
      setError("Choose a JPG, PNG, WEBP or GIF under 8MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const publish = async () => {
    if (needAuth()) return;
    setBusy(true);
    setError("");
    try {
      const id = await createVibePost({
        text,
        category,
        zodiacSign: category === "your-stars" ? zodiacSign : undefined,
        imageFile: image,
      });
      trackVibe("vibe_post_create", {
        post_id: id,
        vibe_category: category,
        content_type: image ? "image" : "text",
      });
      setText("");
      setImage(null);
      setPreview("");
      setZodiacSign("");
      onCreated?.(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-3 sm:p-4">
      <label className="sr-only" htmlFor="vibe-composer">
        What is on your mind?
      </label>
      <textarea
        id="vibe-composer"
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, VIBE_TEXT_MAX))}
        onFocus={() => {
          if (!user && !loading) requireAuth("/vibe");
        }}
        rows={3}
        placeholder="What's on your mind? Share a thought, photo or a positive message..."
        className="w-full resize-none rounded-xl border border-white/10 bg-[#020817] px-3 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#FBB03B]/50 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as VibePostCategory)}
          className="rounded-full border border-white/10 bg-[#020817] px-3 py-2 text-xs text-gray-200"
        >
          {VIBE_POST_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
        {category === "your-stars" ? (
          <select
            value={zodiacSign}
            onChange={(event) => setZodiacSign(event.target.value)}
            className="rounded-full border border-white/10 bg-[#020817] px-3 py-2 text-xs text-gray-200"
          >
            <option value="">Sign (optional)</option>
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign.id} value={sign.id}>
                {sign.emoji} {sign.name}
              </option>
            ))}
          </select>
        ) : null}
        <span className="ml-auto text-[11px] text-gray-500">
          {text.length}/{VIBE_TEXT_MAX}
        </span>
      </div>
      {preview ? (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setPreview("");
            }}
            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs"
          >
            Remove
          </button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => {
            if (needAuth()) return;
            fileRef.current?.click();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-gray-200"
        >
          <ImagePlus className="h-4 w-4" />
          Photo
        </button>
        <button
          type="button"
          onClick={() => setPollNote(true)}
          className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-400"
        >
          Poll
        </button>
        <button
          type="button"
          onClick={() => {
            if (needAuth()) return;
            setCategory("your-stars");
            if (!zodiacSign && defaultZodiacSign) setZodiacSign(defaultZodiacSign);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-gray-200"
        >
          <Sparkles className="h-4 w-4 text-[#FBB03B]" />
          Your Stars
        </button>
        <button
          type="button"
          onClick={() => {
            if (needAuth()) return;
            setCategory("love-relationships");
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-gray-200"
        >
          <Heart className="h-4 w-4 text-pink-400" />
          Feeling
        </button>
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={publish}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
      {pollNote ? (
        <p className="mt-2 text-xs text-gray-400">
          Polls are next. The composer is already set up for extra post types.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}
