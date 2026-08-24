"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "@/app/firebase";
import Navbar from "@/app/components/Navbar";
import type { Banner, BannerFitMode, BannerPlacement } from "@/lib/types/featured";
import { getBannerPlacement } from "@/app/hooks/useBanners";
import BannerCropModal from "./BannerCropModal";
import BannerFitImage from "@/app/components/homepage/Banner/BannerFitImage";
import {
  BANNER_CROP_ASPECT,
  BANNER_CROP_FRAME_CLASS,
  BANNER_CROP_HINT,
} from "@/lib/bannerCrop";
import {
  isValidHttpImageUrl,
  preloadBannerImage,
  resolveBannerFitMode,
} from "@/lib/bannerFit";

const BANNER_TYPE_OPTIONS: { value: BannerPlacement; label: string }[] = [
  { value: "infeed", label: "List banner (in ads)" },
  { value: "profile", label: "Profile banner" },
];

const PLACEMENT_HINT: Record<Exclude<BannerPlacement, "sidebar">, string> = {
  infeed: "Horizontal 16:5 banner inside the Latest Ads list.",
  profile: "16:5 banner at the top of the profile page.",
};

function typeOptionsFor(banner: Banner) {
  if (getBannerPlacement(banner) !== "sidebar") return BANNER_TYPE_OPTIONS;
  return [
    { value: "sidebar" as BannerPlacement, label: "Sidebar banner (no longer used)" },
    ...BANNER_TYPE_OPTIONS,
  ];
}

const FIT_MODE_OPTIONS: { value: BannerFitMode; label: string; hint: string }[] = [
  {
    value: "auto",
    label: "Auto Fit (Recommended)",
    hint: "Shows the entire image. Empty space is filled with a blurred copy of the same photo.",
  },
  {
    value: "cover",
    label: "Crop to Fill",
    hint: "Fills the banner frame. Cropping is optional — use the crop editor if you want a specific cut.",
  },
];

const emptyForm = {
  title: "",
  imageUrl: "",
  country: "All",
  priority: "0",
  startDate: "",
  endDate: "",
  placement: "infeed" as BannerPlacement,
  fitMode: "auto" as BannerFitMode,
  linkType: "none" as Banner["linkType"],
  externalUrl: "",
  listingId: "",
};

function formatDate(value: unknown): string {
  if (!value) return "";
  const date =
    typeof (value as { toDate?: () => Date }).toDate === "function"
      ? (value as { toDate: () => Date }).toDate()
      : value instanceof Date
        ? value
        : new Date(value as string | number);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [adminReady, setAdminReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [urlStatus, setUrlStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = () => {
    setImageFile(null);
    setSourceFile(null);
    setCropOpen(false);
    setUrlStatus("idle");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!sourceFile) {
      setSourcePreview("");
      return;
    }
    const url = URL.createObjectURL(sourceFile);
    setSourcePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [sourceFile]);

  useEffect(() => {
    if (!imageFile) {
      setFilePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    const pastedUrl = form.imageUrl.trim();
    if (imageFile || !pastedUrl) {
      setUrlStatus("idle");
      if (!imageFile) setImageError("");
      return;
    }
    if (!isValidHttpImageUrl(pastedUrl)) {
      setUrlStatus("error");
      setImageError("Enter a valid image URL (http or https).");
      return;
    }
    setUrlStatus("loading");
    setImageError("");
    let cancelled = false;
    const timer = window.setTimeout(() => {
      preloadBannerImage(pastedUrl)
        .then(() => {
          if (cancelled) return;
          setUrlStatus("ok");
          setImageError("");
        })
        .catch(() => {
          if (cancelled) return;
          setUrlStatus("error");
          setImageError("Could not load this image URL. Check the link and try again.");
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.imageUrl, imageFile]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        router.push("/");
        return;
      }
      setAdminReady(true);
    });
    return unsubAuth;
  }, [router]);

  useEffect(() => {
    if (!adminReady) return;
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner)));
    });
    return unsub;
  }, [adminReady]);

  const createBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const pastedUrl = form.imageUrl.trim();
    if (!imageFile && !pastedUrl) {
      setImageError("Upload a banner image or paste an Image URL.");
      return;
    }
    if (!imageFile && pastedUrl) {
      if (!isValidHttpImageUrl(pastedUrl)) {
        setImageError("Enter a valid image URL (http or https).");
        return;
      }
      try {
        await preloadBannerImage(pastedUrl);
      } catch {
        setUrlStatus("error");
        setImageError("Could not load this image URL. Check the link and try again.");
        return;
      }
    }

    setSaving(true);
    try {
      let imageUrl = pastedUrl;
      if (imageFile) {
        const imageRef = ref(
          storage,
          `banners/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "banners"), {
        title: form.title,
        imageUrl,
        country: form.country || "All",
        priority: Number(form.priority),
        placement: form.placement,
        fitMode: resolveBannerFitMode(form.fitMode),
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        endDate: form.endDate
          ? new Date(form.endDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        linkType: form.linkType ?? "none",
        externalUrl: form.linkType === "external" ? form.externalUrl : null,
        listingId: form.linkType === "listing" ? form.listingId : null,
        active: true,
        views: 0,
        clicks: 0,
        createdAt: serverTimestamp(),
      });
      setForm(emptyForm);
      resetImageState();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save banner. Check the image and try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    await updateDoc(doc(db, "banners", banner.id), {
      active: !banner.active,
    });
  };

  const updatePlacement = async (banner: Banner, placement: BannerPlacement) => {
    await updateDoc(doc(db, "banners", banner.id), { placement });
  };

  const updateFitMode = async (banner: Banner, fitMode: BannerFitMode) => {
    await updateDoc(doc(db, "banners", banner.id), { fitMode });
  };

  const removeBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await deleteDoc(doc(db, "banners", id));
  };

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Banner Ads</h1>
          <button
            type="button"
            onClick={() => {
              setShowForm((v) => !v);
              resetImageState();
            }}
            className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white"
          >
            {showForm ? "Cancel" : "Create Banner"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={createBanner}
            className="mb-8 rounded-2xl border border-white/10 bg-[#111827] p-5 space-y-4"
          >
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Banner type
              </label>
              <select
                value={form.placement}
                onChange={(e) => {
                  const placement = e.target.value as BannerPlacement;
                  setForm({ ...form, placement });
                }}
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
              >
                {BANNER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                {form.placement === "sidebar"
                  ? BANNER_CROP_HINT.sidebar
                  : PLACEMENT_HINT[form.placement]}
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Image fit
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {FIT_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, fitMode: opt.value });
                      if (opt.value === "auto" && sourceFile) {
                        setImageFile(sourceFile);
                      }
                    }}
                    className={`rounded-xl border px-4 py-3 text-left ${
                      form.fitMode === opt.value
                        ? "border-blue-500 bg-blue-500/15 text-white"
                        : "border-white/10 bg-black/20 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="mt-1 block text-xs text-gray-400">
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Banner image
              </label>
              <p className="text-xs text-gray-500">
                Upload a file or paste a URL. Preview below matches the live banner.
                {form.fitMode === "cover"
                  ? " Cropping is optional for Crop to Fill."
                  : " Auto Fit shows the whole image — no crop needed."}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = "";
                  if (!file) return;
                  setSourceFile(file);
                  setImageFile(file);
                  setImageError("");
                }}
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
              />
              <input
                type="text"
                placeholder="Or paste Image URL"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
              />
              {urlStatus === "loading" && (
                <p className="text-xs text-gray-400">Loading image preview…</p>
              )}
              {imageError && (
                <p className="text-sm text-red-400">{imageError}</p>
              )}
              {(filePreview || urlStatus === "ok") && (
                <div className="space-y-2">
                  <div
                    className={`relative mt-2 overflow-hidden ${BANNER_CROP_FRAME_CLASS} ${
                      form.placement === "sidebar"
                        ? "mx-auto h-64"
                        : "w-full aspect-[16/7] lg:aspect-[16/5]"
                    }`}
                    style={
                      form.placement === "sidebar"
                        ? { aspectRatio: String(BANNER_CROP_ASPECT.sidebar) }
                        : undefined
                    }
                  >
                    <BannerFitImage
                      src={filePreview || form.imageUrl.trim()}
                      alt="Banner preview"
                      fitMode={form.fitMode}
                      eager
                    />
                  </div>
                  {sourceFile && form.fitMode === "cover" && (
                    <button
                      type="button"
                      onClick={() => setCropOpen(true)}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Crop image (optional)
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Country (All)"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="rounded-xl bg-black/30 px-4 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="rounded-xl bg-black/30 px-4 py-2 text-white"
              />
              <select
                value={form.linkType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    linkType: e.target.value as Banner["linkType"],
                  })
                }
                className="rounded-xl bg-black/30 px-4 py-2 text-white"
              >
                <option value="none">No link</option>
                <option value="external">External URL</option>
                <option value="listing">Listing</option>
                <option value="category">Category</option>
              </select>
            </div>
            {form.linkType === "external" && (
              <input
                placeholder="External URL"
                value={form.externalUrl}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
              />
            )}
            {form.linkType === "listing" && (
              <input
                placeholder="Listing ID"
                value={form.listingId}
                onChange={(e) => setForm({ ...form, listingId: e.target.value })}
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="rounded-xl bg-black/30 px-4 py-2 text-white"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="rounded-xl bg-black/30 px-4 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={
                saving ||
                cropOpen ||
                (!imageFile && (!form.imageUrl.trim() || urlStatus !== "ok"))
              }
              className="rounded-xl bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Banner"}
            </button>
          </form>
        )}

        {banners.length === 0 ? (
          <p className="text-gray-400">No banners yet.</p>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4"
              >
                <div
                  className="relative shrink-0 overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: String(
                      BANNER_CROP_ASPECT[getBannerPlacement(banner)]
                    ),
                    height: getBannerPlacement(banner) === "sidebar" ? 128 : 64,
                  }}
                >
                  <BannerFitImage
                    src={banner.imageUrl}
                    alt=""
                    fitMode={banner.fitMode}
                    sizes="220px"
                    eager
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">
                        {(banner as Banner & { title?: string }).title || "Banner"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {banner.country ?? "All"} · Priority {banner.priority ?? 0}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(banner.startDate)} – {formatDate(banner.endDate)}
                      </p>
                      <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-gray-400">Type</span>
                        <select
                          value={getBannerPlacement(banner)}
                          onChange={(e) =>
                            updatePlacement(
                              banner,
                              e.target.value as BannerPlacement
                            )
                          }
                          className="rounded-lg bg-black/30 px-2 py-1 text-white"
                        >
                          {typeOptionsFor(banner).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-gray-400">Fit</span>
                        <select
                          value={resolveBannerFitMode(banner.fitMode)}
                          onChange={(e) =>
                            updateFitMode(
                              banner,
                              e.target.value as BannerFitMode
                            )
                          }
                          className="rounded-lg bg-black/30 px-2 py-1 text-white"
                        >
                          <option value="auto">Auto Fit (Recommended)</option>
                          <option value="cover">Crop to Fill</option>
                        </select>
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={banner.active === true}
                        onChange={() => toggleActive(banner)}
                      />
                      Active
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBanner(banner.id)}
                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BannerCropModal
        open={cropOpen && Boolean(sourcePreview)}
        imageSrc={sourcePreview}
        placement={form.placement}
        fileName={sourceFile?.name ?? "banner.jpg"}
        onCancel={() => {
          setCropOpen(false);
          if (!imageFile) {
            setSourceFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }}
        onConfirm={(file) => {
          setImageFile(file);
          setCropOpen(false);
        }}
      />
    </main>
  );
}
