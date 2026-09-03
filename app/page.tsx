import type { Metadata } from "next";
import Footer from "@/app/components/homepage/Footer/Footer";
import CountryLanding from "@/app/components/homepage/CountryLanding";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import Navbar from "@/app/components/Navbar";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Pippinway - Buy & Sell Near You",
  },
  description:
    "Choose your country and discover local cars, property, electronics, jobs, services and more on Pippinway.",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pippinway - Buy & Sell Near You",
    description:
      "Choose your country and discover local cars, property, electronics, jobs, services and more on Pippinway.",
    url: SITE_URL,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020817] pb-20 lg:pb-8">
      <Navbar />
      <CountryLanding />
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
