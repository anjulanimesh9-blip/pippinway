"use client";

import React, {
  Suspense,
  useState,
} from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { safeAuthReturnUrl } from "../components/GuestAuthPrompt";
import { MARKET_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

function RegisterPage() {
  const { t, countryLabel } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
const [errors, setErrors] = useState({
  email: false,
  password: false,
  phone: false,
  country: false,
});
  const [successMessage, setSuccessMessage] =
  useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeAuthReturnUrl(
    searchParams.get("returnUrl") || searchParams.get("redirect")
  );

  const handleRegister = async (
  e: React.FormEvent
) => {
    e.preventDefault();
  const newErrors = {
  email: false,
  password: false,
  phone: false,
  country: false,
};

if (!email) newErrors.email = true;
if (!password)
  newErrors.password = true;
if (!phone)
  newErrors.phone = true;
if (!country)
  newErrors.country = true;

if (newErrors.email || newErrors.password || newErrors.phone || newErrors.country) {
  setErrors(newErrors);
  return;
}

setErrors({
  email: false,
  password: false,
  phone: false,
  country: false,
});

    try {
    const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
await setDoc(
  doc(
    db,
    "users",
    userCredential.user.uid
  ),
  {
    email,
    phone,
    country,

    // Role
    role: "user",

    // Membership
    membership: "free",

    // Pro Seller Request
    proRequest: false,
    proApproved: false,

    featuredCredits: 0,
    featuredCreditLots: [],

    // Seller
    verifiedSeller: false,

    membershipStart:
      new Date(),
  }
);

  track("sign_up");
  router.push(returnUrl);
    } catch (error: any) {
      setSuccessMessage(
  t("auth.authGeneric")
);  }
  };
  
 return (
  <>
 {successMessage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div
      className={`w-full max-w-md rounded-[30px] border shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 ${
        successMessage === t("auth.authGeneric")
          ? "bg-[#1a0f12] border-red-500/30"
          : "bg-[#0f172a] border-green-500/30"
      }`}
    >
      <div className="text-5xl mb-4">
        {successMessage === t("auth.authGeneric")
          ? "❌"
          : "📩"}
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        {successMessage === t("auth.authGeneric")
          ? t("auth.somethingWrong")
          : t("auth.verifyYourEmail")}
      </h2>

      <p
        className={`text-sm md:text-base leading-relaxed ${
          successMessage === t("auth.authGeneric")
            ? "text-red-300"
            : "text-gray-300"
        }`}
      >
        {successMessage}
      </p>

      {successMessage !== t("auth.authGeneric") && (
        <p className="text-xs text-gray-500 mt-4">
          {t("auth.checkFolders")}
        </p>
      )}
    </div>
  </div>
)}

      <div className="min-h-screen flex items-start md:items-center justify-center bg-[#020817] px-4 pt-10 md:pt-0">
      <div className="w-full max-w-md bg-[#0f172a] border border-gray-800 p-8 rounded-[30px] shadow-2xl">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher compact />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          {t("auth.register")}
        </h1>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border p-4 rounded-2xl bg-[#111827] text-white caret-white placeholder-gray-400 ${
  errors.email
    ? "border-red-500"
    : "border-gray-700"
}`}
          />

          <input
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className={`w-full border p-4 rounded-2xl bg-[#111827] text-white caret-white placeholder-gray-400 ${
  errors.password
    ? "border-red-500"
    : "border-gray-700"
}`}
          />
          <input
  type="text"
  placeholder={t("auth.whatsappNumber")}
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className={`w-full border p-4 rounded-2xl bg-[#111827] text-white caret-white placeholder-gray-400 ${
  errors.phone
    ? "border-red-500"
    : "border-gray-700"
}`}
/>

<select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  className={`w-full border p-4 rounded-2xl bg-[#111827] text-white ${
  errors.country
    ? "border-red-500"
    : "border-gray-700"
}`}
>
  <option value="">{t("post.selectCountry")}</option>
  {MARKET_COUNTRIES.map((item) => (
    <option key={item.firestoreValue} value={item.firestoreValue}>
      {countryLabel(item.firestoreValue)}
    </option>
  ))}
</select>
  <div className="grid grid-cols-2 gap-3 mt-6">
  <button className="bg-black hover:bg-gray-900 transition text-white w-full py-4 rounded-2xl">
    {t("auth.createAccountBtn")}
  </button>

  <Link href="/" className="w-full">
    <button
      type="button"
      className="border border-gray-700 bg-[#111827] hover:bg-[#1f2937] transition text-white py-4 rounded-2xl w-full"
    >
      🏠 {t("auth.backHome")}
    </button>
  </Link>
</div>
          
        </form>
           </div>
    </div>
  </>
);
}

export default function Register() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
          {t("common.loading")}
        </div>
      }
    >
      <RegisterPage />
    </Suspense>
  );
}