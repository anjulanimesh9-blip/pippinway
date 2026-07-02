"use client";

import Link from "next/link";

const categories = [
  "🌍 All Categories",
  "🚗 Cars",
  "🏍️ Motorbikes",
  "🏠 Property",
  "📱 Electronics",
  "👕 Fashion",
  "💼 Jobs",
  "🛠️ Services",
  "🐘 Animals",
  "🛋️ Furniture",
  "📚 Education",
  "📦 Other",
];

const countries = [
  "All Countries",
  "Singapore",
  "India",
  "Thailand",
  "Zimbabwe",
  "USA",
  "Maldives",
  "Sri Lanka",
  "South Africa",
  "United Kingdom",
  "Canada",
];

export default function Hero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden rounded-3xl">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/banner-ad-3.jpg"
          alt="Pippinway"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">

        <div className="flex justify-center">
  <span className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
    🌍 Global Marketplace
  </span>

         <h1 className="mt-8 text-center text-5xl font-extrabold leading-tight text-white lg:text-7xl">
            Buy, Sell &
            <span className="block text-blue-400">
              Discover Everything
            </span>
          </h1>

         <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-slate-300">
            Buy and sell vehicles, electronics, property, jobs, fashion and
            services anywhere in the world with Pippinway.
          </p>

          {/* Search */}

       <div className="mx-auto mt-10 max-w-4xl rounded-3xl bg-slate-900/80 p-6 backdrop-blur shadow-2xl">

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

  {/* Search */}
  <input
    type="text"
    placeholder="Search..."
    className="h-14 rounded-xl bg-slate-800 px-4 text-white outline-none"
  />

  {/* Location */}
  <input
    type="text"
    placeholder="Location"
    className="h-14 rounded-xl bg-slate-800 px-4 text-white outline-none"
  />

  {/* Category */}
  <select className="h-14 rounded-xl bg-slate-800 px-4 text-white">
    {categories.map((category) => (
      <option key={category}>{category}</option>
    ))}
  </select>

  {/* Country */}
  <select className="h-14 rounded-xl bg-slate-800 px-4 text-white">
    {countries.map((country) => (
      <option key={country}>{country}</option>
    ))}
  </select>

  {/* Button */}
  <button className="md:col-span-2 h-14 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500">
    🔍 Search
  </button>

</div>

</div>

          

          {/* Buttons */}

         <div className="mt-10 flex justify-center gap-4">

            <Link
              href="/add-listing"
              className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500"
            >
              Post Free Ad
            </Link>

            <Link
              href="/listings"
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white"
            >
              Browse Ads
            </Link>

          </div>

          {/* Stats */}

         <div className="mx-auto mt-14 grid max-w-4xl grid-cols-3 gap-5">

            <div className="rounded-2xl bg-slate-900/70 p-6 text-center backdrop-blur">
              <h3 className="text-3xl font-bold text-white">50K+</h3>
              <p className="text-slate-400">Users</p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-6 text-center backdrop-blur">
              <h3 className="text-3xl font-bold text-white">10K+</h3>
              <p className="text-slate-400">Listings</p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-6 text-center backdrop-blur">
              <h3 className="text-3xl font-bold text-white">24/7</h3>
              <p className="text-slate-400">Support</p>
            </div>

          </div>

        </div>
</div>
    </section>
  );
}