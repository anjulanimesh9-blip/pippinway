"use client";

const categories = [
  "All Categories",
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
];

const countries = [
  "All Countries",
  "Sri Lanka",
  "Zimbabwe",
  "India",
  "Singapore",
  "United Kingdom",
  "USA",
  "Canada",
];

const popularSearches = [
  "Phone",
  "Cars",
  "Laptop",
  "House",
  "Jobs",
  "Motorbike",
];

export default function Hero() {
  return (
    <section className="relative min-h-[720px] lg:min-h-[760px] overflow-hidden">

      {/* Background Image */}

      <img
        src="/images/hero-bg.jpg"
        alt="Hero"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-black/50" />

      {/* Gradient */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#030712]" />

      {/* Content */}

     <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl flex-col items-center justify-start pt-24 py-2.5 text-center">
              
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
          🌍 Global Marketplace
        </span>

        <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white lg:text-6xl">

          Find Great Deals

          <span className="mt-2 block text-purple-400">
            Anywhere in the World
          </span>

        </h1>
                      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">

          Buy, sell and connect with people around the world on

          <span className="font-semibold text-white">
            {" "}Pippinway.
          </span>

        </p>

           {/* ================= Search Box ================= */}

        <div className="mt-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-2xl shadow-2xl">

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

            {/* Search */}

            <input
              type="text"
              placeholder="What are you looking for?"
              className="h-12 rounded-xl border border-white/10 bg-[#111827]/90 px-4 text-white placeholder:text-slate-400 outline-none transition focus:border-purple-500"
            />

            {/* Category */}

            <select
              className="h-12 rounded-xl border border-white/10 bg-[#111827]/90 px-4 text-white outline-none transition focus:border-purple-500"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            {/* Country */}

            <select
              className="h-12 rounded-xl border border-white/10 bg-[#111827]/90 px-4 text-white outline-none transition focus:border-purple-500"
            >
              {countries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            {/* Location */}

            <input
              type="text"
              placeholder="Location"
              className="h-12 rounded-xl border border-white/10 bg-[#111827]/90 px-4 text-white placeholder:text-slate-400 outline-none transition focus:border-purple-500"
            />

            {/* Button */}

            <button
              className="h-12 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
            >
              🔍 Search
            </button>

          </div>

        </div>

        {/* Popular Searches */}

        <div className="mt-8 flex flex-wrap justify-center gap-3">

          {[
            "Phone",
            "Cars",
            "Laptop",
            "House",
            "Jobs",
            "Motorbike",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-purple-600 transition"
            >
              {item}
            </span>
          ))}

        </div>

      </div>

    </section>
  );
}