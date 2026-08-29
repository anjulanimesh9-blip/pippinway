"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import MobileBottomNav from "../components/MobileBottomNav";
import Footer from "../components/homepage/Footer/Footer";

const categories = [
  { name: "Cars", icon: "🚗", href: "/?category=Cars" },
  { name: "Motorbikes", icon: "🏍️", href: "/?category=Motorbikes" },
  { name: "Property", icon: "🏠", href: "/?category=Property" },
  { name: "Electronics", icon: "📱", href: "/?category=Electronics" },
  { name: "Fashion", icon: "👕", href: "/?category=Fashion" },
  { name: "Jobs", icon: "💼", href: "/?category=Jobs" },
  { name: "Services", icon: "🛠️", href: "/?category=Services" },
  { name: "Animals", icon: "🐶", href: "/?category=Animals" },
  { name: "Furniture", icon: "🛋️", href: "/?category=Furniture" },
  { name: "Education", icon: "🎓", href: "/?category=Education" },
  { name: "Other", icon: "📦", href: "/?category=Other" },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#020817] border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-violet-400 font-medium">
            ← Back
          </Link>

          <h1 className="flex-1 text-center text-2xl font-bold">
            Categories
          </h1>

          <div className="w-12" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-5xl mx-auto p-4 grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            onClick={() => track("select_category", { category: category.name })}
            className="bg-[#111827] border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-violet-500 transition"
          >
            <span className="text-5xl mb-3">
              {category.icon}
            </span>

            <span className="text-lg font-semibold text-center">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}