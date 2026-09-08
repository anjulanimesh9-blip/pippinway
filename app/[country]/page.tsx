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
import { fetchMarketplaceFirstPage } from "@/lib/fetchCountryListings";
import { canonicalCategory } from "@/lib/filterListings";
import { vibeHomeMetadata } from "@/lib/vibe/seo";
import VibeHomeClient from "../vibe/VibeHomeClient";

type CountryPageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return [
    ...MARKET_COUNTRIES.map((country) => ({ country: country.slug })),
    { country: "vibe" },
  ];
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
  if (slug === "vibe") return vibeHomeMetadata();
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
  searchParams,
}: CountryPageProps) {
  const { country: slug } = await params;
  if (slug === "vibe") return <VibeHomeClient />;
  const market = getCountryBySlug(slug);
  if (!market) notFound();

  const query = await searchParams;
  const category = canonicalCategory(firstParam(query.category));
  const hasClientOnlyFilter = Boolean(
    firstParam(query.search)?.trim() || firstParam(query.location)?.trim()
  );
  const initialPage = hasClientOnlyFilter
    ? null
    : await fetchMarketplaceFirstPage(market.firestoreValue, category);

  return (
    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-8">
      <HomeMarketplace
        initialCountry={market.firestoreValue}
        initialCategory={category}
        initialPage={initialPage}
      />

      <div className="mx-auto w-full max-w-[1600px] px-4">
        <TrustBadges />
        <HomeSeoSection country={market} />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
