export type AnalyticsValue = string | number | boolean;
export type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

export type ContactMethod = "whatsapp" | "call" | "chat";

export type ListingViewParams = {
  listing_id: string;
  category?: string;
  country?: string;
  location?: string;
  featured: boolean;
};

export type SellerContactParams = {
  listing_id: string;
  contact_method: ContactMethod;
  category?: string;
  country?: string;
};

export type SearchEventParams = {
  search_term?: string;
  category?: string;
  country?: string;
  location?: string;
};

export type FavoriteEventParams = {
  listing_id: string;
  category?: string;
  country?: string;
};

export type PostAdParams = {
  listing_id: string;
  category?: string;
  country?: string;
};

export type FeaturedPurchaseParams = {
  package_id?: string;
  credits?: number;
  duration_days?: number;
  payment_country?: string;
  value?: number;
  currency?: string;
};

const MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/;
const BLOCKED_PARAM_KEY =
  /email|phone|name|message|password|whatsapp|display.?name|receipt|token/i;
const ALLOWED_PARAM_KEYS = new Set([
  "listing_id",
  "category",
  "country",
  "location",
  "featured",
  "contact_method",
  "search_term",
  "package_id",
  "credits",
  "duration_days",
  "payment_country",
  "value",
  "currency",
  "page_path",
  "page_location",
]);
const LOOKS_LIKE_EMAIL = /@/;
const LOOKS_LIKE_PHONE = /^\+?\d{8,}$/;
const ISO_CURRENCY = /^[A-Z]{3}$/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let lastListingViewId: string | null = null;

export function getGaMeasurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
  if (!MEASUREMENT_ID_RE.test(raw)) return null;
  return raw;
}

function sanitizeParams(params?: AnalyticsParams): Record<string, AnalyticsValue> {
  const safe: Record<string, AnalyticsValue> = {};
  if (!params) return safe;

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (!ALLOWED_PARAM_KEYS.has(key) && BLOCKED_PARAM_KEY.test(key)) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) continue;
      if (LOOKS_LIKE_EMAIL.test(trimmed) || LOOKS_LIKE_PHONE.test(trimmed)) {
        continue;
      }
      safe[key] = trimmed;
      continue;
    }
    safe[key] = value;
  }

  return safe;
}

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === "all" || trimmed.toLowerCase() === "all locations") {
    return undefined;
  }
  return trimmed;
}

export function track(event: string, params?: AnalyticsParams): void {
  try {
    if (typeof window === "undefined") return;
    if (!getGaMeasurementId()) return;
    if (typeof window.gtag !== "function") return;
    if (!event.trim()) return;

    window.gtag("event", event, sanitizeParams(params));
  } catch {
    // Analytics must never break marketplace functionality.
  }
}

export function trackPageView(path: string): void {
  try {
    if (typeof window === "undefined") return;
    if (!getGaMeasurementId()) return;
    if (typeof window.gtag !== "function") return;

    const pagePath = path.startsWith("/") ? path : `/${path}`;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: pagePath,
    });
  } catch {
    // Analytics must never break marketplace functionality.
  }
}

export function trackListingView(params: ListingViewParams): void {
  const listingId = params.listing_id.trim();
  if (!listingId) return;
  if (lastListingViewId === listingId) return;
  lastListingViewId = listingId;

  track("listing_view", {
    listing_id: listingId,
    category: optionalText(params.category),
    country: optionalText(params.country),
    location: optionalText(params.location),
    featured: params.featured,
  });
}

export function trackSellerContact(params: SellerContactParams): void {
  const listingId = params.listing_id.trim();
  if (!listingId) return;

  track("seller_contact", {
    listing_id: listingId,
    contact_method: params.contact_method,
    category: optionalText(params.category),
    country: optionalText(params.country),
  });
}

export function trackSearch(params: SearchEventParams): void {
  track("search", {
    search_term: optionalText(params.search_term),
    category: optionalText(params.category),
    country: optionalText(params.country),
    location: optionalText(params.location),
  });
}

export function trackFavorite(params: FavoriteEventParams): void {
  const listingId = params.listing_id.trim();
  if (!listingId) return;

  track("favorite", {
    listing_id: listingId,
    category: optionalText(params.category),
    country: optionalText(params.country),
  });
}

export function trackRemoveFavorite(params: FavoriteEventParams): void {
  const listingId = params.listing_id.trim();
  if (!listingId) return;

  track("remove_favorite", {
    listing_id: listingId,
    category: optionalText(params.category),
    country: optionalText(params.country),
  });
}

export function trackPostAd(params: PostAdParams): void {
  const listingId = params.listing_id.trim();
  if (!listingId) return;

  track("post_ad", {
    listing_id: listingId,
    category: optionalText(params.category),
    country: optionalText(params.country),
  });
}

export function trackFeaturedPurchase(params: FeaturedPurchaseParams): void {
  const currency = optionalText(params.currency)?.toUpperCase();
  const safeCurrency = currency && ISO_CURRENCY.test(currency) ? currency : undefined;
  const safeValue =
    typeof params.value === "number" &&
    Number.isFinite(params.value) &&
    params.value > 0
      ? params.value
      : undefined;

  track("featured_purchase", {
    package_id: optionalText(params.package_id),
    credits:
      typeof params.credits === "number" && Number.isFinite(params.credits)
        ? params.credits
        : undefined,
    duration_days:
      typeof params.duration_days === "number" &&
      Number.isFinite(params.duration_days)
        ? params.duration_days
        : undefined,
    payment_country: optionalText(params.payment_country),
    value: safeValue,
    currency: safeCurrency,
  });
}
