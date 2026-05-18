"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  useParams,
  useRouter,
} from "next/navigation";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [title, setTitle] =
    useState("");
  const [price, setPrice] =
    useState("");
  const [description, setDescription] =
    useState("");
   const [phone, setPhone] =
  useState(""); 

  useEffect(() => {
    const fetchListing =
      async () => {
        const docRef = doc(
          db,
          "listings",
          slug
        );

        const docSnap =
          await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setTitle(data.title || "");
          setPhone(data.phone || "");
          setPrice(data.price || "");
          setDescription(
            data.description || ""
          );
        }
      };

    if (slug) fetchListing();
  }, [slug]);

  const handleUpdate =
    async () => {
      const docRef = doc(
        db,
        "listings",
        slug
      );

      await updateDoc(docRef, {
        title,
        price,
        description,
        phone,
      });

      alert("Updated!");

      router.push(
        `/listings/${slug}`
      );
    };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Listing
      </h1>
<input
  type="text"
  placeholder="Title"
  value={title}
  onChange={(e) =>
    setTitle(e.target.value)
  }
  className="w-full border p-3 rounded-xl mb-4"
/>

<input
  type="text"
  placeholder="WhatsApp Number"
  value={phone}
  onChange={(e) =>
    setPhone(e.target.value)
  }
  className="w-full border p-3 rounded-xl mb-4"
/>

<input
  type="text"
  placeholder="Price"
  value={price}
  onChange={(e) =>
    setPrice(e.target.value)
  }
  className="w-full border p-3 rounded-xl mb-4"
/>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        className="w-full border p-3 rounded-xl mb-4"
      />

      <button
        onClick={handleUpdate}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Save Changes
      </button>
    </div>
  );
}