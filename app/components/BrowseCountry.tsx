import { countries } from "./marketplaceTypes";

interface BrowseCountryProps {
  counts: Record<string, number>;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
}

export default function BrowseCountry({
  counts,
  selectedCountry,
  onSelectCountry,
}: BrowseCountryProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="browse-country-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Local discovery
          </p>
          <h2 id="browse-country-title" className="mt-2 text-2xl font-black text-white">
            Browse by Country
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {countries.map((country) => (
          <button
            key={country.value}
            type="button"
            onClick={() => onSelectCountry(country.value)}
            className={
              selectedCountry === country.value
                ? "rounded-lg border border-amber-300/40 bg-amber-300/15 p-4 text-left shadow-lg shadow-amber-950/10"
                : "rounded-lg border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-amber-200/35 hover:bg-white/[0.09]"
            }
          >
            <span className="block text-sm font-bold text-white">{country.label}</span>
            <span className="mt-2 block text-xs text-slate-400">{counts[country.value] || 0} listings</span>
          </button>
        ))}
      </div>
    </section>
  );
}
