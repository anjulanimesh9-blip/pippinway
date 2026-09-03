"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { storedCountryPath } from "@/lib/countries";

export default function LandingSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    const countryPath = storedCountryPath();

    if (countryPath) {
      const href = term
        ? `${countryPath}?search=${encodeURIComponent(term)}`
        : countryPath;
      router.push(href);
      return;
    }

    document.getElementById("choose-country")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-3">
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ads..."
          className="h-11 w-full rounded-2xl border border-white/10 bg-[#141B2D] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#FBB03B]/50"
        />
      </label>
    </form>
  );
}
