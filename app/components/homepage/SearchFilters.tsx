"use client";

export default function SearchFilters() {
  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-slate-700 bg-[#0b1220] p-6 shadow-xl">

        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Find Your Perfect Item
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search anything..."
            className="h-14 rounded-xl border border-slate-600 bg-[#111827] px-4 text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />

          {/* Category */}
          <select className="h-14 rounded-xl border border-slate-600 bg-[#111827] px-4 text-white focus:border-blue-500 focus:outline-none">
            <option>All Categories</option>
            <option>Cars</option>
            <option>Property</option>
            <option>Electronics</option>
            <option>Jobs</option>
            <option>Fashion</option>
            <option>Services</option>
            <option>Animals</option>
            <option>Furniture</option>
            <option>Education</option>
          </select>

          {/* Country */}
          <select className="h-14 rounded-xl border border-slate-600 bg-[#111827] px-4 text-white focus:border-blue-500 focus:outline-none">
            <option>All Countries</option>
            <option>Sri Lanka</option>
            <option>Zimbabwe</option>
            <option>USA</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>India</option>
            <option>Singapore</option>
            <option>Thailand</option>
            <option>South Africa</option>
            <option>Maldives</option>
          </select>

          {/* Location */}
          <input
            type="text"
            placeholder="📍 Location"
            className="h-14 rounded-xl border border-slate-600 bg-[#111827] px-4 text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />

          {/* Button */}
          <button className="h-14 rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-500">
            Search
          </button>

        </div>

        {/* Popular Searches */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-300">
            Popular:
          </span>

          {[
            "Cars",
            "Property",
            "Jobs",
            "iPhone",
            "Laptop",
            "House",
            "Motorbike",
            "Fashion",
          ].map((item) => (
            <button
              key={item}
              className="rounded-full border border-slate-600 bg-[#111827] px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}