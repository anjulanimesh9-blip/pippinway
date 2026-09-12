import type { Metadata } from "next";
import PipWebContact from "@/app/pipweb/components/PipWebContact";
import PipWebFAQ from "@/app/pipweb/components/PipWebFAQ";
import PipWebFinalCTA from "@/app/pipweb/components/PipWebFinalCTA";
import PipWebHero from "@/app/pipweb/components/PipWebHero";
import PipWebHowItWorks from "@/app/pipweb/components/PipWebHowItWorks";
import PipWebPricing from "@/app/pipweb/components/PipWebPricing";
import PipWebServices from "@/app/pipweb/components/PipWebServices";
import PipWebShell from "@/app/pipweb/components/PipWebShell";
import PipWebTemplates from "@/app/pipweb/components/PipWebTemplates";
import PipWebWhyUs from "@/app/pipweb/components/PipWebWhyUs";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "PipWeb Studio | Affordable Business Website Design",
  },
  description:
    "Get a professional business website from $69 with PipWeb Studio. Domain and hosting included for the first year.",
  alternates: {
    canonical: `${SITE_URL}/pipweb`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PipWeb Studio | Affordable Business Website Design",
    description:
      "Get a professional business website from $69 with PipWeb Studio. Domain and hosting included for the first year.",
    url: `${SITE_URL}/pipweb`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function PipWebPage() {
  return (
    <PipWebShell>
      <PipWebHero />
      <PipWebServices />
      <PipWebTemplates />
      <PipWebPricing />
      <PipWebHowItWorks />
      <PipWebWhyUs />
      <PipWebFAQ />
      <PipWebFinalCTA />
      <PipWebContact />
    </PipWebShell>
  );
}
