import { MetadataRoute } from "next";
import { MARKET_COUNTRIES } from "@/lib/countries";
import { getPublicListingsForSitemap } from "@/lib/getPublicListing";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    ...MARKET_COUNTRIES.map((country) => ({
      url: `${SITE_URL}/${country.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/safety`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/posting-rules`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/guides/buying-safely`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/guides/selling-safely`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const listings = await getPublicListingsForSitemap(200);
    const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${SITE_URL}/listings/${encodeURIComponent(listing.id)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    }));
    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
