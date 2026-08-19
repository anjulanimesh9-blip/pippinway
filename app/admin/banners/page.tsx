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
import type { Banner, BannerPlacement } from "@/lib/types/featured";
import { getBannerPlacement } from "@/app/hooks/useBanners";
import BannerCropModal from "./BannerCropModal";
import {
  BANNER_CROP_ASPECT,
  BANNER_CROP_FRAME_CLASS,
  BANNER_CROP_HINT,
} from "@/lib/bannerCrop";

const BANNER_TYPE_OPTIONS: { value: BannerPlacement; label: string }[] = [
  { value: "infeed", label: "List banner (in ads)" },
  { value: "sidebar", label: "Sidebar banner (vertical)" },
  { value: "profile", label: "Profile banner" },
];

const PLACEMENT_HINT: Record<BannerPlacement, string> = {
  infeed: "Horizontal 16:5 banner inside the Latest Ads list.",
  sidebar: "Tall 9:16 skyscraper on the homepage right sidebar.",
  profile: "16:5 banner at the top of the profile page.",
};

const emptyForm = {
  title: "",
  imageUrl: "",
  country: "All",
  priority: "0",
  startDate: "",
  endDate: "",
  placement: "infeed" as BannerPlacement,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = () => {
    setImageFile(null);
    setSourceFile(null);
    setCropOpen(false);
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
    if (sourceFile && !imageFile) {
      alert("Confirm the crop for your uploaded image, or paste an Image URL.");
      return;
    }
    if (!imageFile && !pastedUrl) {
      alert("Upload a banner image or paste an Image URL.");
      return;
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
                  if (sourceFile) setCropOpen(true);
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
                {PLACEMENT_HINT[form.placement]} {BANNER_CROP_HINT[form.placement]}
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Banner image
              </label>
              <p className="text-xs text-gray-500">
                Uploaded photos open a crop editor: list and profile are 1600×500
                (16:5); sidebar is 720×1280 (9:16). 1.00× zoom fills the frame.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = "";
                  if (!file) return;
                  setImageFile(null);
                  setSourceFile(file);
                  setCropOpen(true);
                }}
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
              />
              <input
                type="text"
                placeholder="Or paste Image URL (skips crop)"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
                className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
              />
              {(filePreview || form.imageUrl.trim()) && (
                <div className="space-y-2">
                  <div
                    className={`mt-2 overflow-hidden ${BANNER_CROP_FRAME_CLASS} ${
                      form.placement === "sidebar" ? "mx-auto h-64" : "w-full"
                    }`}
                    style={{ aspectRatio: String(BANNER_CROP_ASPECT[form.placement]) }}
                  >
                    <img
                      src={filePreview || form.imageUrl.trim()}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {sourceFile && (
                    <button
                      type="button"
                      onClick={() => setCropOpen(true)}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Adjust crop
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
              disabled={saving || cropOpen}
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
                <img
                  src={banner.imageUrl}
                  alt=""
                  className="shrink-0 rounded-xl object-cover"
                  style={{
                    aspectRatio: String(
                      BANNER_CROP_ASPECT[getBannerPlacement(banner)]
                    ),
                    height: getBannerPlacement(banner) === "sidebar" ? 128 : 64,
                  }}
                />
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
                          {BANNER_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
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
