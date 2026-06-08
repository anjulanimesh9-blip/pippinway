"use client";

import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
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
  const [menuOpen,
    setMenuOpen] =
    useState(false);
  const [userData,
    setUserData] =
    useState<any>(null);
    const featuredAdsUsed =
  myAds.filter(
    (ad) =>
      ad.featured ===
      true
  ).length;

const featuredAdsRemaining =
  (userData?.featuredCredits ||
    0) -
  featuredAdsUsed;

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

  const data =
    userSnap.data();

  // PRO expiry check
  if (
    data.membership ===
      "pro" &&
    data.proExpiryDate
  ) {

    const expiry =
      data.proExpiryDate.toDate();

    const now =
      new Date();

    if (
      now > expiry
    ) {

      await updateDoc(
        doc(
          db,
          "users",
          user!.uid
        ),
        {
          membership:
            "free",

          monthlyAdLimit:
            10,

          featuredCredits:
            0,

          proApproved:
            false,

          proRequest:
            false,
        }
      );

      data.membership =
        "free";
    }
  }

  setUserData(
    data
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
const removeFavorite =
async (listingId: string) => {
  try {
    await deleteDoc(
      doc(
        db,
        "users",
        user!.uid,
        "favorites",
        listingId
      )
    );

    setFavoriteAds(
      favoriteAds.filter(
        (ad) =>
          ad.id !==
          listingId
      )
    );
  } catch (error) {
    console.log(error);
  }
};
const handleDelete =
  async (
    id: string
  ) => {
    try {
      await deleteDoc(
        doc(
          db,
          "listings",
          id
        )
      );

      setMyAds(
        myAds.filter(
          (ad) =>
            ad.id !== id
        )
      );
    } catch (error) {
      console.error(
        error
      );
    }
  };
  const requestProSeller =
  async () => {
    try {
      await updateDoc(
        doc(
          db,
          "users",
          user!.uid
        ),
        {
          proRequest:
            true,
        }
      );

      setUserData({
        ...userData,
        proRequest:
          true,
      });

      alert(
        "Pro Seller request sent! Waiting for admin approval."
      );

    } catch (error) {
      console.log(error);
    }
  };
  const handleLogout =
    async () => {
      await signOut(auth);
      router.push("/login");
    };

  if (!user) {
    return (
      <div className="p-10 text-center text-xl text-white">
        Please login first
      </div>
    );
  }

  const adLimit =
    userData?.membership ===
    "pro"
      ? 30
      : 10;

  const adsUsed =
    myAds.length;

 const remainingAds =
Math.max(
  0,
  adLimit - adsUsed
);

  const percentage =
    (adsUsed /
      adLimit) *
    100;

  return (
    <div className="min-h-screen bg-[#020817] text-white flex">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <Image
          src="/images/logo.png"
          alt="Pippinway"
          width={120}
          height={40}
        />

        <button
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          className="text-3xl"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 h-screen w-72 bg-[#0f172a] border-r border-gray-800 p-6 transition-transform duration-300 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={180}
            height={80}
          />
        </div>

        <div className="space-y-3">

          <button
            onClick={() =>
              router.push(
                "/profile"
              )
            }
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl p-4 text-left"
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            📦 My Listings
          </button>

          <button
            onClick={() =>
              router.push(
                "/add-listing"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            ➕ Add Listing
          </button>

          <button
            onClick={
              handleLogout
            }
            className="w-full bg-red-600 hover:bg-red-700 rounded-2xl p-4 text-left mt-8"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex- p-6 md:p-8 overflow-y-auto mt-32 md:mt-0">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f172a] to-[#111827] border border-gray-800 rounded-[32px] p-6 shadow-xl mb-8">

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

            <div className="flex items-center gap-5">

              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, Anjula! 👋
                </h1>

                <p className="text-gray-400 mt-2">
                  {user.email}
                </p>

                <p className="text-gray-400">
                  🌍 {userData?.country}
                </p>
              </div>
            </div>

            <div
  className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold shadow-lg ${
    userData?.membership ===
    "pro"
      ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
      : "bg-blue-500/10 border-blue-500 text-white"
  }`}
>

       <div
  className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold shadow-lg ${
    userData?.membership === "pro"
      ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
      : "bg-blue-500/10 border-blue-500 text-white"
  }`}
>
  <div
    className={`w-2.5 h-2.5 rounded-full ${
      userData?.membership === "pro"
        ? "bg-yellow-400"
        : "bg-green-400"
    }`}
  />

  <span>
    {userData?.membership === "pro"
      ? "⭐ PRO MEMBER"
      : "FREE MEMBER"}
  </span>
</div>
{userData?.membership ===
  "pro" &&
  userData?.proExpiryDate && (
    <p className="text-yellow-400 text-sm mt-2 font-medium">
      Expires on:{" "}
      {new Date(
        userData.proExpiryDate.seconds *
          1000
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )}
    </p>
)}
            </div>
          </div>
        </div>
      {/* Featured Ads */}
<div className="bg-gradient-to-r from-[#0f172a] to-[#111827] border border-yellow-500/20 rounded-[32px] p-6 shadow-2xl mb-8">

  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-3xl font-bold text-yellow-400">
        ⭐ Featured Ads
      </h2>

      <p className="text-gray-400 mt-1">
        Your featured listings
      </p>
    </div>

    <div>
      <h2 className="text-4xl font-bold text-yellow-400">
        {featuredAdsUsed}
        <span className="text-gray-500 text-xl">
          {" "} / {userData?.featuredCredits}
        </span>
      </h2>

      <p className="text-green-400 text-sm mt-1">
        {featuredAdsRemaining} Remaining
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {myAds
      .filter((ad) => ad.featured === true)
      .map((ad) => (
        <div
          key={ad.id}
          className="bg-[#111827] border border-yellow-500 rounded-[20px] overflow-hidden"
        >
          <img
            src={
              ad.imageUrls?.[0] ||
              ad.imageUrl ||
              "/logo.png"
            }
            alt={ad.title}
            className="w-full h-44 object-cover rounded-t-[22px]"
          />

          <div className="p-4">
            <h3 className="font-bold truncate">
              {ad.title}
            </h3>

            <p className="text-red-400 text-xs mt-1">
  ⏳ Expires in{" "}
  {ad.featuredExpiryDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(
            ad.featuredExpiryDate.seconds *
              1000
          ).getTime() -
            Date.now()) /
            (1000 *
              60 *
              60 *
              24)
        )
      )
    : 0}{" "}
  days
</p>
          </div>
        </div>
      ))}

    {myAds.filter(
      (ad) => ad.featured === true
    ).length === 0 && (
      <div className="col-span-full text-center text-gray-500 py-10">
        No Featured Ads Yet ⭐
      </div>
    )}
  </div>
</div> 

  
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div className="bg-[#0f172a] rounded-[22px] border border-gray-800 p-6 shadow-xl">
            <p className="text-gray-400">
              Total Ads
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {myAds.length}
            </h2>
          </div>
<div className="bg-[#111827] rounded-[30px] p-6 border border-gray-800">
  <p className="text-gray-400">
    Featured Ads
  </p>

  <h2 className="text-3xl font-bold text-yellow-400 mt-2">
    {featuredAdsUsed}
    <span className="text-gray-500 text-xl">
      {" "}
      /{" "}
      {
        userData?.featuredCredits
      }
    </span>
  </h2>

  <p className="text-green-400 text-sm mt-2">
    {
      featuredAdsRemaining
    }{" "}
    Remaining
  </p>
</div>
          <div className="bg-[#0f172a] rounded-[22px] border border-gray-800 p-6 shadow-xl">
            <p className="text-gray-400">
              Favorites
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {favoriteAds.length}
            </h2>
          </div>

          <div className="bg-[#0f172a] rounded-[22px] border border-gray-800 p-6 shadow-xl">
            <p className="text-gray-400">
              Categories
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {
                new Set(
                  myAds.map(
                    (ad) =>
                      ad.category
                  )
                ).size
              }
            </h2>
          </div>

          <div className="bg-[#0f172a] rounded-[22px] border border-gray-800 p-6 shadow-xl">
            <p className="text-gray-400">
              Plan
            </p>
            <h2 className="text-xl font-bold mt-3 text-yellow-400">
              {userData?.membership ===
              "pro"
                ? "PRO"
                : "FREE"}
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={() =>
              router.push(
                "/add-listing"
              )
            }
            className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-2xl w-full"
          >
            ➕ Add Listing
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="bg-[#111827] hover:bg-[#1f2937] px-6 py-4 rounded-2xl w-full"
          >
            🏠 Home
          </button>
        </div>
{/* Seller Pro */}
{userData?.membership !==
"pro" && (
  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/40 rounded-[32px] p-8 mb-8">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

      <div>
        <h2 className="text-3xl font-bold text-yellow-400">
          ⭐ Upgrade to Seller Pro
        </h2>

        <p className="text-gray-300 mt-2">
          Get more power to sell faster
        </p>

        <div className="mt-5 space-y-2 text-gray-300">
          <p>
            ✅ 30 Ads / Month
          </p>
          <p>
            ✅ 10 Featured Ads FREE
          </p>
          <p>
            ✅ Verified Seller Badge
          </p>
          <p>
            ✅ Priority Listings
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-5xl font-bold text-green-400">
          $5
        </h2>

        <p className="text-gray-400">
          / month
        </p>

        {userData?.proRequest ? (

  <button className="mt-4 bg-gray-700 text-white px-8 py-4 rounded-2xl font-bold cursor-not-allowed">
    ⏳ Waiting Approval
  </button>

) : (

  <button
    onClick={
      requestProSeller
    }
    className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold"
  >
    ⭐ Request Pro Seller
  </button>

)}
      </div>
    </div>
  </div>
)}

{/* Favorites */}
<div className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 mb-8 shadow-xl">
  <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
    My Favorites ❤️
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {favoriteAds.length ===
    0 ? (
      <p className="text-gray-400">
        No favorites yet



      </p>
    ) : (
      favoriteAds.map(
        (ad) => (
          <Link
            key={ad.id}
            href={`/listings/${ad.id}`}
            className="bg-[#0f172a] border border-gray-800 rounded-[22px] overflow-hidden hover:scale-[1.02] transition"
          >
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-44 object-cover rounded-t-[22px]"
            />

            <div className="p-4">
              <h3 className="text-xl font-bold">
                {ad.title}
              </h3>

              <p className="text-gray-400 mt-1">
                {ad.location}
              </p>

              <p className="text-green-400 text-xl font-bold mt-3">
                Rs.{" "}
                {Number(
                  ad.price
                ).toLocaleString()}
              </p>
              <button
  onClick={(e) => {
    e.preventDefault();
    removeFavorite(
      ad.id
    );
  }}
  className="mt-3 w-full bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium transition"
>
  ❤️ Remove
</button>
            </div>
          </Link>
        )
      )
    )}
  </div>
</div>

{/* My Ads */}
<div className="bg-[#0f172a] border border-gray-800 rounded-[28px] p-5 shadow-xl">
  <h2 className="text-2xl font-bold mb-5 border-b border-gray-800 pb-3">
    My Ads
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {myAds.map((ad) => (
      <div
        key={ad.id}
        className="bg-[#0f172a] border border-gray-800 rounded-[22px] overflow-hidden"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-44 object-cover rounded-t-[22px]"
        />

        <div className="p-4">
          <h3 className="text-xl font-bold">
            {ad.title}
          </h3>

          <p className="text-gray-400 mt-1">
            {ad.location}
          </p>

          <p className="text-green-400 text-xl font-bold mt-3">
            Rs.{" "}
            {Number(
              ad.price
            ).toLocaleString()}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
  onClick={(e) => {
    e.preventDefault();
    router.push(
      `/edit/${ad.id}`
    );
  }}
  className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl w-full transition"
>
  ✏️ Edit
</button>
<button
  onClick={(e) => {
    e.preventDefault();
    handleDelete(
      ad.id
    );
  }}
  className="bg-red-600 hover:bg-red-700 py-2 rounded-xl w-full transition"
>
  🗑 Delete
</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}