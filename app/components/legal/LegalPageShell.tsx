import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/homepage/Footer/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type LegalPageShellProps = {
  title: string;
  updated?: string;
  children: React.ReactNode;
};

export default function LegalPageShell({
  title,
  updated,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-[#020817] pb-20 text-gray-300 lg:pb-8">
      <Navbar />

      <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {updated ? (
          <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
        ) : null}

        <div className="mt-8 space-y-5 text-[15px] leading-7 text-gray-300 sm:text-base">
          {children}
        </div>
      </article>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
