"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { useI18n } from "@/lib/i18n";

type LegalPageShellProps = {
  title: string;
  updated?: string;
  children: React.ReactNode;
};

const TITLE_KEYS: Record<string, string> = {
  "About Pippinway": "pages.about",
  "Pippinway Safety Center": "pages.safety",
  "Pippinway Support": "pages.contact",
  "How Pippinway works": "pages.howItWorks",
  "Posting rules": "pages.postingRules",
  "Terms and Conditions": "pages.terms",
  "Privacy Policy": "pages.privacy",
  "Buying safely on Pippinway": "pages.buyingSafely",
  "Selling safely on Pippinway": "pages.sellingSafely",
  "Delete Your Pippinway Account": "pages.deleteAccount",
};

export default function LegalPageShell({
  title,
  updated,
  children,
}: LegalPageShellProps) {
  const { t } = useI18n();
  const heading = TITLE_KEYS[title] ? t(TITLE_KEYS[title]) : title;

  return (
    <main className="min-h-screen bg-[#020817] pb-20 text-gray-300 lg:pb-8">
      <Navbar />

      <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {heading}
        </h1>
        {updated ? (
          <p className="mt-2 text-sm text-gray-500">
            {t("footer.lastUpdated", { date: updated })}
          </p>
        ) : null}

        <div className="mt-8 space-y-5 text-[15px] leading-7 text-gray-300 sm:text-base">
          {children}
        </div>
      </article>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
