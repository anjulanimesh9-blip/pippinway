import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import Navbar from "@/app/components/Navbar";

export default function PipWebShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020817] pb-20 text-white lg:pb-8">
      <Navbar />
      {children}
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
