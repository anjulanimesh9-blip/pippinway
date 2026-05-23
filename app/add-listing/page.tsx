"use client";

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AddListingPage() {
  const [phone, setPhone] =
  useState("");
  const [country, setCountry] =
    useState("");
    const [errors, setErrors] =
  useState<any>({});

  const router = useRouter();

  useEffect(() => {
    const unsubscribe =
      auth.onAuthStateChanged(
        (user) => {
          if (!user) {
            router.push("/login");
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const loadUserData =
      async () => {
        const user =
          auth.currentUser;

        if (!user) return;

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        const userSnap =
          await getDoc(userRef);

        if (
          userSnap.exists()
        ) {
          const data =
            userSnap.data();

          setPhone(
            data.phone || ""
          );

          setCountry(
            data.country || ""
          );
        }
      };

    loadUserData();
  }, []);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<any>(null);
 const [category, setCategory] = useState("");
const handleSubmit = async (
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

  if (!image)
    newErrors.image =
      true;

  setErrors(newErrors);

  if (
    Object.keys(
      newErrors
    ).length > 0
  ) {
    return;
  }

  try {
    let imageUrl = "";

    if (image) {
      const formData =
        new FormData();

      formData.append(
        "file",
        image
      );

      const uploadRes =
        await fetch(
          "/api/upload",
          {
            method:
              "POST",
            body:
              formData,
          }
        );

      const uploadData =
        await uploadRes.json();

      imageUrl =
        uploadData.filePath;
    }

    await addDoc(
      collection(
        db,
        "listings"
      ),
      {
        title,
        price,
        location,
        category,
        country,
        description,
        imageUrl,
        phone,
        ownerEmail:
          auth
            .currentUser
            ?.email,
        createdAt:
          new Date(),
      }
    );

    router.push(
      "/profile"
    );
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-2xl mx-auto bg-[#0f172a] border border-gray-800 p-8 rounded-[30px] shadow-xl text-[#111827] text-[#111827] text-white">
        <h1 className="text-4xl font-bold mb-8 text-[#111827] text-[#111827] text-white">
          Add New Listing
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
  <label className="block mb-2 font-semibold">
    Product Title
  </label>

  <input
    type="text"
    placeholder="Enter product title"
    value={title}
    onChange={(e) =>
      setTitle(e.target.value)
    }
    className={`w-full p-3 rounded-xl border ${
  errors.title
    ? "border-red-500"
    : "border-gray-300"
}`}
  />
</div>

<div>
  <label className="block mb-2 font-semibold">
    Price
  </label>

  <input
    type="text"
    placeholder="Enter price"
    value={price}
    onChange={(e) =>
      setPrice(e.target.value)
    }
   className={`w-full p-3 rounded-xl border ${
  errors.price
    ? "border-red-500"
    : "border-gray-300"
}`}
  />
</div>
<div className="mb-4">
  <label className="block mb-2 font-semibold">
    Country
  </label>
<select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  className={`w-full p-3 rounded-xl border ${
  errors.country
    ? "border-red-500"
    : "border-gray-300"
}`}
>
  <option value="">Select Country</option>
  <option value="Singapore">Singapore</option>
  <option value="India">India</option>
  <option value="Thailand">Thailand</option>
  <option value="Zimbabwe">Zimbabwe</option>
  <option value="USA">USA</option>
  <option value="Maldives">Maldives</option>
  <option value="Sri Lanka">Sri Lanka</option>
  <option value="South Africa">South Africa</option>
  <option value="United Kingdom">United Kingdom</option>
  <option value="Canada">Canada</option>
</select>
  
</div>
<div>
  <label className="block mb-2 font-semibold">
    Location
  </label>

  <input
    type="text"
    placeholder="Enter location"
    value={location}
    onChange={(e) =>
      setLocation(e.target.value)
    }
    className={`w-full p-3 rounded-xl border ${
  errors.location
    ? "border-red-500"
    : "border-gray-300"
}`}
  />
</div>

<div>
  <label className="block mb-2 font-semibold">
    WhatsApp Number
  </label>

  <input
    type="text"
    placeholder="WhatsApp Number"
    value={phone}
    onChange={(e) =>
      setPhone(e.target.value)
    }
    className={`w-full p-3 rounded-xl border ${
  errors.phone
    ? "border-red-500"
    : "border-gray-300"
}`}
  />
</div>
          
          <div className="mb-6">
  <label className="block mb-2 font-semibold">
    Category
  </label>

  <select
    value={category}
    onChange={(e) =>
      setCategory(e.target.value)
    }
    className={`w-full p-4 rounded-xl border ${
  errors.category
    ? "border-red-500"
    : "border-gray-300"
}`}
  >
    <option value="">
      Select Category
    </option>

    <option value="Electronics">
      Electronics
    </option>

    <option value="Vehicles">
      Vehicles
    </option>

    <option value="Property">
      Property
    </option>

    <option value="Fashion">
      Fashion
    </option>

    <option value="Jobs">
      Jobs
    </option>
  </select>
</div>

          <div>
            <label className="block mb-2 font-semibold">
              Description
            </label>
            <input
  type="file"
  onChange={(e) =>
    setImage(e.target.files?.[0])
  }
  className={`w-full p-3 rounded-xl mb-4 border ${
  errors.image
    ? "border-red-500"
    : "border-gray-300"
}`}
/>

            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className={`w-full p-4 rounded-xl h-40 border ${
  errors.description
    ? "border-red-500"
    : "border-gray-300"
}`}
            />
          </div>
<Link href="/">
  <button
    type="button"
    style={{
      padding: "10px 15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      background: "[#111827] text-[#111827] text-white",
      cursor: "pointer",
    }}
  >
    🏠 Back to Home
  </button>
</Link>

<button className="bg-black text-[#111827] text-[#111827] text-white px-8 py-3 rounded-xl">
  Post Listing
</button>
        </form>
      </div>
    </div>
  );
}