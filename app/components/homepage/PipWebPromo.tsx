import Link from "next/link";

export default function PipWebPromo() {
  return (
    <section
      aria-labelledby="pipweb-promo-heading"
      className="relative overflow-hidden rounded-2xl border border-[#3B82F6]/25 bg-gradient-to-r from-[#0B1B3A] via-[#0F172A] to-[#07111F] px-5 py-6 sm:px-7 sm:py-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#3B82F6]/20 blur-3xl"
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7DD3FC]">
        PipWeb Studio
      </p>
      <div className="relative mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2
            id="pipweb-promo-heading"
            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Need a Website for Your Business?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Get a professional business website from just $69.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Domain + Hosting Included for the First Year
          </p>
        </div>
        <Link
          href="/pipweb"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
        >
          Explore PipWeb Studio
        </Link>
      </div>
    </section>
  );
}
