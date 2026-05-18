"use client";

import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [myAds, setMyAds] =
    useState<any[]>([]);

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

        const ads: any[] = [];

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

    if (user) fetchMyAds();
  }, [user]);

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">
          <h1 className="text-4xl font-bold">
            Welcome 👋
          </h1>

          <p className="text-gray-500 mt-2">
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="text-gray-500">
              Total Ads
            </h2>

            <p className="text-4xl font-bold mt-2">
              {myAds.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="text-gray-500">
              Active Listings
            </h2>

            <p className="text-4xl font-bold mt-2">
              {myAds.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="text-gray-500">
              Categories
            </h2>

            <p className="text-4xl font-bold mt-2">
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
        <div className="bg-white rounded-3xl shadow p-6 mb-8 flex flex-wrap gap-4">
          <button
            onClick={() =>
              router.push("/")
            }
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Home
          </button>

          <button
            onClick={() =>
              router.push("/add-listing")
            }
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Add Listing
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-xl"
          >
            Logout
          </button>
        </div>

        {/* My Ads */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            My Ads
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
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
                  className="bg-white rounded-3xl shadow overflow-hidden hover:scale-105 transition"
                >
                  {ad.imageUrl && (
                    <img
                      src={
                        ad.imageUrl
                      }
                      alt={
                        ad.title
                      }
                      className="w-full h-52 object-cover"
                    />
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-bold">
                      {ad.title}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {
                        ad.location
                      }
                    </p>

                    <p className="text-2xl font-bold mt-3">
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