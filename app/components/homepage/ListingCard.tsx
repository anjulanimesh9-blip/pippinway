"use client";

import Image from "next/image";
import Link from "next/link";

type ListingCardProps = {
  image: string;
  title: string;
  price: string;
  location: string;
  category: string;
};

export default function ListingCard({
  image,
  title,
  price,
  location,
  category,
}: ListingCardProps) {
  return (
    <Link
      href="/"
      className="group overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] transition duration-300 hover:-translate-y-1 hover:border-purple-500"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute left-3 top-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
          {category}
        </div>
      </div>

      <div className="p-5">

        <h3 className="line-clamp-2 text-lg font-bold text-white">
          {title}
        </h3>

        <p className="mt-3 text-2xl font-bold text-purple-400">
          {price}
        </p>

        <p className="mt-3 text-sm text-slate-400">
          📍 {location}
        </p>

      </div>
    </Link>
  );
}