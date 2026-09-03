"use client";

import Link from "next/link";
import {
  Bike,
  Briefcase,
  Car,
  ChevronRight,
  GraduationCap,
  Home,
  Laptop,
  Package,
  PawPrint,
  Shirt,
  Sofa,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { track } from "@/lib/analytics";
import MobileBottomNav from "../components/MobileBottomNav";
import Footer from "../components/homepage/Footer/Footer";
import useCountryNavigation from "../hooks/useCountryNavigation";

const categories: {
  name: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { name: "Cars", icon: Car, href: "/?category=Cars" },
  { name: "Motorbikes", icon: Bike, href: "/?category=Motorbikes" },
  { name: "Property", icon: Home, href: "/?category=Property" },
  { name: "Electronics", icon: Laptop, href: "/?category=Electronics" },
  { name: "Fashion", icon: Shirt, href: "/?category=Fashion" },
  { name: "Jobs", icon: Briefcase, href: "/?category=Jobs" },
  { name: "Services", icon: Wrench, href: "/?category=Services" },
  { name: "Animals", icon: PawPrint, href: "/?category=Animals" },
  { name: "Furniture", icon: Sofa, href: "/?category=Furniture" },
  { name: "Education", icon: GraduationCap, href: "/?category=Education" },
  { name: "Other", icon: Package, href: "/?category=Other" },
];

export default function CategoriesPage() {
  const { marketplaceHome } = useCountryNavigation();
  const mainCategories = categories.filter((category) => category.name !== "Other");
  const otherCategory = categories.find((category) => category.name === "Other");
  const OtherIcon = otherCategory?.icon;

  const categoryHref = (category: (typeof categories)[number]) =>
    marketplaceHome === "/"
      ? category.href
      : `${marketplaceHome}?category=${encodeURIComponent(category.name)}`;

  return (
    <main className="min-h-screen bg-[#020817] text-white pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#020817]">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3.5">
          <Link
            href={marketplaceHome}
            className="text-sm font-medium text-[#FBB03B]"
          >
            ← Back
          </Link>

          <h1 className="flex-1 text-center text-xl font-bold sm:text-2xl">
            Categories
          </h1>

          <div className="w-12" />
        </div>
      </div>

      <p className="mx-auto max-w-5xl px-4 pt-3 text-sm leading-5 text-gray-400 sm:pt-4 sm:leading-6">
        Choose a category to browse live classified ads. You do not need an
        account to look. Posting an ad still requires sign-in.
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2.5 px-4 pt-4 pb-4 sm:gap-4 sm:p-4">
        {mainCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={categoryHref(category)}
              onClick={() => track("select_category", { category: category.name })}
              className="flex min-h-[108px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141B2D] px-3 py-4 transition hover:border-[#FBB03B]/50 sm:min-h-0 sm:p-6"
            >
              <span className="relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBB03B]/10 sm:mb-3 sm:h-12 sm:w-12">
                <Icon
                  className="h-6 w-6 text-white sm:h-7 sm:w-7"
                  strokeWidth={1.7}
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#FBB03B]" />
              </span>
              <span className="text-center text-sm font-semibold text-white sm:text-lg">
                {category.name}
              </span>
            </Link>
          );
        })}

        {otherCategory && OtherIcon && (
          <Link
            href={categoryHref(otherCategory)}
            onClick={() =>
              track("select_category", { category: otherCategory.name })
            }
            className="col-span-2 flex min-h-[64px] items-center gap-3 rounded-2xl border border-white/10 bg-[#141B2D] px-4 py-3.5 transition hover:border-[#FBB03B]/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBB03B]/10">
              <OtherIcon className="h-5 w-5 text-white" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">
                {otherCategory.name}
              </span>
              <span className="block text-xs text-gray-500">More categories</span>
            </span>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </Link>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
