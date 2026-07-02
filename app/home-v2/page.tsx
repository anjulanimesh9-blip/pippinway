"use client";

import Navbar from "../components/Navbar";
import Hero from "../components/homepage/Hero";

export default function HomeV2() {
  return (
    <main className="min-h-screen bg-[#030712]">
      <Navbar />
      <Hero />
    </main>
  );
}