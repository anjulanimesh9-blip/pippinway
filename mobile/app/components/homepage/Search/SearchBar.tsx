"use client";

import { Search, MapPin, Globe, ArrowUpDown } from "lucide-react";

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
};

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  sortBy,
  setSortBy,
}: SearchBarProps) {
  return (
    <section className="space-y-4">

      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 shadow-lg">
        <Search className="w-5 h-5 text-gray-400" />

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What are you looking for?"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
        />

        <button className="rounded-xl bg-blue-600 p-2 hover:bg-blue-500 transition">
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
          <Globe className="w-5 h-5 text-blue-400" />

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
          >
            <option value="All">All Countries</option>
            <option value="Zimbabwe">Zimbabwe</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="India">India</option>
            <option value="Singapore">Singapore</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
          <ArrowUpDown className="w-5 h-5 text-blue-400" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="low-price">Lowest Price</option>
            <option value="high-price">Highest Price</option>
          </select>
        </div>

      </div>

      {/* Location */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-4">
        <MapPin className="w-5 h-5 text-red-400" />

        <input
          placeholder="Search by location..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
        />
      </div>

    </section>
  );
}