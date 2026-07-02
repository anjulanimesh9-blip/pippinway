"use client";

import ListingCard from "./ListingCard";

const listings = [
  {
    image: "/images/car.jpg",
    title: "BMW X5 2022",
    price: "$48,000",
    location: "Harare",
    category: "Cars",
  },
  {
    image: "/images/house.jpg",
    title: "Luxury House",
    price: "$180,000",
    location: "Colombo",
    category: "Property",
  },
  {
    image: "/images/laptop.jpg",
    title: "Gaming Laptop",
    price: "$950",
    location: "Singapore",
    category: "Electronics",
  },
  {
    image: "/images/iphone.jpg",
    title: "iPhone 16 Pro",
    price: "$1,100",
    location: "Toronto",
    category: "Electronics",
  },
];

export default function ListingGrid() {
  return (
    <section>

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-3xl font-bold text-white">
          Latest Listings
        </h2>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">

        {listings.map((item, index) => (
          <ListingCard
            key={index}
            {...item}
          />
        ))}

      </div>

    </section>
  );
}