import type { Metadata } from "next";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import ContactSupport from "@/app/contact/ContactSupport";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Pippinway Support",
  description:
    "How to reach Pippinway about accounts, listings, suspicious ads, payments, Featured Ads, Rewards and privacy.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Contact Pippinway Support",
    description:
      "Support paths for Pippinway marketplace accounts, listings, Featured Ads, Rewards and privacy requests.",
    url: `${SITE_URL}/contact`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Pippinway Support" wide hideTitle>
      <ContactSupport />
    </LegalPageShell>
  );
}
