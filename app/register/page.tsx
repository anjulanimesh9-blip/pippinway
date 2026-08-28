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
import { safeAuthReturnUrl } from "../components/GuestAuthPrompt";

function RegisterPage() {
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

  router.push(returnUrl);
    } catch (error: any) {
      setSuccessMessage(
  "❌ something went wrong. please try again."
);  }
  };
  
 return (
  <>
 {successMessage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div
      className={`w-full max-w-md rounded-[30px] border shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 ${
        successMessage.startsWith("❌")
          ? "bg-[#1a0f12] border-red-500/30"
          : "bg-[#0f172a] border-green-500/30"
      }`}
    >
      <div className="text-5xl mb-4">
        {successMessage.startsWith("❌")
          ? "❌"
          : "📩"}
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        {successMessage.startsWith("❌")
          ? "Something Went Wrong"
          : "Verify Your Email"}
      </h2>

      <p
        className={`text-sm md:text-base leading-relaxed ${
          successMessage.startsWith("❌")
            ? "text-red-300"
            : "text-gray-300"
        }`}
      >
        {successMessage}
      </p>

      {!successMessage.startsWith(
        "❌"
      ) && (
        <p className="text-xs text-gray-500 mt-4">
          Please check Inbox,
          Spam or Promotions
          folder.
        </p>
      )}
    </div>
  </div>
)}

      <div className="min-h-screen flex items-start md:items-center justify-center bg-[#020817] px-4 pt-10 md:pt-0">
      <div className="w-full max-w-md bg-[#0f172a] border border-gray-800 p-8 rounded-[30px] shadow-2xl">
       
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Register
        </h1>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
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
            placeholder="Password"
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
  placeholder="WhatsApp Number"
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
  <option value="">Select Country</option>
  <option value="Singapore">Singapore</option>
  <option value="India">India</option>
  <option value="Thailand">Thailand</option>
  <option value="Zimbabwe">Zimbabwe</option>
  <option value="USA">USA</option>
  <option value="Maldives">Maldives</option>
  <option value="Sri Lanka">Sri Lanka</option>
  <option value="South Africa">South Africa</option>
  <option value="United Kingdom">United Kingdom</option>
  <option value="Canada">Canada</option>
</select>
  <div className="grid grid-cols-2 gap-3 mt-6">
  <button className="bg-black hover:bg-gray-900 transition text-white w-full py-4 rounded-2xl">
    Create Account
  </button>

  <Link href="/" className="w-full">
    <button
      type="button"
      className="border border-gray-700 bg-[#111827] hover:bg-[#1f2937] transition text-white py-4 rounded-2xl w-full"
    >
      🏠 Back to Home
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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
          Loading...
        </div>
      }
    >
      <RegisterPage />
    </Suspense>
  );
}