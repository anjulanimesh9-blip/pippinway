"use client";

import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { signalsFetch } from "@/lib/signals/client";
import FreeDashboard from "./free/FreeDashboard";
import GuestIntro from "./guest/GuestIntro";
import ProDashboard from "./pro/ProDashboard";
import { ScannerSkeletons } from "./components/ScannerSkeletons";

export default function SignalsDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [daily, setDaily] = useState<Record<string, unknown> | null>(null);

  useEffect(() => onAuthStateChanged(auth, (current) => {
    setUser(current);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      return;
    }
    void signalsFetch("/api/signals/daily", user).then(async (response) => {
      const body = await response.json() as { plan?: "free" | "pro"; subscription?: { expiresAt?: string | null } };
      if (!response.ok) return;
      setPlan(body.plan === "pro" ? "pro" : "free");
      setExpiresAt(body.subscription?.expiresAt || null);
      if (body.plan !== "pro") setDaily(body);
    });
  }, [user]);

  if (!authReady) {
    return <ScannerSkeletons count={4} />;
  }
  if (!user) {
    return <GuestIntro />;
  }
  if (plan === "pro") {
    return (
      <Suspense fallback={<ScannerSkeletons count={4} />}>
        <ProDashboard user={user} expiresAt={expiresAt} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<ScannerSkeletons count={4} />}>
      <FreeDashboard user={user} initial={daily} />
    </Suspense>
  );
}
