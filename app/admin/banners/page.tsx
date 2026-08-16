"use client";

import { useEffect, useState } from "react";
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
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import Navbar from "@/app/components/Navbar";
import type { Banner } from "@/lib/types/featured";

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
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    country: "All",
    priority: "0",
    startDate: "",
    endDate: "",
    linkType: "none" as Banner["linkType"],
    externalUrl: "",
    listingId: "",
  });

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
    await addDoc(collection(db, "banners"), {
      title: form.title,
      imageUrl: form.imageUrl,
      country: form.country || "All",
      priority: Number(form.priority),
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
    setForm({
      title: "",
      imageUrl: "",
      country: "All",
      priority: "0",
      startDate: "",
      endDate: "",
      linkType: "none",
      externalUrl: "",
      listingId: "",
    });
    setShowForm(false);
  };

  const toggleActive = async (banner: Banner) => {
    await updateDoc(doc(db, "banners", banner.id), {
      active: !banner.active,
    });
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
            onClick={() => setShowForm((v) => !v)}
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
            <input
              required
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full rounded-xl bg-black/30 px-4 py-2 text-white"
            />
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
              className="rounded-xl bg-green-600 px-5 py-2 font-bold text-white"
            >
              Save Banner
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
                  className="h-24 w-40 rounded-xl object-cover"
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
    </main>
  );
}
