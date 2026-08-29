export type AnalyticsValue = string | number | boolean;
export type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

const MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/;
const BLOCKED_PARAM_KEY =
  /email|phone|name|message|payment|password|whatsapp|display.?name/i;
const LOOKS_LIKE_EMAIL = /@/;
const LOOKS_LIKE_PHONE = /^\+?\d{8,}$/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

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
    if (BLOCKED_PARAM_KEY.test(key)) continue;
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

export function track(event: string, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  if (!getGaMeasurementId()) return;
  if (typeof window.gtag !== "function") return;
  if (!event.trim()) return;

  window.gtag("event", event, sanitizeParams(params));
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (!getGaMeasurementId()) return;
  if (typeof window.gtag !== "function") return;

  const pagePath = path.startsWith("/") ? path : `/${path}`;
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: pagePath,
  });
}
