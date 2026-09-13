"use client";

import { useState } from "react";
import { ArrowRight, Mail, MapPin, Menu, Phone, Sprout, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { PRESCHOOL_DEMO, PRESCHOOL_NAV } from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2EB5D6]";

export default function PreschoolNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white shadow-[0_8px_24px_rgba(22,58,95,0.06)]">
      <div className="hidden bg-[#2EB5D6] text-white lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-[12px]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {PRESCHOOL_DEMO.location}
            </span>
            <a href={PRESCHOOL_DEMO.phoneTel} className={`inline-flex items-center gap-1.5 ${FOCUS}`}>
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {PRESCHOOL_DEMO.phone}
            </a>
            <a
              href={`mailto:${PRESCHOOL_DEMO.email}`}
              className={`inline-flex items-center gap-1.5 ${FOCUS}`}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {PRESCHOOL_DEMO.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/85">Follow Us</span>
            <a href="#contact" aria-label="Facebook" className={FOCUS}>
              <FaFacebookF className="h-3.5 w-3.5" />
            </a>
            <a href="#contact" aria-label="Instagram" className={FOCUS}>
              <FaInstagram className="h-3.5 w-3.5" />
            </a>
            <a href="#contact" aria-label="YouTube" className={FOCUS}>
              <FaYoutube className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <header>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem]">
          <a href="#top" className={`flex min-w-0 items-center gap-2.5 ${FOCUS}`}>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22A45A] text-white shadow-[0_8px_18px_rgba(34,164,90,0.28)]">
              <Sprout className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-extrabold tracking-tight text-[#163A5F] lg:text-lg">
                Little Sprouts
              </span>
              <span className="block text-[12px] font-bold text-[#22A45A] lg:text-sm">
                Academy
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Preschool">
            {PRESCHOOL_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold text-[#5A6B7B] transition hover:text-[#163A5F] ${
                  item.label === "Home"
                    ? "text-[#163A5F] underline decoration-[#2EB5D6] decoration-2 underline-offset-[10px]"
                    : ""
                } ${FOCUS}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#enroll"
            className={`hidden h-11 items-center gap-1.5 rounded-full bg-[#F5C542] px-5 text-sm font-bold text-[#163A5F] shadow-[0_8px_18px_rgba(245,197,66,0.35)] transition hover:bg-[#F7D36A] lg:inline-flex ${FOCUS}`}
          >
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#163A5F] lg:hidden ${FOCUS}`}
            aria-expanded={open}
            aria-controls="preschool-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Menu</span>
          </button>
        </div>

        {open ? (
          <div
            id="preschool-mobile-nav"
            className="border-t border-[#E8EEF3] px-4 py-3 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {PRESCHOOL_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-semibold text-[#163A5F] hover:bg-[#EAF8FC]"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#enroll"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-[#F5C542] text-sm font-bold text-[#163A5F]"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        ) : null}
      </header>
    </div>
  );
}
