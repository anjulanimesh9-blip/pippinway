"use client";

import {
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  addDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  db,
  auth,
  storage,
} from "../firebase";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGES_MESSAGE,
} from "@/lib/listingImages";
import { compressListingImage } from "@/lib/compressImage";
import { applyCountryCallingCode } from "@/lib/countryCallingCodes";
import { parseListingPrice } from "@/lib/formatPrice";

export default function AddListing() {
  const router =
    useRouter();

const [checkingAuth, setCheckingAuth] =
  useState(true);

  const [title, setTitle] =
    useState("");
  const [price, setPrice] =
    useState("");
  const [country, setCountry] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [
    description,
    setDescription,
  ] = useState("");

  const [images, setImages] =
    useState<File[]>(
      []
    );
    const [loading, setLoading] =
  useState(false);

  const [errors, setErrors] =
    useState<any>({});
  const [previewImage, setPreviewImage] =
  useState<string | null>(null);
  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {
  if (!currentUser) {
    router.push("/login");
    return;
  }

  setCheckingAuth(false);
}
    );

  return () => unsubscribe();
}, [router]);

    useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (
        user
      ) => {
        if (!user)
          return;

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
          userSnap.exists()
        ) {
          const userData =
            userSnap.data();

          setCountry(
            userData.country ||
              ""
          );

          setPhone(
            userData.phone ||
              ""
          );
        }
      }
    );

  return () =>
    unsubscribe();
}, []);
if (checkingAuth) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );
}
  const handleSubmit =
    async (
      e: any
    ) => {
      e.preventDefault();

      const newErrors: any =
        {};

      if (!title)
        newErrors.title =
          true;

      if (!price)
        newErrors.price =
          true;

      if (!country)
        newErrors.country =
          true;

      if (!location)
        newErrors.location =
          true;

      if (!phone)
        newErrors.phone =
          true;

      if (!category)
        newErrors.category =
          true;

      if (!description)
        newErrors.description =
          true;

    const listingImages = images.filter(
      (image): image is File => image instanceof File
    );

    if (
      listingImages.length === 0 ||
      listingImages.length > MAX_LISTING_IMAGES
    ) {
  newErrors.image = true;
}

      setErrors(
        newErrors
      );

      if (
        Object.keys(
          newErrors
        ).length > 0
      ) {
        return;
      }

      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      setLoading(true);

try {
  let imageUrls:
    string[] = [];

  for (
    const image of listingImages
  ) {
    const compressed = await compressListingImage(image);
    const imageRef =
      ref(
        storage,
        `listings/${Date.now()}-${compressed.name}`
      );

    await uploadBytes(
      imageRef,
      compressed
    );

    const downloadURL =
      await getDownloadURL(
        imageRef
      );

    imageUrls.push(
      downloadURL
    );
  }

const userRef = doc(
  db,
  "users",
  user.uid
);

const userSnap =
  await getDoc(
    userRef
  );

const userData =
  userSnap.data();

const expiresAt = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);

await addDoc(
  collection(db, "listings"),
  {
    title,
    price: parseListingPrice(price),
    country,
    location,
    category,
    phone,
    description,
    imageUrls: imageUrls.slice(0, MAX_LISTING_IMAGES),
    imageUrl: imageUrls[0],

    ownerId: user.uid,
    ownerEmail: user.email,
    ownerName:
      userData?.displayName ||
      user.displayName ||
      "Private Seller",

    createdAt: new Date(),

    featured: false,
    approved: false,
    rejected: false,
    rewardCounted: false,
    adType: "free",

    expiresAt,
    expiryDate: expiresAt,

    expired: false,
    imagesCompressed: true,
  }
);

  router.push(
    "/profile"
  );

} catch (error) {
  console.error(
    error
  );

  const firebaseError = error as {
    code?: string;
    message?: string;
  };
  const detail = [
    firebaseError?.message,
    firebaseError?.code
      ? `(${firebaseError.code})`
      : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  alert(
    detail || "Upload failed"
  );
} finally {
  setLoading(false);
}
    };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.08)] p-6 md:p-10">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 border border-gray-700 px-4 py-2 rounded-2xl"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-6">
          Add Listing
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
           onChange={(e) => {
  setTitle(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      title: false,
    }));
  }
}}
           className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.title
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
          />

          <input
            type="text"
            placeholder="Price"
            value={price}
           onChange={(e) => {
  setPrice(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      price: false,
    }));
  }
}}
            className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.price
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
            />

         <select
  value={country}
onChange={(e) => {
  const selectedCountry = e.target.value;

  setCountry(selectedCountry);
  setPhone((prev) =>
    applyCountryCallingCode(prev, selectedCountry)
  );

  setErrors((prev: any) => ({
    ...prev,
    country: false,
  }));

 }}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.country
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
>
  <option value="">
    Select Country
  </option>
  <option value="Singapore">
    Singapore
  </option>
  <option value="India">
    India
  </option>
  <option value="Thailand">
    Thailand
  </option>
  <option value="Zimbabwe">
    Zimbabwe
  </option>
  <option value="USA">
    USA
  </option>
  <option value="Maldives">
    Maldives
  </option>
  <option value="Sri Lanka">
    Sri Lanka
  </option>
  <option value="South Africa">
    South Africa
  </option>
  <option value="United Kingdom">
    United Kingdom
  </option>
  <option value="Canada">
    Canada
  </option>
</select>
           
          <input
            type="text"
            placeholder="City / Location"
            value={
              location
            }
          onChange={(e) => {
  setLocation(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      location: false,
    }));
  }
}}
 className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.location
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
            />

       <input
  type="text"
  placeholder="WhatsApp Number (e.g. +91 9876543210)"
  value={phone}
  onChange={(e) => {
  setPhone(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      phone: false,
    }));
  }
}}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-1 transition ${
  errors.phone
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
/>

<p className="text-xs text-gray-400 mb-4 ml-2">
  Example: +91 9876543210
</p>

          <select
  value={category}
  onChange={(e) => {
  setCategory(e.target.value);

  setErrors((prev: any) => ({
    ...prev,
    category: false,
  }));
}}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.category
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
  >
  <option value="">
    Select Category
  </option>

  <option value="Cars">
    🚗 Cars
  </option>

  <option value="Motorbikes">
    🏍️ Motorbikes
  </option>

  <option value="Property">
    🏠 Property
  </option>

  <option value="Electronics">
    📱 Electronics
  </option>

  <option value="Fashion">
    👕 Fashion
  </option>

  <option value="Jobs">
    💼 Jobs
  </option>

  <option value="Services">
    🛠️ Services
  </option>

  <option value="Animals">
    🐶 Animals
  </option>

  <option value="Furniture">
    🛋️ Furniture
  </option>

  <option value="Education">
    📚 Education
  </option>

  <option value="Other">
    📦 Other
  </option>
</select>

          <textarea
            placeholder="Description"
            value={
              description
            }
           onChange={(e) => {
  setDescription(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      description: false,
    }));
  }
}}
        className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 h-36 transition ${
  errors.description
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
          />
<div className="space-y-3 mb-5">
  <p className="text-xs text-gray-400">
    Maximum {MAX_LISTING_IMAGES} photos
  </p>
  {Array.from({ length: MAX_LISTING_IMAGES }, (_, i) => i + 1).map((num, index) => (
    <div
      key={num}
      className={`relative bg-[#0b1120] rounded-[24px] p-5 ${
        errors.image
          ? "border border-red-500"
          : "border border-blue-900/30"
      }`}
    >
      <label className="block text-sm text-gray-300 mb-2">
        Photo {num}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (!picked) return;

          const filled = images.filter(Boolean).length;
          const replacing = Boolean(images[index]);
          if (!replacing && filled >= MAX_LISTING_IMAGES) {
            e.target.value = "";
            alert(MAX_LISTING_IMAGES_MESSAGE);
            return;
          }

          const newImages = [...images];
          newImages[index] = picked;

          setImages([...newImages]);

          if (
            newImages.filter(Boolean).length > 0 &&
            newImages.filter(Boolean).length <= MAX_LISTING_IMAGES
          ) {
            setErrors((prev: any) => ({
              ...prev,
              image: false,
            }));
          }
        }}
        className="w-full text-sm"
      />

      {images[index] && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-green-500">

          {index === 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded z-10">
              ⭐ Cover Photo
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const newImages = [...images];
              newImages[index] = undefined as any;
              setImages([...newImages]);
            }}
            className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full z-10"
          >
            ✕
          </button>

          <img
            src={URL.createObjectURL(images[index])}
            alt={`Photo ${num}`}
            onClick={() =>
              setPreviewImage(
                URL.createObjectURL(images[index])
              )
            }
            className="w-full h-40 object-cover cursor-pointer"
          />

          <div className="p-2 bg-black/30">
            <p className="text-green-400 text-xs truncate">
              ✅ {images[index].name}
            </p>
          </div>

        </div>
      )}
    </div>
  ))}

  {errors.image && (
    <p className="text-red-500 text-sm mt-2 text-center">
      Please upload up to {MAX_LISTING_IMAGES} photos
    </p>
  )}
</div>

          <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition text-white font-bold py-4 rounded-[24px] text-lg shadow-lg disabled:opacity-60"
>
  {loading
    ? "Uploading..."
    : "Post Listing"}
</button>
{previewImage && (
  <div
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      alt="Preview"
      className="max-w-[90%] max-h-[90%] rounded-xl"
    />
  </div>
)}
        </form>
      </div>
    </div>
  );
}
