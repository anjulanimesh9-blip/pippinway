const PRIMARY_BTN =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.30)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] sm:w-auto";

export default function PipWebFinalCTA() {
  return (
    <section
      aria-labelledby="pipweb-final-cta-heading"
      className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="relative overflow-hidden rounded-3xl border border-[#3B82F6]/30 bg-[#0F172A] px-5 py-12 text-center shadow-[0_0_48px_rgba(59,130,246,0.16)] sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.22),_transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[#1D4ED8]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#0EA5E9]/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <h2
            id="pipweb-final-cta-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-tight lg:text-[2.6rem]"
          >
            Your Customers Are Online.
            <br />
            Your Business Should Be Too.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
            Start your professional business website today with PipWeb Studio.
          </p>
          <p className="mt-6 inline-flex flex-wrap items-baseline justify-center gap-x-2 rounded-2xl border border-[#3B82F6]/25 bg-[#0B1B3A] px-5 py-3 text-base text-slate-200 sm:text-lg">
            Complete Business Website from
            <span className="text-3xl font-bold tracking-tight text-[#7DD3FC] sm:text-4xl">
              $69
            </span>
          </p>
          <div className="mt-8">
            <a href="#contact" className={PRIMARY_BTN}>
              Start My Website
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Domain + Hosting Included for the First Year
          </p>
        </div>
      </div>
    </section>
  );
}
