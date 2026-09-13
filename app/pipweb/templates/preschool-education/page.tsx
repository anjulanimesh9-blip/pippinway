import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import LittleSprouts from "./LittleSprouts";
import PreschoolDemoBar from "./PreschoolDemoBar";
import PreschoolNav from "./PreschoolNav";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "Preschool & Education Website Demo | PipWeb Studio",
  },
  description:
    "Live preview of a PipWeb Studio preschool and education website for Little Sprouts Academy in Harare, Zimbabwe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreschoolEducationDemoPage() {
  return (
    <main className={`${nunito.className} min-h-screen overflow-x-hidden bg-[#FFF8F0]`}>
      <div id="top" className="sticky top-0 z-50">
        <PreschoolDemoBar />
        <PreschoolNav />
      </div>
      <LittleSprouts />
    </main>
  );
}
