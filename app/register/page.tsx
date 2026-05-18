"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();

    try {
    const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

await setDoc(
  doc(db, "users", userCredential.user.uid),
  {
    email,
    phone,
    country,
  }
);

      alert("Account created successfully!");
      router.push("/profile");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
       
        <h1 className="text-3xl font-bold mb-6 text-center">
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
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />
          <input
  type="text"
  placeholder="WhatsApp Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="w-full border p-3 rounded-xl"
/>

<select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  className="w-full border p-3 rounded-xl"
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
<div className="flex gap-2 mt-4">
  <button className="bg-black text-white w-full py-3 rounded-xl">
    Create Account
  </button>

  <Link href="/" className="w-full">
    <button
      type="button"
      className="w-full border rounded-xl py-3"
    >
      🏠 Back to Home
    </button>
  </Link>
</div>
          
        </form>
      </div>
    </div>
  );
}