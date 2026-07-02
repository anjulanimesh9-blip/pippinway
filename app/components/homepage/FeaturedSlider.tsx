"use client";

import Image from "next/image";
import Link from "next/link";

const featuredAds = [
  {
    id: 1,
    title: "BMW X5 2022",
    price: "$48,000",
    location: "Harare",
    image: "/images/car.jpg",
  },
  {
    id: 2,
    title: "Luxury House",
    price: "$180,000",
    location: "Colombo",
    image: "/images/house.jpg",
  },
  {
    id: 3,
    title: "iPhone 16 Pro",
    price: "$1,100",
    location: "Toronto",
    image: "/images/iphone.jpg",
  },
  {
    id: 4,
    title: "Gaming Laptop",
    price: "$950",
    location: "Singapore",
    image: "/images/laptop.jpg",
  },
];

export default function FeaturedSlider() {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-6">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">
          ⭐ Featured Ads
        </h2>

        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300"
        >
          View All →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {featuredAds.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] transition hover:scale-[1.03] hover:border-purple-500"
          >
            <div className="relative h-52">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-5">

              <h3 className="text-lg font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-purple-400 font-semibold">
                {item.price}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                📍 {item.location}
              </p>

            </div>
          </div>
        ))}

      </div>

    </section>
  );
}