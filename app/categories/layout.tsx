import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Marketplace Categories",
  description:
    "Browse Pippinway classified categories including cars, property, electronics, fashion, jobs, services and more.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  robots: { index: true, follow: true },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
