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
    singapore: "SGD $",
    india: "₹",
    thailand: "฿",
    zimbabwe: "USD $",
    usa: "USD $",
    maldives: "MVR",
    "sri lanka": "Rs.",
    "south africa": "R",
    "united kingdom": "£",
    canada: "CAD $",
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
          console.error(error);
        }
      };

    fetchListing();
  }, [slug]);

  if (!item) {
    return (
      <h1 className="p-10 text-xl text-white bg-black min-h-screen">
        Loading...
      </h1>
    );
  }

  const currency =
    currencyMap[
      item?.country
        ?.trim()
        ?.toLowerCase()
    ] || "Rs.";

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-4xl mx-auto bg-[#0b0b0b] rounded-[32px] shadow-2xl p-6">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-2xl text-sm"
        >
          ← Back to Home
        </button>

<div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide mb-6">
  {(
    item.imageUrls ||
    [item.imageUrl]
  )?.map(
    (
      image: string,
      index: number
    ) => (
      <div
        key={index}
        className="min-w-full snap-center relative"
      >
        <img
          src={image}
          alt={`Photo ${index}`}
          className="w-full h-[320px] object-contain bg-[#111] rounded-[32px] shadow-2xl p-3"
        />

        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md">
          {index + 1} /{" "}
          {(
            item.imageUrls ||
            [item.imageUrl]
          ).length}
        </div>
      </div>
    )
  )}
</div>

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
        <p className="text-gray-500 text-sm mt-2">
  🕒 Posted on{" "}
  {item.createdAt
    ? new Date(
        item.createdAt
          .seconds *
          1000
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently"}
</p>

        <h2 className="text-2xl font-bold mt-12 mb-5">
          Description
        </h2>

        <p className="text-gray-300 text-lg leading-8">
          {item.description}
        </p>

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
          <img
  src={
    ad.imageUrls?.[0] ||
    ad.imageUrl
  }
  alt={ad.title}
  className="w-full h-[180px] object-cover rounded-[24px]"
/>

                <h3 className="font-bold text-lg mt-3 text-white">
                  {ad.title}
                </h3>

                <p className="text-green-500 font-bold text-xl">
                  {(currencyMap[
                    ad.country
                      ?.trim()
                      ?.toLowerCase()
                  ] || "Rs.")}{" "}
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