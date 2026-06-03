"use client";

import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [myAds, setMyAds] =
    useState<any[]>([]);
    const [favoriteAds,
  setFavoriteAds] =
  useState<any[]>([]);
  const [menuOpen, setMenuOpen] =
  useState(false);
  const [userData,
setUserData] =
useState<any>(null);
  useEffect(() => {
  const fetchMyAds =
    async () => {
      const querySnapshot =
        await getDocs(
          collection(
            db,
            "listings"
          )
        );

      const ads:
        any[] = [];

      querySnapshot.forEach(
        (doc) => {
          const data =
            doc.data();

          if (
            data.ownerEmail ===
            user?.email
          ) {
            ads.push({
              id: doc.id,
              ...data,
            });
          }
        }
      );

      setMyAds(ads);
    };

  const fetchUserData =
    async () => {
      const userRef =
        doc(
          db,
          "users",
          user!.uid
        );

      const userSnap =
        await getDoc(
          userRef
        );

      if (
        userSnap.exists()
      ) {
        setUserData(
          userSnap.data()
        );
      }
    };

  if (user) {
    fetchMyAds();
    fetchFavorites();
    fetchUserData();
  }
}, [user]);
  const fetchFavorites =
  async () => {
    const favSnapshot =
      await getDocs(
        collection(
          db,
          "users",
          user!.uid,
          "favorites"
        )
      );

    const favAds:
      any[] = [];

    for (const fav of
      favSnapshot.docs) {

      const listingRef =
        doc(
          db,
          "listings",
          fav.id
        );

      const listingSnap =
        await getDoc(
          listingRef
        );

      if (
        listingSnap.exists()
      ) {
        favAds.push({
          id:
            listingSnap.id,
          ...listingSnap.data(),
        });
      }
    }

    setFavoriteAds(
      favAds
    );
  };

  const handleLogout =
    async () => {
      await signOut(auth);
      router.push("/login");
    };

  if (!user) {
    return (
      <div className="p-10 text-center text-xl">
        Please login first
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex">
{/* Mobile Header */}
<div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 py-1">
  <Image
    src="/images/logo.png"
    alt="Pippinway"
    width={110}
    height={35}
    className="object-contain"
  />

  <button
    onClick={() =>
      setMenuOpen(!menuOpen)
    }
    className="text-3xl leading-none"
  >
    ☰
  </button>
</div>

{/* Sidebar */}
<div
  className={`fixed md:relative inset-y-0 top-0 left-0 z-50 h-screen w-64 md:w-72 bg-[#111827] p-6 flex flex-col border-r border-gray-800 transition-transform duration-300 ${
    menuOpen
      ? "translate-x-0"
      : "-translate-x-full md:translate-x-0"
  }`}
>

  <div className="mb-10">
    <Image
      src="/images/logo.png"
      alt="Pippinway"
      width={260}
      height={120}
      className="object-contain"
    />
  </div>

  <div className="flex flex-col gap-3">
    <button
      onClick={() => router.push("/profile")}
      className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-4 text-left"
    >
      🏠 Dashboard
    </button>

    <button
      onClick={() => router.push("/")}
      className="bg-[#1F2937] hover:bg-gray-700 rounded-2xl p-4 text-left"
    >
      📦 My Listings
    </button>

    <button
      onClick={() => router.push("/add-listing")}
      className="bg-[#1F2937] hover:bg-gray-700 rounded-2xl p-4 text-left"
    >
      ➕ Add Listing
    </button>

    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 rounded-2xl p-4 text-left mt-10"
    >
      🚪 Logout
    </button>
  </div>
</div>
     <div className="flex-1 p-4 md:p-8 overflow-y-auto mt-35 md:mt-0">

        {/* Header */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow p-5 md:p-8 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">
            Welcome back, Anjula! 👋
          </h1>

          <p className="text-gray-500 mt-2">
            {user.email}
          </p>
        </div>
     {
userData?.membership !==
"pro" && (

<div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500 rounded-[30px] p-6 mb-8 shadow-xl">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

    <div>
      <h2 className="text-3xl font-bold text-yellow-400">
        ⭐Go Pro⭐
      </h2>

      <p className="text-gray-300 mt-2">
        Get more power to sell faster
      </p>

      <div className="mt-4 space-y-2 text-sm text-gray-300">
        <p>✅ 30 Ads / Month</p>
        <p>✅ 10 Featured Ads FREE</p>
        <p>✅ Verified Seller Badge</p>
        <p>✅ Priority Listings</p>
      </div>
    </div>

    <div className="text-center">
      <h3 className="text-4xl font-bold text-green-400">
        $5
      </h3>

      <p className="text-gray-400">
        / month
      </p>

      <a
        href="https://wa.me/94716150773?text=Hi%20I%20want%20to%20upgrade%20to%20Seller%20Pro%20($5/month)"
        target="_blank"
      >
        <button className="mt-4 w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-2xl transition">
          Upgrade Now
        </button>
      </a>
    </div>

  </div>
</div>

)
}
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-[#111827] border border-gray-800 p-6 shadow-xl">
            <h2 className="text-gray-500">
              Total Ads
            </h2>

            <p className="text-4xl font-bold mt-2 text-white">
              {myAds.length}
            </p>
          </div>

   

          <div className="rounded-3xl bg-[#111827] border border-gray-800 p-6 shadow-xl">
            <h2 className="text-gray-500">
              Active Listings
            </h2>

            <p className="text-4xl font-bold mt-2 text-white">
              {myAds.length}
            </p>
          </div>

          <div className="rounded-3xl bg-[#111827] border border-gray-800 p-6 shadow-xl">
            <h2 className="text-gray-500">
              Categories
            </h2>

            <p className="text-4xl font-bold mt-2 text-white">
              {
                new Set(
                  myAds.map(
                    (ad) =>
                      ad.category
                  )
                ).size
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4">
          <button
            onClick={() =>
              router.push("/")
            }
            className="bg-black text-white px-6 py-3 rounded-xl w-full md:w-auto"
          >
            Home
          </button>

          <button
            onClick={() =>
             router.push("/add-listing")
            }
            className="bg-green-600 text-white px-6 py-3 rounded-xl w-full md:w-auto"
          >
            Add Listing
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-xl w-full md:w-auto"
          >
            Logout
          </button>
        </div>
        <div className="mt-8">       
  <h2 className="text-3xl font-bold mb-6">
    My Favorites ❤️
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {favoriteAds.length ===
    0 ? (
      <p>
        No favorites yet
      </p>
    ) : (
      favoriteAds.map(
        (ad) => (
          <Link
  key={ad.id}
  href={`/listings/${ad.id}`}
  className="group w-full bg-gradient-to-b from-[#0f172a] to-[#111827] border border-gray-800 rounded-[28px] overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300"
>
            {ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full aspect-[16/10] object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-52 bg-[#1F2937] flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <div className="p-5 min-h-[140px] flex flex-col justify-between">
              <h3 className="text-2xl font-bold text-white truncate">
                {ad.title}
              </h3>

              <p className="text-gray-500 mt-2">
                {ad.location}
              </p>

              <p className="text-3xl font-extrabold text-green-400">
                Rs.{" "}
                {Number(
                  ad.price
                ).toLocaleString()}
              </p>
            </div>
          </Link>
        )
      )
    )}
  </div>
</div>


        {/* My Ads */}
        
        <div>
          <h2 className="text-3xl font-bold mb-6">
            My Ads
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAds.length ===
            0 ? (
              <p>
                No ads posted yet
              </p>
            ) : (
              myAds.map((ad) => (
                <Link
  key={ad.id}
  href={`/listings/${ad.id}`}
  className="group w-full bg-gradient-to-b from-[#0f172a] to-[#111827] border border-gray-800 rounded-[28px] overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300"
>
                {ad.imageUrl ? (
  <img
    src={ad.imageUrl}
    alt={ad.title}
    className="w-full aspect-[16/10] object-cover transition duration-500 group-hover:scale-105"
    onError={(e) => {
     (e.target as HTMLImageElement).style.display =
"none";
    }}
  />
) : (
  <div className="w-full h-52 bg-[#1F2937] flex items-center justify-center text-gray-500">
    No Image
  </div>
)}
                  <div className="p-5 min-h-[140px] flex flex-col justify-between">
                    <h3 className="text-2xl font-bold text-white truncate">
                      {ad.title}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {
                        ad.location
                      }
                    </p>

                    <p className="text-3xl font-extrabold text-green-400">
                      Rs. {ad.price}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}