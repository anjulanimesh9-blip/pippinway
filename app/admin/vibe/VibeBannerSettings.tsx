"use client";

import { useEffect, useRef, useState } from "react";
import ListingPhoto from "@/app/components/ListingPhoto";
import {
  DEFAULT_VIBE_BANNER,
  getVibeBannerSettings,
  removeVibeBannerImage,
  saveVibeBannerSettings,
  uploadVibeBannerImage,
  type VibeBannerPosition,
  type VibeBannerSettings,
} from "@/lib/vibe/banner";

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-300";

export default function VibeBannerSettings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const publishedPathRef = useRef("");
  const [form, setForm] = useState<VibeBannerSettings>(DEFAULT_VIBE_BANNER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void getVibeBannerSettings(true)
      .then((data) => {
        if (!cancelled) {
          setForm(data);
          publishedPathRef.current = data.imagePath;
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load banner settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof VibeBannerSettings>(key: K, value: VibeBannerSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadVibeBannerImage(file);
      setForm((prev) => ({
        ...prev,
        imageUrl: uploaded.url,
        imagePath: uploaded.path,
      }));
      setMessage("Image uploaded. Save to publish it on Vibe.");
    } catch {
      setError("Could not upload the banner image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    setMessage("Image removed. Save to update the live banner.");
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveVibeBannerSettings(form);
      if (publishedPathRef.current && publishedPathRef.current !== saved.imagePath) {
        await removeVibeBannerImage(publishedPathRef.current);
      }
      publishedPathRef.current = saved.imagePath;
      setForm(saved);
      setMessage("Vibe banner saved.");
    } catch {
      setError("Could not save banner settings. Confirm you are signed in as admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 sm:p-5">
      <h2 className="text-lg font-semibold">Vibe Banner Settings</h2>
      <p className="mt-1 text-sm text-gray-400">
        Edit the Pippinway Vibe hero on the community pages. Public visitors only see these fields.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Loading banner…</p>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void onSave();
            }}
          >
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setField("enabled", event.target.checked)}
              />
              Banner active
            </label>
            <div>
              <label className={LABEL_CLASS} htmlFor="vibe-banner-eyebrow">
                Small label
              </label>
              <input
                id="vibe-banner-eyebrow"
                value={form.eyebrow}
                maxLength={40}
                onChange={(event) => setField("eyebrow", event.target.value)}
                className={INPUT_CLASS}
                placeholder="COMMUNITY"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vibe-banner-title">
                Main title
              </label>
              <input
                id="vibe-banner-title"
                value={form.title}
                maxLength={80}
                onChange={(event) => setField("title", event.target.value)}
                className={INPUT_CLASS}
                placeholder="Pippinway Vibe ✨"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vibe-banner-subtitle">
                Subtitle
              </label>
              <input
                id="vibe-banner-subtitle"
                value={form.subtitle}
                maxLength={120}
                onChange={(event) => setField("subtitle", event.target.value)}
                className={INPUT_CLASS}
                placeholder="Good Vibes. Brighter Days."
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vibe-banner-supporting">
                Supporting text
              </label>
              <input
                id="vibe-banner-supporting"
                value={form.supportingText}
                maxLength={160}
                onChange={(event) => setField("supportingText", event.target.value)}
                className={INPUT_CLASS}
                placeholder="Share • Read • Connect • Discover"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="vibe-banner-cta-label">
                  Optional CTA label
                </label>
                <input
                  id="vibe-banner-cta-label"
                  value={form.ctaLabel}
                  maxLength={40}
                  onChange={(event) => setField("ctaLabel", event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Open the feed"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vibe-banner-cta-href">
                  Optional CTA link
                </label>
                <input
                  id="vibe-banner-cta-href"
                  value={form.ctaHref}
                  maxLength={300}
                  onChange={(event) => setField("ctaHref", event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="/vibe"
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vibe-banner-position">
                Image position
              </label>
              <select
                id="vibe-banner-position"
                value={form.imagePosition}
                onChange={(event) =>
                  setField("imagePosition", event.target.value as VibeBannerPosition)
                }
                className={INPUT_CLASS}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => void onUpload(event.target.files?.[0])}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs"
              >
                {uploading ? "Uploading…" : form.imageUrl ? "Change image" : "Upload image"}
              </button>
              {form.imageUrl ? (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
                >
                  Remove image
                </button>
              ) : null}
              <button
                type="submit"
                disabled={saving || uploading}
                className="rounded-full bg-[#FBB03B] px-4 py-1.5 text-xs font-semibold text-[#0B1220] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save banner"}
              </button>
            </div>
            {message ? <p className="text-sm text-green-300">{message}</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>
          <div>
            <p className={LABEL_CLASS}>Current banner preview</p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#0f172a] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">
                {form.eyebrow || DEFAULT_VIBE_BANNER.eyebrow}
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {form.title || DEFAULT_VIBE_BANNER.title}
              </p>
              <p className="mt-1 text-xs text-gray-100">
                {form.subtitle || DEFAULT_VIBE_BANNER.subtitle}
              </p>
              <p className="mt-1 text-[11px] text-gray-300">
                {form.supportingText || DEFAULT_VIBE_BANNER.supportingText}
              </p>
              {form.imageUrl ? (
                <div className="mt-3">
                  <ListingPhoto
                    src={form.imageUrl}
                    alt="Vibe banner preview"
                    fill={false}
                    width={640}
                    height={400}
                    sizes="280px"
                    className="mx-auto h-auto max-h-40 w-full object-contain"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-gray-500">
                  No image — the gradient background will show.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
