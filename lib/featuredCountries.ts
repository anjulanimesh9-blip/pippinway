export const FEATURED_COUNTRIES = ["Sri Lanka", "Zimbabwe"] as const;

export type FeaturedCountry = (typeof FEATURED_COUNTRIES)[number];

export function isFeaturedCountry(value: string): value is FeaturedCountry {
  return (FEATURED_COUNTRIES as readonly string[]).includes(value);
}

export function paymentMethodForCountry(country: string): "Bank Transfer" | "EcoCash" {
  return country === "Sri Lanka" ? "Bank Transfer" : "EcoCash";
}
