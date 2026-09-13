import { Suspense } from "react";
import { Check } from "lucide-react";
import PipWebOrderForm from "@/app/pipweb/components/PipWebOrderForm";

const TRUST = [
  "Professional website from $69",
  "Domain and hosting included for 1 year",
  "First 3 months of maintenance included",
  "We confirm the details with you on WhatsApp",
] as const;

function OrderFormFallback() {
  return (
    <div
      className="h-[36rem] rounded-3xl border border-white/10 bg-[#0F172A]"
      aria-hidden
    />
  );
}

export default function PipWebContact() {
  return (
    <section
      id="contact"
      aria-labelledby="pipweb-contact-heading"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <h2
            id="pipweb-contact-heading"
            className="text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-4xl"
          >
            Ready to Take Your Business Online?
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-300 sm:text-lg">
            Tell us about your business and we&apos;ll help you get started.
          </p>
          <ul className="mt-8 space-y-3">
            {TRUST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-6 text-slate-200"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#7DD3FC]"
                  strokeWidth={2.4}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Suspense fallback={<OrderFormFallback />}>
          <PipWebOrderForm />
        </Suspense>
      </div>
    </section>
  );
}
