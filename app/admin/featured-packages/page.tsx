"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { FEATURED_COUNTRIES, isFeaturedCountry } from "@/lib/featuredCountries";
import { currencyCodeForCountry } from "@/lib/formatPrice";
import { toMillis } from "@/lib/featuredPackageUtils";
import type { FeaturedPackage } from "@/lib/types/featured";

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-300";

function currencyForCountry(country: string): string {
  return currencyCodeForCountry(country) ?? (country === "Sri Lanka" ? "LKR" : "USD");
}

type NamedForm = {
  name: string;
  description: string;
  country: string;
  price: string;
  currency: string;
  credits: string;
  durationDays: string;
  displayOrder: string;
  active: boolean;
};

function emptyNamedForm(displayOrder: number): NamedForm {
  const country = FEATURED_COUNTRIES[0];
  return {
    name: "",
    description: "",
    country,
    price: "",
    currency: currencyForCountry(country),
    credits: "5",
    durationDays: "7",
    displayOrder: String(displayOrder),
    active: true,
  };
}

export default function AdminFeaturedPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [adminReady, setAdminReady] = useState(false);

  const [country, setCountry] = useState<string>(FEATURED_COUNTRIES[0]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  const [legacySaving, setLegacySaving] = useState(false);
  const [legacyMessage, setLegacyMessage] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(currencyForCountry(FEATURED_COUNTRIES[0]));
  const [credits, setCredits] = useState("5");
  const [validityDays, setValidityDays] = useState("7");
  const [active, setActive] = useState(true);

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namedForm, setNamedForm] = useState<NamedForm>(emptyNamedForm(0));
  const [pkgSaving, setPkgSaving] = useState(false);
  const [pkgMessage, setPkgMessage] = useState<string | null>(null);

  const namedPackages = useMemo(
    () =>
      packages
        .filter((p) => !!p.name)
        .sort((a, b) => {
          const orderA = a.displayOrder ?? Infinity;
          const orderB = b.displayOrder ?? Infinity;
          if (orderA !== orderB) return orderA - orderB;
          return toMillis(a.createdAt) - toMillis(b.createdAt);
        }),
    [packages]
  );

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

  useEffect(() => {
    if (!adminReady) return;
    let cancelled = false;

    const load = async () => {
      setLegacyLoading(true);
      setLegacyError(null);
      try {
        const snap = await getDoc(doc(db, "featured_packages", country));
        if (cancelled) return;
        const data = snap.exists() ? snap.data() : {};
        setPrice(data.price != null ? String(data.price) : "");
        setCurrency(
          typeof data.currency === "string" && data.currency
            ? data.currency
            : currencyForCountry(country)
        );
        setCredits(data.credits != null ? String(data.credits) : "5");
        setValidityDays(data.validityDays != null ? String(data.validityDays) : "7");
        setActive(data.active !== false);
      } catch (err) {
        console.error("Failed to load featured package:", err);
        if (!cancelled) setLegacyError("Couldn't load country pricing. Please try again.");
      } finally {
        if (!cancelled) setLegacyLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [adminReady, country]);

  const saveLegacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setLegacyMessage("Enter a valid price.");
      return;
    }
    if (!currency.trim()) {
      setLegacyMessage("Enter a currency code (e.g. LKR, USD).");
      return;
    }
    if (!credits || isNaN(Number(credits)) || Number(credits) <= 0) {
      setLegacyMessage("Enter a valid number of credits.");
      return;
    }
    if (!validityDays || isNaN(Number(validityDays)) || Number(validityDays) <= 0) {
      setLegacyMessage("Enter a valid number of validity days.");
      return;
    }

    setLegacySaving(true);
    setLegacyMessage(null);
    try {
      await setDoc(doc(db, "featured_packages", country), {
        country,
        price: Number(price),
        currency: currency.trim(),
        credits: Number(credits),
        validityDays: Number(validityDays),
        active,
      });
      setLegacyMessage(`Featured package updated for ${country}.`);
    } catch (err) {
      console.error("Failed to save featured package:", err);
      setLegacyMessage("Couldn't save the featured package.");
    } finally {
      setLegacySaving(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setNamedForm(emptyNamedForm(namedPackages.length));
    setPkgMessage(null);
    setFormVisible(true);
  };

  const openEditForm = (pkg: FeaturedPackage) => {
    const pkgCountry = isFeaturedCountry(pkg.country ?? "")
      ? pkg.country ?? FEATURED_COUNTRIES[0]
      : FEATURED_COUNTRIES[0];
    setEditingId(pkg.id);
    setNamedForm({
      name: pkg.name ?? "",
      description: pkg.description ?? "",
      country: pkgCountry,
      price: String(pkg.price ?? ""),
      currency: pkg.currency || currencyForCountry(pkgCountry),
      credits: String(pkg.credits ?? ""),
      durationDays: String(pkg.durationDays ?? ""),
      displayOrder: String(pkg.displayOrder ?? 0),
      active: pkg.active !== false,
    });
    setPkgMessage(null);
    setFormVisible(true);
  };

  const saveNamedPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namedForm.name.trim()) {
      setPkgMessage("Enter a package name.");
      return;
    }
    if (!namedForm.price || isNaN(Number(namedForm.price)) || Number(namedForm.price) <= 0) {
      setPkgMessage("Enter a valid price.");
      return;
    }
    if (!namedForm.currency.trim()) {
      setPkgMessage("Enter a currency code.");
      return;
    }
    if (!namedForm.credits || isNaN(Number(namedForm.credits)) || Number(namedForm.credits) <= 0) {
      setPkgMessage("Enter a valid number of credits.");
      return;
    }
    if (
      !namedForm.durationDays ||
      isNaN(Number(namedForm.durationDays)) ||
      Number(namedForm.durationDays) <= 0
    ) {
      setPkgMessage("Enter a valid duration in days.");
      return;
    }

    setPkgSaving(true);
    setPkgMessage(null);
    try {
      const payload = {
        name: namedForm.name.trim(),
        description: namedForm.description.trim(),
        country: namedForm.country,
        price: Number(namedForm.price),
        currency: namedForm.currency.trim(),
        credits: Number(namedForm.credits),
        durationDays: Number(namedForm.durationDays),
        displayOrder: Number(namedForm.displayOrder) || 0,
        active: namedForm.active,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "featured_packages", editingId), payload);
      } else {
        await addDoc(collection(db, "featured_packages"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setFormVisible(false);
      setPkgMessage("Package saved successfully.");
    } catch (err) {
      console.error("Failed to save package:", err);
      setPkgMessage("Couldn't save the package.");
    } finally {
      setPkgSaving(false);
    }
  };

  const toggleActive = async (pkg: FeaturedPackage) => {
    await updateDoc(doc(db, "featured_packages", pkg.id), {
      active: !pkg.active,
      updatedAt: serverTimestamp(),
    });
  };

  const deletePackage = async (pkg: FeaturedPackage) => {
    if (!confirm(`Delete "${pkg.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "featured_packages", pkg.id));
    } catch (err) {
      console.error("Failed to delete package:", err);
      setPkgMessage("Couldn't delete the package.");
    }
  };

  if (!adminReady) {
    return (
      <div className="px-4 py-6 text-gray-400 sm:px-6 lg:px-8">Loading...</div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Featured Package Settings</h1>
            <p className="mt-1 text-sm text-gray-400">
              Country pricing is limited to Zimbabwe and Sri Lanka, matching the app.
            </p>
          </div>
          <Link
            href="/admin/payment-settings"
            className="rounded-xl border border-white/10 bg-[#151A22] px-4 py-2 text-sm font-semibold text-white hover:border-sky-500/40"
          >
            Payment details
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Legacy Country Pricing</h2>
          <div className="mb-5 flex rounded-full bg-[#0b1220] p-1">
            {FEATURED_COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                disabled={legacySaving}
                onClick={() => {
                  setCountry(c);
                  setLegacyMessage(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                  country === c
                    ? "bg-[#2563eb] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {legacyLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : legacyError ? (
            <p className="text-sm text-red-400">{legacyError}</p>
          ) : (
            <form onSubmit={saveLegacy} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="legacy-price">
                  Price
                </label>
                <input
                  id="legacy-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  className={INPUT_CLASS}
                  disabled={legacySaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="legacy-currency">
                  Currency
                </label>
                <input
                  id="legacy-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className={INPUT_CLASS}
                  disabled={legacySaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="legacy-credits">
                  Featured Credits per Package
                </label>
                <input
                  id="legacy-credits"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  disabled={legacySaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="legacy-validity">
                  Validity per Activation (days)
                </label>
                <input
                  id="legacy-validity"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  disabled={legacySaving}
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 md:col-span-2">
                <span>
                  <span className="block text-sm font-semibold text-white">Package Active</span>
                  <span className="text-xs text-gray-400">
                    {active
                      ? "Sellers can purchase this package."
                      : "Purchases are disabled for this country."}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={legacySaving}
                />
              </label>
              {legacyMessage ? (
                <p className="text-sm text-yellow-300 md:col-span-2">{legacyMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={legacySaving}
                className="rounded-xl bg-[#2563eb] px-4 py-3 font-bold text-white disabled:opacity-60 md:col-span-2"
              >
                {legacySaving ? "Saving..." : "Save Package"}
              </button>
            </form>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Named Packages</h2>
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white"
            >
              Create Package
            </button>
          </div>

          {pkgMessage ? <p className="text-sm text-yellow-300">{pkgMessage}</p> : null}

          {formVisible ? (
            <form
              onSubmit={saveNamedPackage}
              className="grid gap-4 rounded-2xl border border-white/10 bg-[#111827] p-5 md:grid-cols-2"
            >
              <h3 className="text-base font-bold text-white md:col-span-2">
                {editingId ? "Edit Package" : "Create Package"}
              </h3>
              <div className="md:col-span-2">
                <label className={LABEL_CLASS} htmlFor="pkg-name">
                  Name
                </label>
                <input
                  id="pkg-name"
                  value={namedForm.name}
                  onChange={(e) => setNamedForm({ ...namedForm, name: e.target.value })}
                  placeholder="e.g. Standard"
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL_CLASS} htmlFor="pkg-description">
                  Description
                </label>
                <textarea
                  id="pkg-description"
                  value={namedForm.description}
                  onChange={(e) => setNamedForm({ ...namedForm, description: e.target.value })}
                  placeholder="Short description shown to sellers"
                  className={`${INPUT_CLASS} min-h-[80px]`}
                  disabled={pkgSaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-country">
                  Country
                </label>
                <select
                  id="pkg-country"
                  value={namedForm.country}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setNamedForm({
                      ...namedForm,
                      country: nextCountry,
                      currency: currencyForCountry(nextCountry),
                    });
                  }}
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                >
                  {FEATURED_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-currency">
                  Currency
                </label>
                <input
                  id="pkg-currency"
                  value={namedForm.currency}
                  onChange={(e) =>
                    setNamedForm({ ...namedForm, currency: e.target.value.toUpperCase() })
                  }
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-price">
                  Price
                </label>
                <input
                  id="pkg-price"
                  value={namedForm.price}
                  onChange={(e) => setNamedForm({ ...namedForm, price: e.target.value })}
                  inputMode="decimal"
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-credits">
                  Credits
                </label>
                <input
                  id="pkg-credits"
                  value={namedForm.credits}
                  onChange={(e) => setNamedForm({ ...namedForm, credits: e.target.value })}
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-duration">
                  Duration (days)
                </label>
                <input
                  id="pkg-duration"
                  value={namedForm.durationDays}
                  onChange={(e) => setNamedForm({ ...namedForm, durationDays: e.target.value })}
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pkg-order">
                  Display Order
                </label>
                <input
                  id="pkg-order"
                  value={namedForm.displayOrder}
                  onChange={(e) => setNamedForm({ ...namedForm, displayOrder: e.target.value })}
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  disabled={pkgSaving}
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 md:col-span-2">
                <span className="text-sm font-semibold text-white">Active</span>
                <input
                  type="checkbox"
                  checked={namedForm.active}
                  onChange={(e) => setNamedForm({ ...namedForm, active: e.target.checked })}
                  disabled={pkgSaving}
                />
              </label>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <button
                  type="submit"
                  disabled={pkgSaving}
                  className="rounded-xl bg-[#2563eb] px-4 py-3 font-bold text-white disabled:opacity-60"
                >
                  {pkgSaving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Package"}
                </button>
                <button
                  type="button"
                  disabled={pkgSaving}
                  onClick={() => setFormVisible(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {namedPackages.length === 0 ? (
            <p className="text-sm text-gray-400">No named packages yet. Create one above.</p>
          ) : (
            namedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4"
              >
                <div>
                  <p className="font-bold text-white">{pkg.name}</p>
                  {pkg.description ? (
                    <p className="mt-1 text-sm text-gray-400">{pkg.description}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-sky-400">
                    {pkg.country ? `${pkg.country} · ` : ""}
                    {pkg.currency} {pkg.price} · {pkg.credits} credits · {pkg.durationDays} days ·
                    order {pkg.displayOrder ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(pkg)}
                    className={`rounded-lg px-4 py-2 font-bold text-white ${
                      pkg.active !== false ? "bg-green-600" : "bg-gray-600"
                    }`}
                  >
                    {pkg.active !== false ? "Active" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditForm(pkg)}
                    className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePackage(pkg)}
                    className="rounded-lg border border-red-500/40 px-4 py-2 font-semibold text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
