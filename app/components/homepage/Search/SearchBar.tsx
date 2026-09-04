"use client";

import { Search, MapPin } from "lucide-react";
import { track, trackSearch } from "@/lib/analytics";
import { MARKET_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

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
  const { t, categoryLabel, countryLabel } = useI18n();
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-3 md:p-4 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_1fr_auto] gap-2 md:gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            track("select_category", { category: e.target.value });
          }}
          className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? t("categories.allCategories") : categoryLabel(cat)}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-sm text-white outline-none"
        >
          <option value="All">{t("countries.all")}</option>
          {MARKET_COUNTRIES.map((country) => (
            <option key={country.slug} value={country.firestoreValue}>
              {countryLabel(country.firestoreValue)}
            </option>
          ))}
        </select>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("search.searchAds")}
          className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none"
        />

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("search.location")}
            className="w-full rounded-xl border border-white/10 bg-[#111827] pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            trackSearch({
              search_term: searchTerm,
              category: selectedCategory,
              country: selectedCountry,
              location,
            })
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition"
        >
          <Search className="w-4 h-4" />
          {t("common.search")}
        </button>
      </div>

      <div className="mt-2 flex justify-end md:hidden">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs text-white outline-none"
        >
          <option value="newest">{t("search.newestFirst")}</option>
          <option value="oldest">{t("search.oldestFirst")}</option>
          <option value="low-price">{t("search.lowestPrice")}</option>
          <option value="high-price">{t("search.highestPrice")}</option>
        </select>
      </div>
    </section>
  );
}
