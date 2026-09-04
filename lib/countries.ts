import { SITE_URL } from "@/lib/site";

export type MarketCountry = {
  slug: string;
  displayName: string;
  firestoreValue: string;
  iso2: string;
};

export const MARKET_COUNTRIES: MarketCountry[] = [
  { slug: "zimbabwe", displayName: "Zimbabwe", firestoreValue: "Zimbabwe", iso2: "ZW" },
  { slug: "sri-lanka", displayName: "Sri Lanka", firestoreValue: "Sri Lanka", iso2: "LK" },
  { slug: "south-africa", displayName: "South Africa", firestoreValue: "South Africa", iso2: "ZA" },
  { slug: "usa", displayName: "United States", firestoreValue: "USA", iso2: "US" },
  { slug: "united-kingdom", displayName: "United Kingdom", firestoreValue: "United Kingdom", iso2: "GB" },
  { slug: "canada", displayName: "Canada", firestoreValue: "Canada", iso2: "CA" },
  { slug: "india", displayName: "India", firestoreValue: "India", iso2: "IN" },
  { slug: "singapore", displayName: "Singapore", firestoreValue: "Singapore", iso2: "SG" },
  { slug: "thailand", displayName: "Thailand", firestoreValue: "Thailand", iso2: "TH" },
  { slug: "maldives", displayName: "Maldives", firestoreValue: "Maldives", iso2: "MV" },
];

/** Regional-indicator pair for an ISO 3166-1 alpha-2 code (ZW → 🇿🇼). */
export function flagEmojiFromIso2(iso2: string): string {
  const code = iso2.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65)
  );
}

export function countryFlagEmoji(country: MarketCountry): string {
  return flagEmojiFromIso2(country.iso2);
}

/** Twemoji PNG for a flag — Windows/Arial cannot paint regional-indicator emoji. */
export function flagImageUrl(iso2: string): string {
  const emoji = flagEmojiFromIso2(iso2);
  const codes = [...emoji]
    .map((ch) => ch.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codes}.png`;
}

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
        country.slug === needle ||
        country.iso2.toLowerCase() === needle
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
