import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import SalonDemoBar from "./SalonDemoBar";
import SalonNav from "./SalonNav";
import VelvetGlow from "./VelvetGlow";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "Salon & Beauty Website Demo | PipWeb Studio",
  },
  description:
    "Live preview of a PipWeb Studio salon and beauty website for Velvet Glow Beauty Studio in Harare, Zimbabwe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SalonBeautyDemoPage() {
  return (
    <main className={`${cormorant.className} min-h-screen overflow-x-hidden bg-[#0B0A09]`}>
      <div id="top" className="sticky top-0 z-50">
        <SalonDemoBar />
        <SalonNav />
      </div>
      <VelvetGlow />
    </main>
  );
}
