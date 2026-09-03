import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CountryFlag from "@/app/components/CountryFlag";
import LandingHeroArt from "@/app/components/homepage/LandingHeroArt";
import LandingSearch from "@/app/components/homepage/LandingSearch";
import { MARKET_COUNTRIES } from "@/lib/countries";

const steps = [
  {
    n: "1",
    title: "Choose your country",
    body: "Open the market where you want to buy or sell so listings match that country.",
  },
  {
    n: "2",
    title: "Browse local listings",
    body: "Use search, categories and location to find cars, property, electronics, jobs and more.",
  },
  {
    n: "3",
    title: "Contact the seller",
    body: "Read the ad, then use Pippinway chat or the WhatsApp number the seller shared.",
  },
  {
    n: "4",
    title: "Arrange the transaction safely",
    body: "Inspect the item before you pay, meet in public where you can, and never share OTPs.",
  },
];

export default function CountryLanding() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:py-12">
      <div className="sm:hidden">
        <LandingSearch />
        <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight text-white">
          Buy & Sell Near You
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Find{" "}
          <span className="font-semibold text-[#FBB03B]">great deals</span> from
          people near you.
        </p>
        <LandingHeroArt />
        <h2
          id="choose-country"
          className="mt-5 text-lg font-bold text-white"
        >
          Choose your country
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Select a location to explore local listings.
        </p>
      </div>

      <div className="hidden flex-col items-center text-center sm:flex">
        <Image
          src="/images/logo.png"
          alt="Pippinway"
          width={220}
          height={220}
          className="h-24 w-auto object-contain"
          priority
        />
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
          Buy & Sell Near You
        </h1>
        <p className="mt-3 max-w-xl text-lg text-gray-400">
          Choose your country to explore local listings
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {MARKET_COUNTRIES.map((country) => (
          <Link
            key={country.slug}
            href={`/${country.slug}`}
            className="flex min-h-[76px] items-center gap-2.5 rounded-2xl border border-white/10 bg-[#141B2D] px-3 py-2.5 text-left transition hover:border-[#FBB03B]/50 hover:bg-[#1a2234] sm:min-h-[112px] sm:flex-col sm:items-center sm:justify-center sm:bg-[#111827] sm:px-3 sm:py-5 sm:text-center"
          >
            <CountryFlag
              iso2={country.iso2}
              title={country.displayName}
              className="h-7 w-10 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12 sm:rounded-none"
              imgClassName="object-cover sm:object-contain"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-white sm:mt-3 sm:text-base">
                {country.displayName}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-400 sm:hidden">
                Browse listings
                <ArrowRight className="h-3 w-3 text-[#FBB03B]" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-white/10 bg-[#111827] px-5 py-8 sm:px-8">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Buy and Sell with Pippinway
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
          Pippinway is a classified marketplace. People post their own ads for
          cars, property, electronics, jobs, services and more. Choosing a
          country opens that local marketplace so you can browse listings
          posted there.
        </p>

        <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
          How it works
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-white/10 bg-[#0f172a] p-4"
            >
              <p className="text-xs font-bold text-[#FBB03B]">Step {step.n}</p>
              <h3 className="mt-1 text-sm font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{step.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
          Shop by location
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
          Each country page shows listings for that market. Zimbabwe opens
          Zimbabwe ads, Sri Lanka opens Sri Lankan ads, and so on. You can
          change country later from the marketplace.
        </p>

        <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
          <h2 className="text-lg font-semibold text-white">
            Marketplace safety
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Listings are user-generated. Inspect items before you pay and meet
            in public where you can. Pippinway does not guarantee private
            sales. Read the{" "}
            <Link href="/safety" className="text-[#FBB03B] hover:underline">
              Safety Center
            </Link>{" "}
            and{" "}
            <Link
              href="/how-it-works"
              className="text-[#FBB03B] hover:underline"
            >
              how Pippinway works
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
