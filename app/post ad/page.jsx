"use client";

import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "iPhone 14 Pro",
    price: "$900",
    location: "Harare",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    id: 2,
    title: "Honda Fit",
    price: "$6500",
    location: "Bulawayo",
    category: "Cars",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  },
];

export default function Home() {
  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">
        Latest Listings
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search listings..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full border p-4 rounded-xl mb-6"
      />

      {/* Category Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          "All",
          "Cars",
          "Electronics",
        ].map((category) => (
          <button
            key={category}
            onClick={() =>
              setSelectedCategory(
                category
              )
            }
            className={`px-4 py-2 rounded-xl border ${
              selectedCategory ===
              category
                ? "bg-blue-600 text-white"
                : "bg-white text-black"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings
          .filter((item) => {
            const matchesCategory =
              selectedCategory ===
              "All"
                ? true
                : item.category ===
                  selectedCategory;

            const matchesSearch =
              item.title
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            return (
              matchesCategory &&
              matchesSearch
            );
          })
          .map((item) => (
            <div
              key={item.id}
              className="border rounded-xl overflow-hidden shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-52 object-cover"
              />

              <div className="p-4">
                <h2 className="text-xl font-semibold">
                  {item.title}
                </h2>

                <p className="text-lg font-bold mt-2">
                  {item.price}
                </p>

                <p className="text-gray-500">
                  {item.location}
                </p>

                <p className="text-sm text-blue-500 mt-2">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}