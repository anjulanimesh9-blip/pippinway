"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import MobileBottomNav from "../components/MobileBottomNav";
import Footer from "../components/homepage/Footer/Footer";
import useCountryNavigation from "../hooks/useCountryNavigation";

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
  const { marketplaceHome } = useCountryNavigation();

  return (
    <main className="min-h-screen bg-[#020817] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#020817] border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
          <Link href={marketplaceHome} className="text-violet-400 font-medium">
            ← Back
          </Link>

          <h1 className="flex-1 text-center text-2xl font-bold">
            Categories
          </h1>

          <div className="w-12" />
        </div>
      </div>

      <p className="mx-auto max-w-5xl px-4 pt-3 text-sm leading-5 text-gray-400 sm:pt-4 sm:leading-6">
        Choose a category to browse live classified ads. You do not need an
        account to look. Posting an ad still requires sign-in.
      </p>

      {/* Categories Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 pt-3 pb-4 sm:gap-4 sm:p-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={
              marketplaceHome === "/"
                ? category.href
                : `${marketplaceHome}?category=${encodeURIComponent(category.name)}`
            }
            onClick={() => track("select_category", { category: category.name })}
            className="flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-gray-700 bg-[#111827] px-3 py-3 transition hover:border-violet-500 sm:min-h-0 sm:p-6"
          >
            <span className="mb-2 text-4xl leading-none sm:mb-3 sm:text-5xl">
              {category.icon}
            </span>

            <span className="text-center text-base font-semibold sm:text-lg">
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