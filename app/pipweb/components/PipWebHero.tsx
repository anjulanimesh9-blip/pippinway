import Image from "next/image";
import { Globe, Server, Wrench } from "lucide-react";

const BENEFITS = [
  {
    icon: Globe,
    title: "FREE Domain for 1 Year",
  },
  {
    icon: Server,
    title: "FREE Hosting for 1 Year",
  },
  {
    icon: Wrench,
    title: "FREE Maintenance for the First 3 Months",
  },
] as const;

const PRIMARY_BTN =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.30)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] sm:w-auto";

const SECONDARY_BTN =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-[#60A5FA]/40 hover:bg-[#3B82F6]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] sm:w-auto";

export default function PipWebHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#1D4ED8]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#0EA5E9]/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 w-[148px] sm:mb-8 sm:w-[240px] lg:w-[280px]">
            <Image
              src="/pipweb/pipweb-logo.png"
              alt="PipWeb Studio"
              width={1024}
              height={1024}
              priority
              quality={75}
              sizes="(max-width: 640px) 148px, (max-width: 1024px) 240px, 280px"
              className="h-auto w-full rounded-2xl bg-white object-contain"
            />
          </div>

          <h1 className="text-[1.85rem] font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            PipWeb Studio
          </h1>

          <p className="mt-3 text-xl font-semibold leading-snug tracking-tight text-slate-100 sm:mt-4 sm:text-3xl sm:leading-tight lg:text-[2.15rem]">
            Build Your Business Today,
            <br className="hidden sm:block" /> Ready for Tomorrow.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7">
            Professional websites designed to help your business grow online —
            without the high cost.
          </p>

          <p className="mx-auto mt-6 inline-flex w-full max-w-sm flex-wrap items-baseline justify-center gap-x-2 rounded-2xl border border-[#3B82F6]/25 bg-[#0B1B3A] px-4 py-3 text-sm text-slate-200 sm:mt-8 sm:max-w-none sm:px-5 sm:text-lg">
            Complete Business Website from just
            <span className="text-[1.75rem] font-bold tracking-tight text-[#7DD3FC] sm:text-4xl">
              $69
            </span>
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F172A] p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#132038] sm:flex-col sm:items-center sm:px-5 sm:py-6 sm:text-center"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/15 text-[#7DD3FC]">
                <benefit.icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-snug text-white sm:text-[15px]">
                {benefit.title}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <a href="#contact" className={PRIMARY_BTN}>
            Get Started
          </a>
          <a href="#templates" className={SECONDARY_BTN}>
            View Templates
          </a>
        </div>
      </div>
    </section>
  );
}
