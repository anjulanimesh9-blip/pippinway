import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/app/components/homepage/Footer/Footer";
import HomeMarketplace from "@/app/components/homepage/HomeMarketplace";
import HomeSeoSection from "@/app/components/homepage/HomeSeoSection";
import TrustBadges from "@/app/components/homepage/TrustBadges";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { SITE_URL } from "@/lib/site";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function hasFilterParams(
  params: Record<string, string | string[] | undefined>
): boolean {
  return Boolean(
    firstParam(params.search) ||
      firstParam(params.category) ||
      firstParam(params.country) ||
      firstParam(params.location) ||
      firstParam(params.sort)
  );
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const filtered = hasFilterParams(params);

  return {
    title: filtered
      ? "Filtered marketplace listings"
      : "Buy and sell on Pippinway",
    description:
      "Pippinway is a classified marketplace for buying and selling cars, property, electronics, fashion, jobs and more. Browse live ads, contact sellers, and post your own listing.",
    alternates: {
      canonical: SITE_URL,
    },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: "Buy and sell on Pippinway",
      description:
        "Classified marketplace for cars, property, electronics, jobs and more across Zimbabwe, Sri Lanka and other supported countries.",
      url: SITE_URL,
      siteName: "Pippinway",
      type: "website",
    },
  };
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-8">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-white">
            Loading marketplace...
          </div>
        }
      >
        <HomeMarketplace />
      </Suspense>

      <div className="mx-auto w-full max-w-[1600px] px-4">
        <TrustBadges />
        <HomeSeoSection />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
