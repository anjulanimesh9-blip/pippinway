import { categories } from "./marketplaceTypes";

interface BrowseCategoryProps {
  counts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function BrowseCategory({
  counts,
  selectedCategory,
  onSelectCategory,
}: BrowseCategoryProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="browse-category-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Browse faster
          </p>
          <h2 id="browse-category-title" className="mt-2 text-2xl font-black text-white">
            Browse by Category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={
              selectedCategory === category
                ? "rounded-lg border border-violet-300/40 bg-violet-500/20 p-4 text-left shadow-lg shadow-violet-950/20"
                : "rounded-lg border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-blue-300/35 hover:bg-white/[0.09]"
            }
          >
            <span className="block text-sm font-bold text-white">{category}</span>
            <span className="mt-2 block text-xs text-slate-400">{counts[category] || 0} listings</span>
          </button>
        ))}
      </div>
    </section>
  );
}
