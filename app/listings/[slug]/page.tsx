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
            await getDoc(
              docRef
            );

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

            // Similar ads
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
      <h1 className="p-10 text-xl">
        Loading...
      </h1>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() =>
          router.push("/")
        }
        className="mb-6 bg-black text-white px-5 py-2 rounded-xl"
      >
        ← Back to Home
      </button>

      {item.imageUrl && (
        <img
          src={
            item.imageUrl
          }
          alt={item.title}
          className="w-full h-96 object-cover rounded-xl"
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
        >
          WhatsApp Seller
        </a>

        <a
          href={`tel:${item.phone}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Call Seller
        </a>

        {currentUser?.email ===
          item.ownerEmail && (
          <>
            <button
              onClick={
                handleDelete
              }
              className="bg-red-600 text-white px-6 py-3 rounded-xl"
            >
              Delete Listing
            </button>

            <button
              onClick={() =>
                router.push(
                  `/edit/${slug}`
                )
              }
              className="bg-yellow-500 text-white px-6 py-3 rounded-xl"
            >
              Edit Listing
            </button>
          </>
        )}
      </div>

      {/* Similar Ads */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        Similar Ads
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedAds.map(
          (ad) => (
            <Link
              key={ad.id}
              href={`/listings/${ad.id}`}
              className="border rounded-2xl p-4 shadow hover:shadow-lg"
            >
              {ad.imageUrl && (
                <img
                  src={
                    ad.imageUrl
                  }
                  alt={
                    ad.title
                  }
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <h3 className="font-bold text-xl mt-2">
                {ad.title}
              </h3>

              <p className="text-green-600 font-bold">
                Rs. {ad.price}
              </p>

              <p className="text-gray-500">
                {
                  ad.location
                }
              </p>
            </Link>
          )
        )}
      </div>
    </div>
  );
}