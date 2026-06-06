"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "next/navigation";

export default function AdminListingsPage() {
  const router = useRouter();

  const [listings, setListings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings =
    async () => {
      try {
        const querySnapshot =
          await getDocs(
            collection(
              db,
              "listings"
            )
          );

        const listingsData =
          querySnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setListings(
          listingsData
        );

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

  const deleteListing =
    async (
      listingId: string
    ) => {
      const ok =
        confirm(
          "Delete this ad?"
        );

      if (!ok) return;

      try {
        await deleteDoc(
          doc(
            db,
            "listings",
            listingId
          )
        );

        setListings(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                listingId
            )
        );
      } catch (error) {
        console.log(error);
      }
    };

  const approveAd =
    async (
      id: string
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "listings",
            id
          ),
          {
            approved:
              true,
          }
        );

        alert(
          "Ad Approved!"
        );

        fetchListings();
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  const toggleFeatured =
    async (
      listingId: string,
      currentValue: boolean
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "listings",
            listingId
          ),
          {
            featured:
              !currentValue,
          }
        );

        setListings(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                listingId
                  ? {
                      ...item,
                      featured:
                        !currentValue,
                    }
                  : item
            )
        );
      } catch (error) {
        console.log(error);
      }
    };

  const filteredListings =
    listings.filter(
      (listing) =>
        listing.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        listing.location
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center text-2xl">
        Loading Listings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white flex">

      {/* Sidebar */}
      <div className="w-72 bg-[#0f172a] border-r border-gray-800 p-6">

        <h1 className="text-3xl font-bold mb-10">
          ⚙️ Admin
        </h1>

        <div className="space-y-4">

          <button
            onClick={() =>
              router.push(
                "/admin"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/users"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            👥 Users
          </button>

          <button
            className="w-full bg-blue-600 rounded-2xl p-4 text-left"
          >
            📦 Listings
          </button>

        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <h1 className="text-4xl font-bold">
            Listings Management
          </h1>

          <input
            type="text"
            placeholder="Search ads..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 w-[300px] outline-none"
          />
        </div>

        {/* Pending Ads */}
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">
  ⏳ Pending Approval
</h2>

<div className="bg-[#111827] rounded-3xl overflow-hidden border border-gray-800 mb-10">

  <table className="w-full">

    <thead className="bg-[#0f172a] text-left">
      <tr>
        <th className="p-4">
          Image
        </th>

        <th className="p-4">
          Title
        </th>

        <th className="p-4">
          Location
        </th>

        <th className="p-4">
          Price
        </th>

        <th className="p-4">
          Actions
        </th>
      </tr>
    </thead>

    <tbody>

      {filteredListings
        .filter(
          (listing) =>
            !listing.approved
        )
        .map((listing) => (

          <tr
            key={listing.id}
            className="border-t border-gray-800"
          >

            <td className="p-4">
              <img
                src={
                  listing.image ||
                  listing.imageUrl ||
                  listing.photo ||
                  listing.imageUrls?.[0] ||
                  "/logo.png"
                }
                alt={listing.title}
                className="w-24 h-20 object-cover rounded-xl"
              />
            </td>

            <td className="p-4 font-bold">
              {listing.title}
            </td>

            <td className="p-4 text-gray-400">
              {listing.location}
            </td>

            <td className="p-4 text-green-400 font-bold">
              Rs. {listing.price}
            </td>

            <td className="p-4 flex gap-2">

              <button
                onClick={() =>
                  approveAd(
                    listing.id
                  )
                }
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
              >
                ✅ Approve
              </button>

              <button
                onClick={() =>
                  deleteListing(
                    listing.id
                  )
                }
                className="bg-red-600 px-4 py-2 rounded-xl"
              >
                Delete
              </button>

            </td>
          </tr>
      ))}
    </tbody>
  </table>
</div>

        {/* Published Ads */}
      <h2 className="text-3xl font-bold mb-6 text-green-400">
  ✅ Published Ads
</h2>

<div className="bg-[#111827] rounded-3xl overflow-hidden border border-green-700">

  <table className="w-full">

    <thead className="bg-[#0f172a] text-left">
      <tr>
        <th className="p-4">
          Image
        </th>

        <th className="p-4">
          Title
        </th>

        <th className="p-4">
          Location
        </th>

        <th className="p-4">
          Price
        </th>

        <th className="p-4">
          Featured
        </th>

        <th className="p-4">
          Actions
        </th>
      </tr>
    </thead>

    <tbody>

      {filteredListings
        .filter(
          (listing) =>
            listing.approved ===
            true
        )
        .map((listing) => (

          <tr
            key={listing.id}
            className="border-t border-gray-800"
          >

            <td className="p-4">
              <img
                src={
                  listing.image ||
                  listing.imageUrl ||
                  listing.photo ||
                  listing.imageUrls?.[0] ||
                  "/logo.png"
                }
                alt={listing.title}
                className="w-24 h-20 object-cover rounded-xl"
              />
            </td>

            <td className="p-4 font-bold">
              {listing.title}
            </td>

            <td className="p-4 text-gray-400">
              {listing.location}
            </td>

            <td className="p-4 text-green-400 font-bold">
              Rs. {listing.price}
            </td>

            <td className="p-4">
              <button
                onClick={() =>
                  toggleFeatured(
                    listing.id,
                    listing.featured
                  )
                }
                className={`px-4 py-2 rounded-xl font-bold ${
                  listing.featured
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700"
                }`}
              >
                {listing.featured
                  ? "⭐ Featured"
                  : "☆ Make Featured"}
              </button>
            </td>

            <td className="p-4 flex gap-2">

              <button
                onClick={() =>
                  router.push(
                    `/listings/${listing.id}`
                  )
                }
                className="bg-blue-600 px-4 py-2 rounded-xl"
              >
                View
              </button>

              <button
                onClick={() =>
                  deleteListing(
                    listing.id
                  )
                }
                className="bg-red-600 px-4 py-2 rounded-xl"
              >
                Delete
              </button>

            </td>
          </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}