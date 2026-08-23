"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGES_MESSAGE,
} from "@/lib/listingImages";
import { compressListingImage } from "@/lib/compressImage";
import { parseListingPrice } from "@/lib/formatPrice";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const slug =
    params?.slug as string;

  const [title, setTitle] =
    useState("");
  const [price, setPrice] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [imageUrls, setImageUrls] =
    useState<string[]>([]);
  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

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

        if (
          docSnap.exists()
        ) {
          const data =
            docSnap.data();

          setTitle(
            data.title || ""
          );
          setPhone(
            data.phone || ""
          );
          setPrice(
            data.price || ""
          );
          setDescription(
            data.description || ""
          );

          setImageUrls(
            (data.imageUrls ||
              (data.imageUrl
                ? [
                    data.imageUrl,
                  ]
                : [])).slice(0, MAX_LISTING_IMAGES)
          );
        }
      };

    if (slug)
      fetchListing();
  }, [slug]);

  const handleUpdate =
    async () => {
      try {
        let updatedImages =
          [...imageUrls];

        // upload new images
        if (
          imageFiles.length >
          0
        ) {
          updatedImages =
            [];

          for (
            const image of imageFiles
          ) {
            const compressed =
              await compressListingImage(
                image
              );
            const imageRef =
              ref(
                storage,
                `listings/${Date.now()}-${compressed.name}`
              );

            await uploadBytes(
              imageRef,
              compressed
            );

            updatedImages.push(
              await getDownloadURL(
                imageRef
              )
            );
          }
        }

        const docRef = doc(
          db,
          "listings",
          slug
        );

        await updateDoc(
          docRef,
          {
            title,
            price: parseListingPrice(price),
            description,
            phone,
            imageUrls:
              updatedImages.slice(0, MAX_LISTING_IMAGES),
            imageUrl:
              updatedImages[0],
            imagesCompressed: true,
          }
        );

        alert(
          "Updated Successfully!"
        );

        router.push(
          `/listings/${slug}`
        );

      } catch (error) {
        console.error(
          error
        );

        alert(
          "Update failed!"
        );
      }
    };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-2xl mx-auto bg-[#0b0b0b] border border-gray-800 rounded-[30px] p-6 shadow-2xl">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-2xl text-sm"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-6">
          Edit Listing
        </h1>

        {/* Current Photos */}
        <div className="grid grid-cols-2 gap-3 mb-5">
  {imageUrls.map((image, index) => (
    <div key={index} className="relative">
      <img
        src={image}
        alt="Listing"
        className="w-full h-40 object-cover rounded-2xl border border-gray-700"
      />

      <button
        type="button"
        onClick={() =>
          setImageUrls(
            imageUrls.filter((_, i) => i !== index)
          )
        }
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white w-8 h-8 rounded-full"
      >
        ✕
      </button>
    </div>
  ))}
</div>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="w-full bg-[#111] border border-gray-700 text-white p-4 rounded-2xl mb-4"
        />

        <input
          type="text"
          placeholder="WhatsApp Number"
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value
            )
          }
          className="w-full bg-[#111] border border-gray-700 text-white p-4 rounded-2xl mb-4"
        />

        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) =>
            setPrice(
              e.target.value
            )
          }
          className="w-full bg-[#111] border border-gray-700 text-white p-4 rounded-2xl mb-4"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="w-full bg-[#111] border border-gray-700 text-white p-4 rounded-2xl mb-4 h-32"
        />

        <div className="mb-5">
          <label className="block mb-2 text-sm text-gray-400">
            Upload up to {MAX_LISTING_IMAGES} new photos
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              let files =
                Array.from(
                  e.target
                    .files || []
                );

              if (
                files.length >
                MAX_LISTING_IMAGES
              ) {
                alert(
                  MAX_LISTING_IMAGES_MESSAGE
                );
                files = files.slice(
                  0,
                  MAX_LISTING_IMAGES
                );
                e.target.value = "";
              }

              if (files.length === 0) {
                return;
              }

              setImageFiles(
                files
              );
            }}
            className="w-full bg-[#111] border border-gray-700 text-white p-4 rounded-2xl"
          />
        </div>

        <button
          onClick={
            handleUpdate
          }
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}