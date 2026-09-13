import type { Metadata } from "next";
import EstateDemoBar from "./EstateDemoBar";
import EstateNav from "./EstateNav";
import UrbanNest from "./UrbanNest";

export const metadata: Metadata = {
  title: {
    absolute: "Real Estate Website Demo | PipWeb Studio",
  },
  description:
    "Live preview of a PipWeb Studio real estate website for UrbanNest Properties in Harare, Zimbabwe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RealEstateDemoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF8F4]">
      <div id="top" className="sticky top-0 z-50">
        <EstateDemoBar />
        <EstateNav />
      </div>
      <UrbanNest />
    </main>
  );
}
