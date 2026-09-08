"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import type { ReactNode } from "react";

export default function VibeShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#020817] pb-24 text-white lg:pb-8">
      <Navbar />
      {children}
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
