"use client";

import Link from "next/link";

const categories = [
  { name: "Cars", icon: "🚗" },
  { name: "Property", icon: "🏠" },
  { name: "Electronics", icon: "💻" },
  { name: "Jobs", icon: "💼" },
  { name: "Fashion", icon: "👕" },
  { name: "Services", icon: "🛠️" },
  { name: "Animals", icon: "🐶" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Education", icon: "🎓" },
  { name: "Other", icon: "📦" },
];

export default function CategorySidebar() {
  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-700 bg-[#111827] p-5">

      <h2 className="mb-5 text-xl font-bold text-white">
        Categories
      </h2>

      <div className="space-y-2">

        {categories.map((item) => (
          <Link
            key={item.name}
            href="#"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span className="text-xl">{item.icon}</span>

            <span>{item.name}</span>
          </Link>
        ))}

      </div>

    </aside>
  );
}