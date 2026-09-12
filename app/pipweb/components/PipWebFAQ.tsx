"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What is included in the $69 package?",
    answer:
      "The $69 PipWeb Starter package includes a professional template-based website with up to 5 pages, mobile responsive design, WhatsApp integration, contact form, Google Maps, social media links, photo gallery, basic SEO, SSL security, domain for 1 year, hosting for 1 year, and the first 3 months of maintenance.",
  },
  {
    question: "How long does it take to build my website?",
    answer:
      "Most standard business websites can be completed within a few business days after we receive all required content, photos, and business information. More complex websites may take longer.",
  },
  {
    question: "Is the domain really included?",
    answer:
      "Yes. One standard domain registration is included for the first year as part of the PipWeb Starter package, subject to domain availability.",
  },
  {
    question: "Is hosting included?",
    answer:
      "Yes. Website hosting is included for the first year with the PipWeb Starter package.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "Domain and hosting renewal are charged separately after the first year. We will let you know the renewal cost before the renewal date.",
  },
  {
    question: "What happens after the free 3-month maintenance period?",
    answer:
      "After the first 3 months, optional website maintenance is available for $15 every 3 months. This covers small content updates and basic website support.",
  },
  {
    question: "What changes are included in maintenance?",
    answer:
      "Maintenance covers small updates such as text changes, replacing a few photos, updating phone numbers, contact details, or similar minor edits. New pages, major redesigns, or new features are quoted separately.",
  },
  {
    question: "Can I request changes before the website goes live?",
    answer:
      "Yes. The PipWeb Starter package includes up to 2 revision rounds before final launch.",
  },
  {
    question: "Can you build an online store?",
    answer:
      "Yes. E-commerce websites and other advanced features can be built, but they are not included in the $69 Starter package and will be quoted separately.",
  },
  {
    question: "Will my website work on mobile phones?",
    answer:
      "Yes. PipWeb websites are designed to work across mobile phones, tablets, and desktop computers.",
  },
] as const;

export default function PipWebFAQ() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const last = FAQS.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    document.getElementById(`${baseId}-q-${next}`)?.focus();
  };

  return (
    <section
      aria-labelledby="pipweb-faq-heading"
      className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pipweb-faq-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
          Everything you need to know before starting your website.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-3 sm:mt-12">
        {FAQS.map((item, index) => {
          const open = openIndex === index;
          const buttonId = `${baseId}-q-${index}`;
          const panelId = `${baseId}-a-${index}`;
          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] transition duration-200 hover:border-[#3B82F6]/40"
            >
              <h3 className="text-base font-semibold">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:-outline-offset-2 focus-visible:outline-[#60A5FA] sm:px-5"
                >
                  <span className="text-sm leading-6 sm:text-[15px]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#7DD3FC] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!open}
                inert={!open ? true : undefined}
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-white/10 px-4 pb-5 pt-3 text-sm leading-6 text-slate-400 sm:px-5">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
