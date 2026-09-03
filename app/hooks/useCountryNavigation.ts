"use client";

import { usePathname } from "next/navigation";
import {
  addListingPath,
  countryFromPathname,
  storedCountryPath,
  type MarketCountry,
} from "@/lib/countries";

export default function useCountryNavigation() {
  const pathname = usePathname();
  const market = countryFromPathname(pathname);
  const onLanding = pathname === "/";

  let marketplaceHome = "/";
  if (market) {
    marketplaceHome = `/${market.slug}`;
  } else if (!onLanding) {
    marketplaceHome = storedCountryPath() ?? "/";
  }

  const addListingHref = addListingPath(market?.firestoreValue);

  return {
    market,
    marketplaceHome,
    addListingHref,
    onLanding,
  } satisfies {
    market: MarketCountry | null;
    marketplaceHome: string;
    addListingHref: string;
    onLanding: boolean;
  };
}
