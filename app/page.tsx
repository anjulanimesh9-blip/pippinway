"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";




export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] =
  useState("All");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] =
  useState("");

const [maxPrice, setMaxPrice] =
  useState("");

useEffect(() => {
  fetchListings();

  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
}, []);

  const fetchListings = async () => {
    const querySnapshot = await getDocs(
      collection(db, "listings")
    );

    const data: any[] = [];

    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    setListings(data);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-6 flex justify-between items-center">
  {user ? (
    <>
      <p className="font-semibold">
        Welcome, {user.email}
      </p>

      <button
        onClick={() => signOut(auth)}
        className="bg-black text-white px-4 py-2 rounded-xl"
      >
        Logout
      </button>
    </>
  ) : (
    <p>Not logged in</p>
  )}
</div>

<section className="max-w-7xl mx-auto py-16 px-4">

 <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <h1 className="text-4xl font-bold">
      Latest Listings
    </h1>

  </div>
<div className="flex gap-4 flex-wrap mb-6">
  <select
  value={selectedCountry}
  onChange={(e) =>
    setSelectedCountry(e.target.value)
  }
  className="p-3 border rounded-xl w-[147px]"
>
  <option value="">All Countries</option>
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
  <input
    type="text"
    placeholder="Filter by location"
    value={locationFilter}
    onChange={(e) =>
      setLocationFilter(
        e.target.value
      )
    }
    className="p-3 border rounded-xl"
  />

  <input
    type="number"
    placeholder="Max price"
    value={maxPrice}
    onChange={(e) =>
      setMaxPrice(
        e.target.value
      )
    }
    className="p-3 border rounded-xl"
  />
</div>
  <div className="flex gap-3 mb-8 flex-wrap">
  {[
    "All",
    "Electronics",
    "Vehicles",
    "Property",
    "Fashion",
    "Jobs",
  ].map((cat) => (
    <button
      key={cat}
      onClick={() =>
        setSelectedCategory(cat)
      }
      className={`px-4 py-2 rounded-xl border ${
        selectedCategory === cat
          ? "bg-black text-white"
          : "bg-white"
      }`}
    >
      {cat}
    </button>
  ))}
</div>
<div className="grid md:grid-cols-4 gap-6">
          {listings
.filter((item) => {
  const matchCountry =
  selectedCountry === ""
    ? true
    : item.country ===
      selectedCountry;
  const matchCategory =
    selectedCategory === "All"
      ? true
      : item.category ===
        selectedCategory;

  const matchSearch =
    item.title
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      );

  const matchLocation =
    item.location
      ?.toLowerCase()
      .includes(
        locationFilter.toLowerCase()
      );

  const matchPrice =
    maxPrice === ""
      ? true
      : Number(item.price) <=
        Number(maxPrice);

return (
  matchCategory &&
  matchSearch &&
  matchLocation &&
  matchPrice &&
  matchCountry
);
})
  .map((item) => (
            <Link
             href={`/listings/${item.id}`}
              key={item.id}
              className="bg-white rounded-2xl shadow p-5 block"
            >
              {item.imageUrl && (
  <img
    src={item.imageUrl}
    alt={item.title}
    className="w-full h-52 object-cover rounded-xl mb-4"
  />
)}
              <h2 className="text-2xl font-bold mb-3">
                {item.title}
              </h2>
              <p className="text-sm text-blue-600 mb-2">
  {item.category}
</p>

              <p className="text-gray-600 mb-2">
                {item.location}
              </p>

              <p className="text-2xl font-bold">
                Rs. {item.price}
              </p>

              <p className="text-gray-500 mt-4">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
