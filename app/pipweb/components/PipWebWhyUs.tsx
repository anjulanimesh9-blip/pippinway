import {
  Headphones,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Affordable Pricing",
    description:
      "Professional websites designed for small and growing businesses.",
  },
  {
    icon: Sparkles,
    title: "Professional Designs",
    description:
      "Modern templates customized to match your business and brand.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Every website is designed to work across phones, tablets, and desktops.",
  },
  {
    icon: Zap,
    title: "Fast Setup",
    description:
      "A simple process helps get your business online without unnecessary delays.",
  },
  {
    icon: Headphones,
    title: "Personal Support",
    description: "Get direct support when you need help with your website.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "SSL security and reliable hosting are included in the starter package.",
  },
] as const;

export default function PipWebWhyUs() {
  return (
    <section
      aria-labelledby="pipweb-why-heading"
      className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pipweb-why-heading"
          className="text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-4xl"
        >
          Why Choose PipWeb Studio?
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
          Professional websites without complicated pricing or unnecessary
          extras.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {BENEFITS.map((benefit) => (
          <li
            key={benefit.title}
            className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#132038] sm:p-6"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B82F6]/15 text-[#7DD3FC]">
              <benefit.icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-white sm:text-[17px]">
              {benefit.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {benefit.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
