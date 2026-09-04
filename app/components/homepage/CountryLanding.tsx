"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CountryFlag from "@/app/components/CountryFlag";
import LandingHeroArt from "@/app/components/homepage/LandingHeroArt";
import LandingSearch from "@/app/components/homepage/LandingSearch";
import { MARKET_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

export default function CountryLanding() {
  const { t, countryLabel } = useI18n();
  const steps = [
    { n: "1", title: t("home.step1Title"), body: t("home.step1Body") },
    { n: "2", title: t("home.step2Title"), body: t("home.step2Body") },
    { n: "3", title: t("home.step3Title"), body: t("home.step3Body") },
    { n: "4", title: t("home.step4Title"), body: t("home.step4Body") },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 pb-6 sm:py-12 lg:max-w-[1200px] lg:px-8 lg:py-14">
      <div className="sm:hidden">
        <LandingSearch />
        <h1 className="pw-land-hero mt-5 text-[28px] font-bold leading-tight tracking-tight text-white">
          {t("home.buySellNearYou")}
        </h1>
        <p
          className="pw-land-hero mt-2 text-sm text-gray-400"
          style={{ animationDelay: "80ms" }}
        >
          {t("home.findGreatDeals")}
        </p>
        <LandingHeroArt />
        <h2 id="choose-country" className="mt-5 text-lg font-bold text-white">
          {t("home.chooseCountry")}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {t("home.selectLocationExplore")}
        </p>
      </div>

      <div className="hidden flex-col items-center text-center sm:flex">
        <Image
          src="/images/logo.png"
          alt="Pippinway"
          width={220}
          height={220}
          className="pw-land-logo h-24 w-auto object-contain lg:h-[7.25rem]"
          priority
        />
        <h1 className="pw-land-hero mt-6 text-5xl font-bold tracking-tight text-white lg:text-[3.25rem]">
          {t("home.buySellNearYou")}
        </h1>
        <p
          className="pw-land-hero mt-3 max-w-xl text-lg text-gray-400 lg:max-w-2xl"
          style={{ animationDelay: "90ms" }}
        >
          {t("home.chooseCountryExplore")}
        </p>
      </div>

      <p className="mt-10 hidden text-center text-sm font-medium text-gray-400 sm:block lg:mt-12">
        {t("home.chooseCountry")}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3 lg:mt-6 lg:grid-cols-5 lg:gap-4">
        {MARKET_COUNTRIES.map((country, index) => (
          <Link
            key={country.slug}
            href={`/${country.slug}`}
            className="pw-land-card pw-land-card-in flex min-h-[76px] items-center gap-2.5 rounded-2xl border border-white/10 bg-[#141B2D] px-3 py-2.5 text-left sm:min-h-[112px] sm:flex-col sm:items-center sm:justify-center sm:bg-[#111827] sm:px-3 sm:py-5 sm:text-center lg:min-h-[124px] lg:px-4 lg:py-6"
            style={{ animationDelay: `${180 + index * 55}ms` }}
          >
            <CountryFlag
              iso2={country.iso2}
              title={countryLabel(country.firestoreValue)}
              className="pw-land-flag h-7 w-10 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12 sm:rounded-none"
              imgClassName="object-cover sm:object-contain"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-white sm:mt-3 sm:text-base">
                {countryLabel(country.firestoreValue)}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-400 sm:hidden">
                {t("home.browseListings")}
                <ArrowRight className="h-3 w-3 text-[#FBB03B]" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section className="pw-land-reveal mt-14 rounded-2xl border border-white/10 bg-[#111827] px-5 py-8 sm:px-8 lg:mt-16 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10 lg:px-10 lg:py-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {t("home.buySellWith")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base lg:max-w-none">
            {t("home.landingIntro")}
          </p>
        </div>

        <div className="mt-10 lg:col-span-2 lg:row-start-2 lg:mt-0">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {t("home.howItWorks")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-white/10 bg-[#0f172a] p-4 lg:p-5"
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
        </div>

        <div className="mt-10 lg:col-span-2 lg:row-start-3 lg:mt-0">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {t("home.shopByLocation")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base lg:max-w-3xl">
            {t("home.shopByLocationBody")}
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 lg:col-start-2 lg:row-start-1 lg:mt-0">
          <h2 className="text-lg font-semibold text-white">
            {t("home.marketplaceSafety")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {t("home.safetyBlurbBefore")}{" "}
            <Link href="/safety" className="text-[#FBB03B] hover:underline">
              {t("home.safetyCenter")}
            </Link>{" "}
            {t("home.safetyBlurbAnd")}{" "}
            <Link
              href="/how-it-works"
              className="text-[#FBB03B] hover:underline"
            >
              {t("home.howPippinwayWorks")}
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
