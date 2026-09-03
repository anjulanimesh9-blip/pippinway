import { SITE_URL } from "@/lib/site";

export type MarketCountry = {
  slug: string;
  displayName: string;
  firestoreValue: string;
  flag: string;
};

export const MARKET_COUNTRIES: MarketCountry[] = [
  { slug: "zimbabwe", displayName: "Zimbabwe", firestoreValue: "Zimbabwe", flag: "🇿🇼" },
  { slug: "sri-lanka", displayName: "Sri Lanka", firestoreValue: "Sri Lanka", flag: "🇱🇰" },
  { slug: "south-africa", displayName: "South Africa", firestoreValue: "South Africa", flag: "🇿🇦" },
  { slug: "usa", displayName: "United States", firestoreValue: "USA", flag: "🇺🇸" },
  { slug: "united-kingdom", displayName: "United Kingdom", firestoreValue: "United Kingdom", flag: "🇬🇧" },
  { slug: "canada", displayName: "Canada", firestoreValue: "Canada", flag: "🇨🇦" },
  { slug: "india", displayName: "India", firestoreValue: "India", flag: "🇮🇳" },
  { slug: "singapore", displayName: "Singapore", firestoreValue: "Singapore", flag: "🇸🇬" },
  { slug: "thailand", displayName: "Thailand", firestoreValue: "Thailand", flag: "🇹🇭" },
  { slug: "maldives", displayName: "Maldives", firestoreValue: "Maldives", flag: "🇲🇻" },
];

export const HOME_COUNTRIES = MARKET_COUNTRIES.map(
  (country) => country.firestoreValue
) as [string, ...string[]];

export const COUNTRY_STORAGE_KEY = "pippinway.selectedCountry";

export function getCountryBySlug(slug?: string | null): MarketCountry | null {
  if (!slug) return null;
  const needle = slug.trim().toLowerCase();
  return MARKET_COUNTRIES.find((country) => country.slug === needle) ?? null;
}

export function getCountryByFirestoreValue(
  value?: string | null
): MarketCountry | null {
  if (!value) return null;
  const needle = value.trim().toLowerCase();
  return (
    MARKET_COUNTRIES.find(
      (country) =>
        country.firestoreValue.toLowerCase() === needle ||
        country.displayName.toLowerCase() === needle ||
        country.slug === needle
    ) ?? null
  );
}

export function countryMarketplacePath(value?: string | null): string {
  const country = getCountryByFirestoreValue(value) ?? getCountryBySlug(value);
  return country ? `/${country.slug}` : "/";
}

export function countryFromPathname(pathname?: string | null): MarketCountry | null {
  if (!pathname) return null;
  const slug = pathname.split("/").filter(Boolean)[0];
  return getCountryBySlug(slug);
}

export function addListingPath(value?: string | null): string {
  const country = getCountryByFirestoreValue(value) ?? getCountryBySlug(value);
  if (!country) return "/add-listing";
  return `/add-listing?country=${encodeURIComponent(country.firestoreValue)}`;
}

export function countryCanonical(slug: string): string {
  return `${SITE_URL}/${slug}`;
}

export function persistSelectedCountry(firestoreValue: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COUNTRY_STORAGE_KEY, firestoreValue);
  localStorage.setItem("country", firestoreValue);
}

export function storedCountryPath(): string | null {
  if (typeof window === "undefined") return null;
  const stored =
    localStorage.getItem(COUNTRY_STORAGE_KEY) ?? localStorage.getItem("country");
  const country = getCountryByFirestoreValue(stored);
  return country ? `/${country.slug}` : null;
}
