"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import Navbar from "@/app/components/Navbar";
import type { FeaturedPackage } from "@/lib/types/featured";

export default function AdminFeaturedPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [adminReady, setAdminReady] = useState(false);
  const [form, setForm] = useState({
    name: "",
    credits: "5",
    price: "0",
    currency: "USD",
    durationDays: "7",
    displayOrder: "0",
    description: "",
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
    const unsub = onSnapshot(collection(db, "featured_packages"), (snapshot) => {
      setPackages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeaturedPackage)));
    });
    return unsub;
  }, [adminReady]);

  const createPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "featured_packages"), {
      name: form.name,
      credits: Number(form.credits),
      price: Number(form.price),
      currency: form.currency,
      durationDays: Number(form.durationDays),
      displayOrder: Number(form.displayOrder),
      description: form.description,
      active: true,
      createdAt: serverTimestamp(),
    });
    setForm({
      name: "",
      credits: "5",
      price: "0",
      currency: "USD",
      durationDays: "7",
      displayOrder: "0",
      description: "",
    });
  };

  const toggleActive = async (pkg: FeaturedPackage) => {
    await updateDoc(doc(db, "featured_packages", pkg.id), {
      active: !pkg.active,
    });
  };

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Featured Package Settings</h1>

        <form onSubmit={createPackage} className="rounded-2xl border border-white/10 bg-[#111827] p-5 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Package name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white md:col-span-2"
            required
          />
          <input
            placeholder="Credits"
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white"
          />
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white"
          />
          <input
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white"
          />
          <input
            placeholder="Duration days"
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white"
          />
          <input
            placeholder="Display order"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl bg-[#0b1220] border border-white/10 px-4 py-3 text-white md:col-span-2"
          />
          <button type="submit" className="md:col-span-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white">
            Add Package
          </button>
        </form>

        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-white/10 bg-[#111827] p-4 flex justify-between gap-4">
              <div>
                <p className="text-white font-bold">{pkg.name ?? pkg.country ?? pkg.id}</p>
                <p className="text-sm text-gray-400">
                  {pkg.credits} credits · {pkg.durationDays ?? pkg.validityDays} days · {pkg.currency} {pkg.price}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(pkg)}
                className={`rounded-lg px-4 py-2 font-bold ${pkg.active ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}
              >
                {pkg.active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
