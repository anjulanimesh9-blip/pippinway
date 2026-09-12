import {
  BadgeCheck,
  LayoutTemplate,
  Rocket,
  Send,
  WandSparkles,
} from "lucide-react";

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Choose a Template",
    description: "Pick a website design that matches your business.",
  },
  {
    icon: Send,
    title: "Send Your Business Details",
    description:
      "Share your logo, contact details, photos, services, and other business information.",
  },
  {
    icon: BadgeCheck,
    title: "Confirm Your Order",
    description:
      "We confirm the package, requirements, and any extra features.",
  },
  {
    icon: WandSparkles,
    title: "We Build Your Website",
    description:
      "We customize the selected design for your brand and business.",
  },
  {
    icon: Rocket,
    title: "Your Website Goes Live",
    description:
      "Once approved, we connect your domain and launch your website.",
  },
] as const;

export default function PipWebHowItWorks() {
  return (
    <section
      aria-labelledby="pipweb-how-heading"
      className="relative border-y border-white/5 bg-[#07111F]"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="pipweb-how-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            How It Works
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
            Getting your business online is simple.
          </p>
        </div>

        <ol className="relative mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent lg:block"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#132038] lg:items-center lg:px-4 lg:py-6 lg:text-center">
                <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#0B1B3A] text-sm font-bold text-[#7DD3FC]">
                  {index + 1}
                </span>
                <span className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/15 text-[#7DD3FC]">
                  <step.icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
