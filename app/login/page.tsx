"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] =
  useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setLoginError(false);

      router.push("/profile");
    } catch (error: any) {
  setLoginError(true);
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] px-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-gray-800 p-8 rounded-[30px] shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
           className={`w-full border text-white caret-white p-4 rounded-2xl placeholder-gray-400 bg-[#111827] focus:outline-none ${
  loginError
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
            className={`w-full border text-white caret-white p-4 rounded-2xl placeholder-gray-400 bg-[#111827] focus:outline-none ${
  loginError
    ? "border-red-500"
    : "border-gray-700"
}`}
          />
          {loginError && (
  <p className="text-red-500 text-sm">
    Wrong email or password
  </p>
)}
<div className="grid grid-cols-2 gap-3 mt-6">
  <button
  type="submit"
  className="bg-black hover:bg-gray-900 transition text-white w-full py-4 rounded-2xl"
>
  Login
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
  );
}