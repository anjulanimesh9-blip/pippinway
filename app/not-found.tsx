"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-[#020817] pb-20 text-white lg:pb-8">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("pages.notFound")}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          {t("pages.notFoundBody")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#FBB03B] px-5 py-3 text-sm font-bold text-black"
        >
          {t("pages.chooseCountry")}
        </Link>
      </div>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
