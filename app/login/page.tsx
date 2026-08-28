"use client";

import { Suspense, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeAuthReturnUrl } from "../components/GuestAuthPrompt";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] =
  useState(false);
  const [loginErrorText, setLoginErrorText] =
  useState("");
  const [resetMessage, setResetMessage] =
  useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeAuthReturnUrl(
    searchParams.get("returnUrl") || searchParams.get("redirect")
  );

  const handleLogin = async (e: any) => {
  e.preventDefault();

  setLoginError(false);
  setLoginErrorText("");

  try {
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

setLoginError(false);

router.push(returnUrl); 
    } catch (error: any) {
  const code = error?.code ? String(error.code) : "";
  const message = error?.message ? String(error.message) : "";
  setLoginError(true);
  setLoginErrorText(
    code || message
      ? [code, message].filter(Boolean).join(" — ")
      : "Invalid email or password"
  );
}
  };
const handleResetPassword =
  async () => {
    if (!email) {
      setResetMessage(
        "Please enter your email first."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      setResetMessage(
        "📩 Password reset link sent. Check your inbox or spam folder."
      );
    } catch (error: any) {
      setResetMessage(
        "Failed to send reset email."
      );
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
  onChange={(e) =>
    setEmail(e.target.value)
  }
  className={`w-full border text-white caret-white p-4 rounded-2xl placeholder-gray-400 bg-[#111827] focus:outline-none ${
    loginError
      ? "border-red-500"
      : "border-gray-700"
  }`}
/>

<div className="flex justify-between items-center">
  {resetMessage && (
    <p className="text-sm text-blue-400">
      {resetMessage}
    </p>
  )}

  <button
    type="button"
    onClick={
      handleResetPassword
    }
    className="text-sm text-blue-400 hover:text-blue-300 transition ml-auto"
  >
    Forgot Password?
  </button>
</div>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) =>
    setPassword(
      e.target.value
    )
  }
  className={`w-full border text-white caret-white p-4 rounded-2xl placeholder-gray-400 bg-[#111827] focus:outline-none ${
    loginError
      ? "border-red-500"
      : "border-gray-700"
  }`}
/>    

                {loginError && (
  <p className="text-red-500 text-sm">
    {loginErrorText || "Invalid email or password"}
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

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
          Loading...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}