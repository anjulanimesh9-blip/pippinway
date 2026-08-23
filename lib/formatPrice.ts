const countryCurrencies: Record<string, string> = {
  Singapore: "SGD",
  India: "INR",
  Thailand: "THB",
  Zimbabwe: "USD",
  USA: "USD",
  Maldives: "MVR",
  "Sri Lanka": "LKR",
  "South Africa": "ZAR",
  "United Kingdom": "GBP",
  Canada: "CAD",
};

const CURRENCY_DISPLAY: Record<string, (amount: string) => string> = {
  LKR: (n) => `Rs. ${n}`,
  USD: (n) => `USD $${n}`,
  CAD: (n) => `CA$ ${n}`,
  GBP: (n) => `£ ${n}`,
  INR: (n) => `₹ ${n}`,
  SGD: (n) => `S$ ${n}`,
  ZAR: (n) => `R ${n}`,
  THB: (n) => `฿ ${n}`,
  MVR: (n) => `MVR ${n}`,
};

function currencyCodeForCountry(country?: string): string | undefined {
  if (!country) return undefined;
  if (countryCurrencies[country]) return countryCurrencies[country];
  const lower = country.trim().toLowerCase();
  const match = Object.keys(countryCurrencies).find(
    (key) => key.toLowerCase() === lower
  );
  return match ? countryCurrencies[match] : undefined;
}

export function parseListingPrice(
  price: number | string | null | undefined
): number {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : 0;
  }
  const parsed = Number(String(price ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPrice(
  price: number | string | null | undefined,
  country?: string
): string {
  const formattedNumber = parseListingPrice(price).toLocaleString("en-US");
  const currencyCode = currencyCodeForCountry(country);
  const display = currencyCode ? CURRENCY_DISPLAY[currencyCode] : undefined;
  return display ? display(formattedNumber) : `$${formattedNumber}`;
}

export function getRelativeTime(createdAt: unknown): string {
  if (!createdAt) return "";

  const date: Date =
    typeof (createdAt as { toDate?: () => Date }).toDate === "function"
      ? (createdAt as { toDate: () => Date }).toDate()
      : createdAt instanceof Date
        ? createdAt
        : new Date(createdAt as string | number);

  if (isNaN(date.getTime())) return "";

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86400000
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}
