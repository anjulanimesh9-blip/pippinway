import { Check } from "lucide-react";

const FEATURES = [
  "Professional template-based website",
  "Up to 5 pages",
  "Mobile & tablet responsive design",
  "WhatsApp integration",
  "Contact form",
  "Google Maps",
  "Social media links",
  "Photo gallery",
  "Basic SEO setup",
  "SSL security",
  "Domain included for 1 year",
  "Hosting included for 1 year",
  "First 3 months maintenance included",
  "2 revision rounds",
] as const;

export default function PipWebPricing() {
  return (
    <section
      aria-labelledby="pipweb-pricing-heading"
      className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pipweb-pricing-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Start Your Business Website for Just $69
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
          Everything you need to get your business online with a professional
          website.
        </p>
      </div>

      <article className="relative mx-auto mt-10 max-w-xl overflow-hidden rounded-3xl border border-[#3B82F6]/30 bg-[#0F172A] p-5 shadow-[0_0_48px_rgba(59,130,246,0.16)] sm:mt-12 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_70%)]"
        />

        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7DD3FC]">
            Limited Launch Offer
          </p>

          <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white sm:text-2xl">
                PipWeb Starter
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                One-time website setup
              </p>
            </div>
            <p className="mt-3 flex items-baseline gap-1 sm:mt-0">
              <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                $69
              </span>
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-3">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm leading-6 text-slate-200"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#7DD3FC]"
                  strokeWidth={2.4}
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-2 border-t border-white/10 pt-6 text-sm leading-6 text-slate-400">
            <p>
              After the first 3 months, optional maintenance is just $15 every 3
              months.
            </p>
            <p>
              Domain and hosting renewal after the first year is charged
              separately.
            </p>
            <p className="text-xs leading-5 text-slate-500">
              Extra pages, e-commerce, booking systems, advanced features, or
              major redesigns are quoted separately.
            </p>
          </div>

          <a
            href="#contact"
            className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.30)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            Get My Website for $69
          </a>
        </div>
      </article>
    </section>
  );
}
