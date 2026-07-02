export type ListingTimestamp =
  | Date
  | {
      seconds?: number;
      toDate?: () => Date;
    }
  | string
  | number
  | null
  | undefined;

export interface MarketplaceListing {
  id: string;
  title?: string;
  price?: string | number;
  country?: string;
  category?: string;
  location?: string;
  imageUrl?: string;
  imageUrls?: string[];
  featured?: boolean;
  createdAt?: ListingTimestamp;
  approved?: boolean;
  expired?: boolean;
  ownerEmail?: string;
}

export interface MarketplaceFilters {
  search: string;
  category: string;
  country: string;
  location: string;
}

export interface CountryOption {
  label: string;
  value: string;
}

export const categories = [
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
  "Animals",
  "Furniture",
  "Education",
  "Other",
];

export const countries: CountryOption[] = [
  { label: "Sri Lanka", value: "Sri Lanka" },
  { label: "Zimbabwe", value: "Zimbabwe" },
  { label: "United States", value: "USA" },
  { label: "Canada", value: "Canada" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "India", value: "India" },
  { label: "Singapore", value: "Singapore" },
  { label: "Thailand", value: "Thailand" },
  { label: "South Africa", value: "South Africa" },
  { label: "Maldives", value: "Maldives" },
];

export const currencyMap: Record<string, string> = {
  "Sri Lanka": "Rs.",
  Zimbabwe: "USD $",
  USA: "USD $",
  "United States": "USD $",
  Canada: "CAD $",
  "United Kingdom": "£",
  India: "₹",
  Singapore: "SGD $",
  Thailand: "฿",
  "South Africa": "R",
  Maldives: "MVR",
};

export const getCurrency = (country?: string) => {
  const normalizedCountry = country?.trim();

  if (!normalizedCountry) {
    return "";
  }

  return currencyMap[normalizedCountry] || "";
};

export const getListingImage = (listing: MarketplaceListing) =>
  listing.imageUrl || listing.imageUrls?.[0] || "";

export const formatPrice = (listing: MarketplaceListing) => {
  const amount =
    typeof listing.price === "number"
      ? listing.price
      : Number(String(listing.price || "").replace(/,/g, ""));

  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString()
    : listing.price || "Price on request";

  const currency = getCurrency(listing.country);

  return currency ? currency + " " + formattedAmount : String(formattedAmount);
};

export const isVisibleListing = (listing: MarketplaceListing) =>
  listing.approved === true && listing.expired !== true;

export const getCountryLabel = (value?: string) =>
  countries.find((country) => country.value === value)?.label || value || "";
