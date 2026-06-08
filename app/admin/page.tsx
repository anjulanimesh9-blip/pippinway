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

export default function AdminPage() {
  const router = useRouter();

  const [loading,
    setLoading] =
    useState(true);

  const [stats,
    setStats] =
    useState({
      users: 0,
      ads: 0,
      featured: 0,
      proUsers: 0,
    });

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          // not logged in
          if (!user) {
            router.push(
              "/login"
            );
            return;
          }

          try {
            // get current user
            const userRef =
              doc(
                db,
                "users",
                user.uid
              );

            const userSnap =
              await getDoc(
                userRef
              );

            // no user data
            if (
              !userSnap.exists()
            ) {
              router.push(
                "/"
              );
              return;
            }

            const userData =
              userSnap.data();

            // not admin
            if (
              userData.role !==
              "admin"
            ) {
              alert(
                "Access Denied!"
              );

              router.push(
                "/"
              );
              return;
            }

            // total users
            const usersSnap =
              await getDocs(
                collection(
                  db,
                  "users"
                )
              );

            // total ads
            const adsSnap =
              await getDocs(
                collection(
                  db,
                  "listings"
                )
              );

            let featured = 0;
            let proUsers = 0;

            usersSnap.forEach(
              (doc) => {
                const data =
                  doc.data();

                if (
                  data.membership ===
                  "pro"
                ) {
                  proUsers++;
                }
              }
            );

            adsSnap.forEach(
              (doc) => {
                const data =
                  doc.data();

                if (
                  data.featured ===
                  true
                ) {
                  featured++;
                }
              }
            );

            setStats({
              users:
                usersSnap.size,
              ads:
                adsSnap.size,
              featured,
              proUsers,
            });

            setLoading(
              false
            );

          } catch (error) {
            console.log(
              error
            );

            router.push(
              "/"
            );
          }
        }
      );

    return () =>
      unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center text-2xl">
        Checking Admin Access...
      </div>
    );
  }

return (
  <div className="min-h-screen bg-[#020817] text-white flex">

    {/* Sidebar */}
    <div className="w-64 bg-[#0f172a] border-r border-gray-800 p-5">

      <h1 className="text-4xl font-bold mb-10">
        ⚙️ Admin
      </h1>

      <div className="space-y-4">

        <button
          onClick={() =>
            router.push("/admin")
          }
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl p-4 text-left"
        >
          📊 Dashboard
        </button>

        <button
          onClick={() =>
            router.push("/admin/users")
          }
          className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
        >
          👥 Users
        </button>

        <button
          onClick={() =>
            router.push("/admin/listings")
          }
          className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
        >
          📦 Listings
        </button>
        <button
  onClick={() =>
    router.push(
      "/admin/pro-users"
    )
  }
  className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
>
  ⭐ Pro Requests
</button>

      </div>
    </div>

    {/* Main */}
    <div className="flex-1 p-8">

      <h1 className="text-5xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Users */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400">
            Total Users
          </p>

          <h2 className="text-5xl font-bold mt-3">
            {stats.users}
          </h2>
        </div>

        {/* Total Ads */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400">
            Total Ads
          </p>

          <h2 className="text-5xl font-bold mt-3">
            {stats.ads}
          </h2>
        </div>

        {/* Featured Ads */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400">
            Featured Ads
          </p>

          <h2 className="text-5xl font-bold mt-3">
            {stats.featured}
          </h2>
        </div>

        {/* Pro Members */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400">
            Pro Members
          </p>

          <h2 className="text-5xl font-bold mt-3">
            {stats.proUsers}
          </h2>
        </div>

      </div>

      {/* Quick Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <button
          onClick={() =>
            router.push("/admin/users")
          }
          className="bg-blue-600 hover:bg-blue-700 rounded-3xl p-6 text-2xl font-bold"
        >
          👥 Manage Users
        </button>

        <button
          onClick={() =>
            router.push("/admin/listings")
          }
          className="bg-green-600 hover:bg-green-700 rounded-3xl p-6 text-2xl font-bold"
        >
          📦 Manage Listings
        </button>

      </div>

    </div>
  </div>
);
}
