import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/app/components/homepage/Footer/Footer";
import HomeMarketplace from "@/app/components/homepage/HomeMarketplace";
import HomeSeoSection from "@/app/components/homepage/HomeSeoSection";
import TrustBadges from "@/app/components/homepage/TrustBadges";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import {
  MARKET_COUNTRIES,
  countryCanonical,
  getCountryBySlug,
} from "@/lib/countries";

type CountryPageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return MARKET_COUNTRIES.map((country) => ({ country: country.slug }));
}

export const dynamicParams = false;

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
      firstParam(params.location) ||
      firstParam(params.sort)
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: CountryPageProps): Promise<Metadata> {
  const { country: slug } = await params;
  const market = getCountryBySlug(slug);
  if (!market) return { title: "Not found" };

  const filtered = hasFilterParams(await searchParams);
  const canonical = countryCanonical(market.slug);
  const title = `Buy & Sell in ${market.displayName}`;
  const description = `Browse cars, property, electronics, jobs, services and more for sale in ${market.displayName} on Pippinway.`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: `${title} | Pippinway`,
      description,
      url: canonical,
      siteName: "Pippinway",
      type: "website",
    },
  };
}

export default async function CountryMarketplacePage({
  params,
}: CountryPageProps) {
  const { country: slug } = await params;
  const market = getCountryBySlug(slug);
  if (!market) notFound();

  return (
    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-8">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-white">
            Loading marketplace...
          </div>
        }
      >
        <HomeMarketplace initialCountry={market.firestoreValue} />
      </Suspense>

      <div className="mx-auto w-full max-w-[1600px] px-4">
        <TrustBadges />
        <HomeSeoSection country={market} />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
