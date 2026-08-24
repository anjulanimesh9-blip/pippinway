"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Gift,
  Package,
  Shield,
  Star,
  Users,
} from "lucide-react";

const ACTION_CARD =
  "flex min-h-[84px] flex-col items-start justify-center gap-1.5 rounded-xl border border-white/8 bg-[#151A22] px-4 py-3 text-left transition hover:border-sky-500/40 hover:bg-[#1b2230]";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    ads: 0,
    featured: 0,
    proUsers: 0,
    pendingAds: 0,
    proRequests: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push("/");
          return;
        }

        const userData = userSnap.data();

        if (userData.role !== "admin") {
          alert("Access Denied!");
          router.push("/");
          return;
        }

        const usersSnap = await getDocs(collection(db, "users"));
        const adsSnap = await getDocs(collection(db, "listings"));

        let featured = 0;
        let proUsers = 0;
        let pendingAds = 0;
        let proRequests = 0;

        usersSnap.forEach((userDoc) => {
          const data = userDoc.data();

          if (data.membership === "pro") {
            proUsers++;
          }

          if (data.proRequest === true) {
            proRequests++;
          }
        });

        adsSnap.forEach((adDoc) => {
          const data = adDoc.data();

          if (data.featured === true) {
            featured++;
          }

          if (
            data.approved === false &&
            data.rejected !== true &&
            data.expired !== true
          ) {
            pendingAds++;
          }
        });

        setStats({
          users: usersSnap.size,
          ads: adsSnap.size,
          featured,
          proUsers,
          pendingAds,
          proRequests,
        });

        setLoading(false);
      } catch (error) {
        console.log(error);
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Checking Admin Access...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#FBB03B]">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.users}
          icon={Users}
          accent="bg-[#FBB03B]/15 text-[#FBB03B]"
        />
        <StatCard
          label="Total Ads"
          value={stats.ads}
          icon={Package}
          accent="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Featured Ads"
          value={stats.featured}
          icon={Star}
          accent="bg-[#FBB03B]/15 text-[#FBB03B]"
        />
        <StatCard
          label="Pro Members"
          value={stats.proUsers}
          icon={Shield}
          accent="bg-blue-600/15 text-blue-400"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/ad-approvals"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-[#111827] px-4 py-3.5 transition hover:border-[#FBB03B]/40"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBB03B]/15 text-[#FBB03B]">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Pending ads</p>
              <p className="text-xs text-gray-400">Review listings waiting approval</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold tabular-nums text-[#FBB03B]">
            {stats.pendingAds}
          </span>
        </Link>

        <Link
          href="/admin/pro-users"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-[#111827] px-4 py-3.5 transition hover:border-sky-500/40"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Shield size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Pro requests</p>
              <p className="text-xs text-gray-400">Sellers waiting for Pro access</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold tabular-nums text-sky-400">
            {stats.proRequests}
          </span>
        </Link>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Shortcuts
      </h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Link href="/admin/users" className={ACTION_CARD}>
          <Users size={16} className="text-[#FBB03B]" />
          <span className="text-sm font-semibold text-white">Manage Users</span>
        </Link>
        <Link href="/admin/listings" className={ACTION_CARD}>
          <Package size={16} className="text-sky-400" />
          <span className="text-sm font-semibold text-white">Manage Listings</span>
        </Link>
        <Link href="/admin/notifications" className={ACTION_CARD}>
          <Bell size={16} className="text-sky-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
        </Link>
        <Link href="/admin/rewards" className={ACTION_CARD}>
          <Gift size={16} className="text-[#FBB03B]" />
          <span className="text-sm font-semibold text-white">Rewards</span>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}
