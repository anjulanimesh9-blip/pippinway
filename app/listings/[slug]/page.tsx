"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";

export default function ListingDetails() {
  const [item, setItem] =
    useState<any>(null);

 const [relatedAds, setRelatedAds] =
  useState<any[]>([]);

  const currentUser =
    auth.currentUser;

  const router = useRouter();
  const params = useParams();

  const slug =
    params?.slug as string;

  const currencyMap: any = {
    Singapore: "SGD $",
    India: "₹",
    Thailand: "฿",
    Zimbabwe: "USD $",
    USA: "USD $",
    Maldives: "MVR",
    "Sri Lanka": "Rs.",
    "South Africa": "R",
    "United Kingdom": "£",
    Canada: "CAD $",
  };

  const handleDelete =
    async () => {
      const confirmDelete =
        confirm(
          "Are you sure you want to delete this listing?"
        );

      if (!confirmDelete)
        return;

      await deleteDoc(
        doc(
          db,
          "listings",
          slug
        )
      );

      alert(
        "Listing deleted!"
      );

      router.push("/");
    };

  useEffect(() => {
    if (!slug) return;

    const fetchListing =
      async () => {
        try {
          const docRef = doc(
            db,
            "listings",
            slug
          );

          const docSnap =
            await getDoc(docRef);

          if (
            docSnap.exists()
          ) {
            const listingData: any = {
              id: docSnap.id,
              ...docSnap.data(),
            };

            setItem(
              listingData
            );

            const querySnapshot =
              await getDocs(
                collection(
                  db,
                  "listings"
                )
              );

            const filteredAds =
              querySnapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter(
                  (ad: any) =>
                    ad.category ===
                      listingData.category &&
                    ad.id !== slug
                );

            setRelatedAds(
              filteredAds
            );
          }
        } catch (error) {
          console.error(
            error
          );
        }
      };

    fetchListing();
  }, [slug]);

  if (!item) {
    return (
      <h1 className="p-10 text-xl text-white">
        Loading...
      </h1>
    );
  }
  const currency =
  currencyMap[
    item?.country?.trim()
  ] || "Rs.";

console.log(
  "Country =",
  item?.country
);

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-4xl mx-auto bg-[#0b0b0b] rounded-[32px] shadow-2xl p-6">

        <button
          onClick={() =>
            router.push("/")
          }
<<<<<<< HEAD
          alt={item.title}
          className="w-full h-[400px] object-cover rounded-2xl"
        />
      )}

      <h1 className="text-4xl font-bold mt-6">
        {item.title}
      </h1>

      <p className="text-3xl font-bold text-green-600 mt-3">
        Rs. {item.price}
      </p>

      <p className="text-blue-600 mt-2">
        {item.category}
      </p>

      <p className="text-gray-600 mt-2">
        {item.location}
      </p>

      <h2 className="text-2xl font-bold mt-8">
        Description
      </h2>

      <p className="text-gray-700 mt-3">
        {
          item.description
        }
      </p>

      {/* Buttons */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <a
          href={`https://wa.me/${item.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
=======
          className="mb-6 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-2xl text-sm"
>>>>>>> c6aa639 (Updated currency system and edit page)
        >
          ← Back to Home
        </button>

        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-[380px] object-cover rounded-[32px] shadow-2xl"
          />
        )}

        <h1 className="text-4xl font-bold mt-6">
  {item.title}
</h1>


<p className="text-4xl font-extrabold text-green-500 mt-3">
  {currency} {item.price}
</p>

        <p className="flex items-center gap-2 text-blue-400 mt-3 font-medium">
          📂 {item.category}
        </p>

        <p className="flex items-center gap-2 text-gray-300 mt-2 text-lg">
          📍 {item.location}
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-5">
          Description
        </h2>

        <p className="text-gray-300 text-lg leading-8">
          {item.description}
        </p>

        {/* Buttons */}
        <div className="mt-14 grid grid-cols-2 gap-4 w-full mb-6">
          <a
            href={`https://wa.me/${item.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:scale-105 transition text-white py-4 rounded-2xl font-semibold text-xs text-center shadow-lg w-full"
          >
            WhatsApp Seller
          </a>

          <a
            href={`tel:${item.phone}`}
            className="bg-blue-600 hover:scale-105 transition text-white py-4 rounded-2xl font-semibold text-xs text-center shadow-lg w-full"
          >
            Call Seller
          </a>
        </div>

        {currentUser?.email ===
          item.ownerEmail && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={
                handleDelete
              }
              className="bg-red-600 text-white py-3 rounded-2xl"
            >
              Delete
            </button>

            <button
              onClick={() =>
                router.push(
                  `/edit/${slug}`
                )
              }
              className="bg-yellow-500 text-white py-3 rounded-2xl"
            >
              Edit
            </button>
          </div>
        )}

        {/* Similar Ads */}
        <h2 className="text-2xl font-bold mt-16 mb-6">
          Similar Ads
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {relatedAds.map(
            (ad) => (
              <Link
                key={ad.id}
                href={`/listings/${ad.id}`}
                className="min-w-[260px] bg-[#111111] border border-gray-800 rounded-[28px] p-3 shadow-xl overflow-hidden"
              >
                {ad.imageUrl && (
                  <img
                    src={
                      ad.imageUrl
                    }
                    alt={ad.title}
                    className="w-full h-44 object-cover rounded-2xl"
                  />
                )}

                <h3 className="font-bold text-lg mt-3 text-white">
                  {ad.title}
                </h3>

                <p className="text-green-500 font-bold text-xl">
                  {currencyMap[
                    ad.country
                  ] || "Rs."}{" "}
                  {ad.price}
                </p>

                <p className="text-gray-400 text-sm">
                  {ad.location}
                </p>
              </Link>
            )
          )}
        </div>

      </div>
    </div>
  );
}