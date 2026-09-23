"use client";

import { useEffect, useState } from "react";
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
  const [storedHome, setStoredHome] = useState("/");

  useEffect(() => {
    setStoredHome(storedCountryPath() ?? "/");
  }, [pathname]);

  let marketplaceHome = "/";
  if (market) {
    marketplaceHome = `/${market.slug}`;
  } else if (!onLanding) {
    marketplaceHome = storedHome;
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
