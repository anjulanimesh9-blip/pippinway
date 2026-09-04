"use client";

import { track } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";

type CategoryFilterProps = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
};

const categories = [
  { name: "All", icon: "🌍" },
  { name: "Cars", icon: "🚗" },
  { name: "Motorbikes", icon: "🏍️" },
  { name: "Property", icon: "🏠" },
  { name: "Electronics", icon: "📱" },
  { name: "Fashion", icon: "👕" },
  { name: "Jobs", icon: "💼" },
  { name: "Services", icon: "🛠️" },
  { name: "Animals", icon: "🐶" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Education", icon: "📚" },
  { name: "Other", icon: "📦" },
];

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  const { categoryLabel } = useI18n();
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2 w-max">
        {categories.map((category) => {
          const active = selectedCategory === category.name;

          return (
            <button
              key={category.name}
              onClick={() => {
                setSelectedCategory(category.name);
                track("select_category", { category: category.name });
              }}
              className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl transition-all border ${
                active
                  ? "bg-yellow-400 border-yellow-400 text-black shadow-lg"
                  : "bg-[#111827] border-white/10 text-gray-300 hover:bg-[#1f2937]"
              }`}
            >
              <span className="text-2xl">{category.icon}</span>

              <span className="text-xs font-medium mt-2 text-center px-1">
                {categoryLabel(category.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}