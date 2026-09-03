import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";

export default function ListingNotFound() {
  return (
    <main className="min-h-screen bg-[#020817] pb-20 text-white lg:pb-8">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          This ad is missing, expired, or not public. Browse live listings on
          the homepage or open another category.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#FBB03B] px-5 py-3 text-sm font-bold text-black"
        >
          Browse listings
        </Link>
      </div>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
