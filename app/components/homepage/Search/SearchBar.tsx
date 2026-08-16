"use client";

import { Search, MapPin } from "lucide-react";

const CATEGORIES = [
  "All",
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
  "Animals",
  "Furniture",
  "Education",
  "Other",
];

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
};

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedCategory,
  setSelectedCategory,
  location,
  setLocation,
  sortBy,
  setSortBy,
}: SearchBarProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-3 md:p-4 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_1fr_auto] gap-2 md:gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
        >
          <option value="All">All Countries</option>
          <option value="Zimbabwe">Zimbabwe</option>
          <option value="Sri Lanka">Sri Lanka</option>
          <option value="India">India</option>
          <option value="Singapore">Singapore</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="Thailand">Thailand</option>
          <option value="Maldives">Maldives</option>
          <option value="South Africa">South Africa</option>
        </select>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search ads..."
          className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none"
        />

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full rounded-xl border border-white/10 bg-[#111827] pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      <div className="mt-2 flex justify-end md:hidden">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs text-white outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="low-price">Lowest Price</option>
          <option value="high-price">Highest Price</option>
        </select>
      </div>
    </section>
  );
}
