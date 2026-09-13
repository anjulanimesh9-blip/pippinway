import type { Metadata } from "next";
import DealerDemoBar from "./DealerDemoBar";
import DealerNav from "./DealerNav";
import PrimeDrive from "./PrimeDrive";

export const metadata: Metadata = {
  title: {
    absolute: "Car Dealer Website Demo | PipWeb Studio",
  },
  description:
    "Live preview of a PipWeb Studio car dealer website for PrimeDrive Motors in Harare, Zimbabwe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CarDealerDemoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0E1014]">
      <div id="top" className="sticky top-0 z-50">
        <DealerDemoBar />
        <DealerNav />
      </div>
      <PrimeDrive />
    </main>
  );
}
