import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/chat",
        "/chat/",
        "/messages",
        "/profile",
        "/profile/",
        "/notifications",
        "/edit",
        "/edit/",
        "/add-listing",
        "/login",
        "/register",
        "/rewards",
        "/featured-packages/checkout",
        "/api/",
        "/post ad",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
