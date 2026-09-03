import Image from "next/image";
import Link from "next/link";
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt="Pippinway"
          width={220}
          height={220}
          className="h-20 w-auto object-contain sm:h-24"
          priority
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Buy & Sell Near You
        </h1>
        <p className="mt-3 max-w-xl text-base text-gray-400 sm:text-lg">
          Choose your country to explore local listings
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MARKET_COUNTRIES.map((country) => (
          <Link
            key={country.slug}
            href={`/${country.slug}`}
            className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111827] px-3 py-5 text-center transition hover:border-[#FBB03B]/50 hover:bg-[#1a2234]"
          >
            <span className="text-4xl leading-none" aria-hidden="true">
              {country.flag}
            </span>
            <span className="mt-3 text-sm font-semibold text-white sm:text-base">
              {country.displayName}
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
