import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/chat",
        "/messages",
        "/profile",
        "/notifications",
        "/edit",
        "/post ad",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
