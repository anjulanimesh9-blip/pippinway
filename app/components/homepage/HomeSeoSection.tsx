"use client";

import Link from "next/link";
import type { MarketCountry } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

export default function HomeSeoSection({
  country,
}: {
  country?: MarketCountry;
}) {
  const { t, countryLabel } = useI18n();
  const marketName = country
    ? countryLabel(country.firestoreValue)
    : t("home.thisMarket");
  const steps = [
    { n: "1", title: t("home.seoStep1Title"), body: t("home.seoStep1Body") },
    { n: "2", title: t("home.seoStep2Title"), body: t("home.seoStep2Body") },
    { n: "3", title: t("home.seoStep3Title"), body: t("home.seoStep3Body") },
    { n: "4", title: t("home.seoStep4Title"), body: t("home.seoStep4Body") },
  ];

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-[#111827] px-5 py-8 sm:px-8">
      <h2 className="text-xl font-bold text-white sm:text-2xl">
        {t("home.seoAbout")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
        {t("home.seoAboutBody")}
      </p>

      <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
        {t("home.seoBuySellIn", { market: marketName })}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
        {t("home.seoBuySellBody", { market: marketName })}
      </p>

      <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
        {t("home.seoHowTitle")}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.n}
            className="rounded-xl border border-white/10 bg-[#0f172a] p-4"
          >
            <p className="text-xs font-bold text-[#FBB03B]">
              {t("home.step", { n: step.n })}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <h2 className="text-lg font-semibold text-white">
          {t("home.marketplaceSafety")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          {t("home.seoSafetyBodyBefore")}{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            {t("home.safetyCenter")}
          </Link>
          ,{" "}
          <Link href="/posting-rules" className="text-[#FBB03B] hover:underline">
            {t("home.postingRulesLink")}
          </Link>{" "}
          {t("home.safetyBlurbAnd")}{" "}
          <Link href="/how-it-works" className="text-[#FBB03B] hover:underline">
            {t("home.howPippinwayWorks")}
          </Link>
          .
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        {t("home.seoLearnMore")}{" "}
        <Link href="/about" className="text-[#FBB03B] hover:underline">
          {t("pages.about")}
        </Link>
        ,{" "}
        <Link href="/contact" className="text-[#FBB03B] hover:underline">
          {t("nav.contact")}
        </Link>
        ,{" "}
        <Link href="/privacy" className="text-[#FBB03B] hover:underline">
          {t("home.privacyShort")}
        </Link>{" "}
        {t("home.safetyBlurbAnd")}{" "}
        <Link href="/terms" className="text-[#FBB03B] hover:underline">
          {t("home.termsShort")}
        </Link>
        . {t("home.seoFeaturedNote")}
      </p>
    </section>
  );
}
