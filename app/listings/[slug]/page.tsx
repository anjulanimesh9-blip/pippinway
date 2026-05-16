"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ListingDetails() {
  const [item, setItem] = useState<any>(null);

  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug) return;

    const fetchListing = async () => {
      try {
        const docRef = doc(
          db,
          "listings",
          slug
        );

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setItem({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.error(error);
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
      {item.imageUrl && (
        <img
          src={item.imageUrl}
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
        {item.description}
      </p>

      <div className="mt-6 flex gap-4">
        <a
          href={`https://wa.me/${item.phone}`}
          target="_blank"
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          WhatsApp Seller
        </a>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
          Call Seller
        </button>
      </div>
    </div>
  );
}
