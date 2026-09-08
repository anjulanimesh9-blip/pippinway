import { isVibeCategoryId } from "./categories";
import { VIBE_PATHS } from "./constants";
import {
  countryFromPathname,
  storedCountryPath,
} from "@/lib/countries";

export const VIBE_POST_ORIGIN_KEY = "pippinway.vibePostOrigin";
export const VIBE_LAST_PATH_KEY = "pippinway.vibeLastInternalPath";

export type VibePostOriginKind = "vibe" | "marketplace";

export type VibePostOrigin = {
  kind: VibePostOriginKind;
  href: string;
};

const MARKETPLACE_PREFIXES = [
  "/listings",
  "/categories",
  "/featured-ads",
  "/seller",
  "/add-listing",
  "/featured-packages",
];

export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }
  if (path.includes("://")) return false;
  const pathname = path.split("?")[0] ?? "";
  return pathname.startsWith("/") && !pathname.startsWith("//") && !pathname.includes(":");
}

export function classifyInternalPath(
  path: string
): VibePostOriginKind | "vibe-post" | "other" {
  const pathname = (path.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  if (pathname.startsWith("/vibe/post/")) return "vibe-post";
  if (pathname === "/vibe" || pathname.startsWith("/vibe/")) return "vibe";
  if (pathname === "/") return "marketplace";
  if (
    MARKETPLACE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return "marketplace";
  }
  if (countryFromPathname(pathname) && pathname.split("/").filter(Boolean).length === 1) {
    return "marketplace";
  }
  return "other";
}

export function sanitizeVibeReturnHref(path: string): string {
  if (!isSafeInternalPath(path)) return VIBE_PATHS.home;
  const [rawPath, rawQuery = ""] = path.split("?");
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  if (pathname.startsWith("/vibe/post/")) return VIBE_PATHS.home;
  if (pathname !== "/vibe" && !pathname.startsWith("/vibe/")) return VIBE_PATHS.home;
  if (!rawQuery) return pathname;
  const params = new URLSearchParams(rawQuery);
  const next = new URLSearchParams();
  const category = params.get("category");
  if (category && isVibeCategoryId(category)) next.set("category", category);
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function sanitizeMarketplaceReturnHref(path: string): string {
  if (!isSafeInternalPath(path)) return storedCountryPath() || "/";
  const pathname = (path.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  if (pathname === "/") return "/";
  const country = countryFromPathname(pathname);
  if (country && pathname === `/${country.slug}`) return `/${country.slug}`;
  return storedCountryPath() || "/";
}

export function isMarketplaceHomePath(path: string): boolean {
  const pathname = (path.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  if (pathname === "/") return true;
  const country = countryFromPathname(pathname);
  return Boolean(country && pathname === `/${country.slug}`);
}

export function defaultVibeOrigin(): VibePostOrigin {
  return { kind: "vibe", href: VIBE_PATHS.home };
}

export function defaultMarketplaceOrigin(): VibePostOrigin {
  return { kind: "marketplace", href: storedCountryPath() || "/" };
}

export function parseStoredOrigin(raw: string | null): VibePostOrigin | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<VibePostOrigin>;
    if (parsed.kind === "vibe" && typeof parsed.href === "string") {
      return { kind: "vibe", href: sanitizeVibeReturnHref(parsed.href) };
    }
    if (parsed.kind === "marketplace" && typeof parsed.href === "string") {
      return {
        kind: "marketplace",
        href: sanitizeMarketplaceReturnHref(parsed.href),
      };
    }
  } catch {
    // Ignore damaged session values.
  }
  return null;
}

export function safeReferrerPath(): string | null {
  if (typeof window === "undefined" || !document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (url.origin !== window.location.origin) return null;
    const path = `${url.pathname}${url.search}`;
    return isSafeInternalPath(path) ? path : null;
  } catch {
    return null;
  }
}

export function originFromAllowlistedParam(
  value: string | null
): VibePostOrigin | null {
  if (value === "marketplace") return defaultMarketplaceOrigin();
  if (value === "vibe") return defaultVibeOrigin();
  return null;
}

export function rememberLastInternalPath(path: string) {
  if (typeof sessionStorage === "undefined") return;
  if (!isSafeInternalPath(path)) return;
  if (classifyInternalPath(path) === "vibe-post") return;
  sessionStorage.setItem(VIBE_LAST_PATH_KEY, path);
}

export function readLastInternalPath(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const path = sessionStorage.getItem(VIBE_LAST_PATH_KEY);
  if (!path || !isSafeInternalPath(path)) return null;
  return path;
}

function originFromInternalPath(path: string): VibePostOrigin | null {
  const kind = classifyInternalPath(path);
  if (kind === "vibe") {
    return { kind: "vibe", href: sanitizeVibeReturnHref(path) };
  }
  if (kind === "marketplace") {
    return {
      kind: "marketplace",
      href: sanitizeMarketplaceReturnHref(path),
    };
  }
  return null;
}

function isFullDocumentLoadOfCurrentPage(): boolean {
  if (typeof performance === "undefined" || typeof window === "undefined") {
    return true;
  }
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (!entry?.name) return true;
    const navUrl = new URL(entry.name, window.location.origin);
    return (
      navUrl.origin === window.location.origin &&
      navUrl.pathname === window.location.pathname
    );
  } catch {
    return true;
  }
}

function navigationType(): PerformanceNavigationTiming["type"] | null {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    return entry?.type ?? null;
  } catch {
    return null;
  }
}

export function resolveVibePostOrigin(fromParam?: string | null): VibePostOrigin {
  const explicit = originFromAllowlistedParam(fromParam ?? null);
  if (explicit) return explicit;

  const stored = parseStoredOrigin(
    typeof sessionStorage === "undefined"
      ? null
      : sessionStorage.getItem(VIBE_POST_ORIGIN_KEY)
  );
  const referrerOrigin = (() => {
    const referrer = safeReferrerPath();
    return referrer ? originFromInternalPath(referrer) : null;
  })();
  const lastOrigin = (() => {
    const last = readLastInternalPath();
    return last ? originFromInternalPath(last) : null;
  })();

  if (isFullDocumentLoadOfCurrentPage()) {
    if (navigationType() === "reload" && stored) return stored;
    if (referrerOrigin) return referrerOrigin;
    return defaultVibeOrigin();
  }

  if (lastOrigin) return lastOrigin;
  if (referrerOrigin) return referrerOrigin;
  return stored ?? defaultVibeOrigin();
}

export function persistVibePostOrigin(origin: VibePostOrigin) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(VIBE_POST_ORIGIN_KEY, JSON.stringify(origin));
}
