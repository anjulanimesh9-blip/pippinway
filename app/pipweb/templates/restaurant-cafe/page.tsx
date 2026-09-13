import type { Metadata } from "next";
import RestaurantDemoBar from "./RestaurantDemoBar";
import RestaurantNav from "./RestaurantNav";
import SavannaKitchen from "./SavannaKitchen";

export const metadata: Metadata = {
  title: {
    absolute: "Restaurant & Cafe Website Demo | PipWeb Studio",
  },
  description:
    "Live preview of a PipWeb Studio restaurant and cafe website for Savanna Kitchen in Harare, Zimbabwe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RestaurantCafeDemoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#12100e]">
      <div id="top" className="sticky top-0 z-50">
        <RestaurantDemoBar />
        <RestaurantNav />
      </div>
      <SavannaKitchen />
    </main>
  );
}
