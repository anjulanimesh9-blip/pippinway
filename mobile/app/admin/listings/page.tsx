"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";


import { db } from "../../firebase";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  getDoc,
} from "firebase/firestore";

import {
  auth,
} from "../../firebase";

export default function AdminListingsPage() {
  const router = useRouter();

  const [listings, setListings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");
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

      const listingsData: any[] =
  querySnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );

// Auto expire normal ads
for (const listing of listingsData as any[]) {

  const expiryDate =
    listing.expiryDate?.seconds
      ? new Date(
          listing.expiryDate.seconds * 1000
        )
      : null;

  if (
    listing.adType === "free" &&
    expiryDate &&
    expiryDate < new Date()
  ) {
    await updateDoc(
      doc(
        db,
        "listings",
        listing.id
      ),
      {
        approved: false,
        expired: true,
      }
    );

    listing.approved = false;
    listing.expired = true;
  }
}

setListings(listingsData);
setLoading(false);

    } catch (
      error
    ) {
      console.log(
        error
      );
    }
  };
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

          if (
            !userSnap.exists()
          ) {
            router.push("/");
            return;
          }

          const userData =
            userSnap.data();

          // block non-admins
          if (
            userData.role !==
            "admin"
          ) {
            router.push("/");
            return;
          }

          // admin only
          fetchListings();
          setLoading(false);

        } catch (error) {
          console.log(
            error
          );

          router.push("/");
        }
      }
    );

  return () =>
    unsubscribe();
}, []);
 

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

  const approveAd = async (id: string) => {
  try {
    // Find the listing
    const listing = listings.find(
      (item) => item.id === id
    );

    if (!listing) {
      alert("Listing not found");
      return;
    }

    // Approve ad
    await updateDoc(
      doc(db, "listings", id),
      {
        approved: true,
        rejected: false,
        status: "active",
      }
    );

    // Create notification
    await addDoc(
      collection(db, "notifications"),
      {
        userEmail: listing.ownerEmail,
        title: "🎉 Ad Approved",
        message: `Your listing "${listing.title}" has been approved and is now live on Pippinway.`,
        type: "approval",
        isRead: false,
        listingId: listing.id,
        createdAt: serverTimestamp(),
      }
    );

    alert("Ad Approved!");

    fetchListings();
  } catch (error) {
    console.log(error);
  }
};
    
    const approveAllAds =
  async () => {
    const ok = confirm(
      "Approve all pending ads?"
    );

    if (!ok) return;

    try {
      const pendingAds =
        listings.filter(
  (listing) =>
    !listing.approved &&
    listing.expired !== true
)

      await Promise.all(
        pendingAds.map(
          async (listing) =>
            updateDoc(
              doc(
                db,
                "listings",
                listing.id
              ),
              {
                approved:
                  true,
              }
            )
        )
      );

      alert(
        "All ads approved!"
      );

      fetchListings();
    } catch (error) {
      console.log(error);
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

          featuredExpiryDate:
            !currentValue
              ? new Date(
                  Date.now() +
                    7 *
                      24 *
                      60 *
                      60 *
                      1000
                )
              : null,
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

                    featuredExpiryDate:
                      !currentValue
                        ? new Date(
                            Date.now() +
                              7 *
                                24 *
                                60 *
                                60 *
                                1000
                          )
                        : null,
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
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading Listings...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h1 className="text-2xl font-bold sm:text-3xl">
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
            className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 sm:w-[300px] outline-none"
          />
        </div>

        {/* Pending Ads */}
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">
  ⏳ Pending Approval
</h2>
  <button
    onClick={approveAllAds}
    className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold"
  >
    ✅ Approve All
  </button>

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
    !listing.approved &&
    listing.expired !== true
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
              {formatPrice(listing.price ?? listing.amount, listing.country)}
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
{/* Featured Ads */}
<h2 className="text-3xl font-bold mb-6 mt-10 text-yellow-400">
  ⭐ Featured Ads
</h2>

<div className="bg-[#111827] rounded-3xl overflow-hidden border border-yellow-600 mb-10">

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
          Expires
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
    listing.featured === true
)
        .map((listing) => {

         let featuredDate = null;

if (listing.featuredExpiryDate) {
  if (listing.featuredExpiryDate.toDate) {
    featuredDate =
      listing.featuredExpiryDate.toDate();
  } else if (
    listing.featuredExpiryDate.seconds
  ) {
    featuredDate = new Date(
      listing.featuredExpiryDate.seconds *
        1000
    );
  } else {
    featuredDate = new Date(
      listing.featuredExpiryDate
    );
  }
}

let daysLeft = 0;

if (featuredDate) {
  const diff =
    featuredDate.getTime() -
    Date.now();

  daysLeft =
    Math.ceil(
      diff /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  // auto remove featured
  if (daysLeft <= 0) {
    updateDoc(
      doc(
        db,
        "listings",
        listing.id
      ),
      {
        featured: false,
        featuredExpiryDate:
          null,
      }
    );
  }
}

          return (
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
                {formatPrice(listing.price ?? listing.amount, listing.country)}
              </td>

              <td className="p-4 text-yellow-400 font-bold">
  {daysLeft > 0 ? (
    <>⏳ {daysLeft} Days Left</>
  ) : (
    <span className="text-red-500">
      Expired
    </span>
  )}
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
                    toggleFeatured(
                      listing.id,
                      true
                    )
                  }
                  className="bg-red-600 px-4 py-2 rounded-xl"
                >
                  Remove Featured
                </button>

              </td>
            </tr>
          );
        })}
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
      listing.approved === true &&
      listing.expired !== true
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
              {formatPrice(listing.price ?? listing.amount, listing.country)}
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
  );
}