"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "@/app/firebase";
import { FEATURED_COUNTRIES } from "@/lib/featuredCountries";
import type { PaymentSettings } from "@/lib/types/featured";

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-300";

export default function AdminPaymentSettingsPage() {
  const router = useRouter();
  const [adminReady, setAdminReady] = useState(false);
  const [country, setCountry] = useState<string>(FEATURED_COUNTRIES[0]);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [ecoCashNumber, setEcoCashNumber] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

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
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const snap = await getDoc(doc(db, "payment_settings", country));
        if (cancelled) return;
        const data = snap.exists() ? (snap.data() as PaymentSettings) : null;
        setAccountName(data?.accountName ?? "");
        setBankName(data?.bankName ?? "");
        setAccountNumber(data?.accountNumber ?? "");
        setBranch(data?.branch ?? "");
        setEcoCashNumber(data?.ecoCashNumber ?? "");
        setQrImage(data?.qrImage ?? null);
        setQrFile(null);
        setQrPreview(data?.qrImage ?? null);
      } catch (err) {
        console.error("Failed to load payment settings:", err);
        if (!cancelled) setLoadError("Couldn't load payment settings. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [adminReady, country, reloadKey]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setMessage("Account name is required.");
      return;
    }
    if (country === "Sri Lanka") {
      if (!bankName.trim() || !accountNumber.trim()) {
        setMessage("Bank name and account number are required for Sri Lanka.");
        return;
      }
    } else if (!ecoCashNumber.trim()) {
      setMessage("EcoCash number is required for Zimbabwe.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      let qrImageUrl = qrImage;
      if (qrFile) {
        const fileName = `payment_settings/${country}_${Date.now()}.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, qrFile);
        qrImageUrl = await getDownloadURL(storageRef);
      }

      const payload: PaymentSettings =
        country === "Sri Lanka"
          ? {
              country,
              accountName: accountName.trim(),
              bankName: bankName.trim(),
              accountNumber: accountNumber.trim(),
              branch: branch.trim(),
              ...(qrImageUrl ? { qrImage: qrImageUrl } : {}),
            }
          : {
              country,
              accountName: accountName.trim(),
              ecoCashNumber: ecoCashNumber.trim(),
              ...(qrImageUrl ? { qrImage: qrImageUrl } : {}),
            };

      await setDoc(doc(db, "payment_settings", country), payload);
      setQrFile(null);
      if (qrImageUrl) {
        setQrImage(qrImageUrl);
        setQrPreview(qrImageUrl);
      }
      setMessage(`Payment settings updated for ${country}.`);
    } catch (err) {
      console.error("Failed to save payment settings:", err);
      setMessage("Couldn't save payment settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!adminReady) {
    return (
      <div className="px-4 py-6 text-gray-400 sm:px-6 lg:px-8">Loading...</div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Details</h1>
          <p className="mt-1 text-sm text-gray-400">
            Bank transfer and EcoCash details shown to sellers when they buy a Featured package.
          </p>
        </div>

        <div className="flex rounded-full bg-[#111827] p-1">
          {FEATURED_COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              disabled={saving}
              onClick={() => {
                setCountry(c);
                setMessage(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                country === c ? "bg-[#2563eb] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : loadError ? (
          <div className="space-y-3">
            <p className="text-sm text-red-400">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSave}
            className="space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-5"
          >
            <div>
              <label className={LABEL_CLASS} htmlFor="account-name">
                Account Name
              </label>
              <input
                id="account-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className={INPUT_CLASS}
                disabled={saving}
              />
            </div>

            {country === "Sri Lanka" ? (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="bank-name">
                    Bank Name
                  </label>
                  <input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={INPUT_CLASS}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="account-number">
                    Account Number
                  </label>
                  <input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    inputMode="numeric"
                    className={INPUT_CLASS}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="branch">
                    Branch
                  </label>
                  <input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={INPUT_CLASS}
                    disabled={saving}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className={LABEL_CLASS} htmlFor="ecocash">
                  EcoCash Number
                </label>
                <input
                  id="ecocash"
                  value={ecoCashNumber}
                  onChange={(e) => setEcoCashNumber(e.target.value)}
                  inputMode="tel"
                  className={INPUT_CLASS}
                  disabled={saving}
                />
              </div>
            )}

            <div>
              <p className={LABEL_CLASS}>QR Image</p>
              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-sky-500/50 bg-sky-500/5 px-4 py-6">
                {qrPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrPreview}
                    alt="Payment QR"
                    className="max-h-52 w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-gray-400">Click to upload QR code</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={saving}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setQrFile(file);
                    setQrPreview(file ? URL.createObjectURL(file) : qrImage);
                  }}
                />
              </label>
            </div>

            {message ? <p className="text-sm text-yellow-300">{message}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#2563eb] px-4 py-3 font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
