"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useParams, useRouter } from "next/navigation";


export default function ListingDetails() {

  const [item, setItem] = useState<any>(null);
  const currentUser = auth.currentUser;
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  

  const handleDelete = async () => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this listing?"
  );

  if (!confirmDelete) return;

  await deleteDoc(doc(db, "listings", slug));

  alert("Listing deleted!");
  router.push("/");
};
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
      <button
  onClick={() => router.push("/")}
  className="mb-6 bg-black text-white px-5 py-2 rounded-xl"
>
  ← Back to Home
</button>
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

  {currentUser?.email === item.ownerEmail && (
    <>
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-6 py-3 rounded-xl"
      >
        Delete Listing
      </button>

      <button
        onClick={() =>
          router.push(`/edit/${slug}`)
        }
        className="bg-yellow-500 text-white px-6 py-3 rounded-xl"
      >
        Edit Listing
      </button>
    </>
  )}
</div>
    </div>
  );
}