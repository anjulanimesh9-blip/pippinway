"use client";

import {
  Car,
  Bike,
  Home,
  Laptop,
  Shirt,
  Briefcase,
  Wrench,
  PawPrint,
  Sofa,
  GraduationCap,
  Package,
  Grid2x2,
} from "lucide-react";

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
};

const categories = [
  { name: "All", icon: Grid2x2 },
  { name: "Cars", icon: Car },
  { name: "Motorbikes", icon: Bike },
  { name: "Property", icon: Home },
  { name: "Electronics", icon: Laptop },
  { name: "Fashion", icon: Shirt },
  { name: "Jobs", icon: Briefcase },
  { name: "Services", icon: Wrench },
  { name: "Animals", icon: PawPrint },
  { name: "Furniture", icon: Sofa },
  { name: "Education", icon: GraduationCap },
  { name: "Other", icon: Package },
];

export default function CategorySidebar({
  selectedCategory,
  setSelectedCategory,
}: Props) {
  return (
    <div className="category-sidebar rounded-2xl bg-[#111827] border border-white/10 p-5">
      <h2 className="text-white text-2xl font-bold mb-5">
        Categories
      </h2>

      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                selectedCategory === category.name
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-[#1f2937]"
              }`}
            >
              <Icon size={20} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}