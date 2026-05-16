"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function AddListingPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<any>(null);
 const [category, setCategory] = useState("");
const [phone, setPhone] = useState("");
 const handleSubmit = async (e: any) => {
  e.preventDefault();

 try {
    let imageUrl = "";

    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      imageUrl = uploadData.filePath;
    }

    await addDoc(collection(db, "listings"), {
      title,
      price,
      location,
      category,
      description,
      imageUrl,
      phone,
      createdAt: new Date(),
    });

    alert("Listing added successfully!");

    setTitle("");
    setPrice("");
    setLocation("");
    setDescription("");
    setImage(null);
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-4xl font-bold mb-8">
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
    className="w-full border p-3 rounded-xl"
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
    className="w-full border p-3 rounded-xl"
  />
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
    className="w-full border p-3 rounded-xl"
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
    className="w-full border p-3 rounded-xl"
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
    className="w-full border p-4 rounded-xl"
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
  className="w-full border p-3 rounded-xl mb-4"
/>

            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full border p-4 rounded-xl h-40"
            />
          </div>

          <button className="bg-black text-white px-8 py-3 rounded-xl">
            Post Listing
          </button>
        </form>
      </div>
    </div>
  );
}