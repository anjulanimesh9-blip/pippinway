import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Browse or search listings",
    body: "Use Latest Ads, categories, country and keywords to find something you want.",
  },
  {
    n: "2",
    title: "Check the listing and seller",
    body: "Open the ad. Read the description, photos, price, location and the name on the seller card.",
  },
  {
    n: "3",
    title: "Contact the seller",
    body: "Use Pippinway chat or the WhatsApp number the seller chose to share on that listing.",
  },
  {
    n: "4",
    title: "Arrange the deal safely",
    body: "Inspect the item before you pay, meet in public where you can, and never share OTPs or banking passwords.",
  },
];

export default function HomeSeoSection() {
  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-[#111827] px-5 py-8 sm:px-8">
      <h2 className="text-xl font-bold text-white sm:text-2xl">
        About Pippinway
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
        Pippinway is a classified marketplace. Independent people post ads for
        cars, motorbikes, property, electronics, fashion, jobs, services and
        more. Pippinway provides the listing pages, search, chat and account
        tools. It does not own most of the items shown and does not guarantee
        that a private sale will complete.
      </p>

      <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
        Buy and sell in Zimbabwe
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
        Zimbabwe is one of Pippinway’s current markets. Choose Zimbabwe in the
        country filter to see live ads posted there, then open a listing for
        the seller’s own photos, price and location. The same tools work in
        Sri Lanka, India, Singapore, the UK, the USA, Canada, Thailand, South
        Africa and the Maldives.
      </p>

      <h2 className="mt-10 text-xl font-bold text-white sm:text-2xl">
        How Pippinway works
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

      <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <h2 className="text-lg font-semibold text-white">Marketplace safety</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Listings are user-generated. Compare similar ads, inspect goods in
          person when you can, and treat advance-payment requests with caution.
          Pippinway is not an escrow service. Read the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>
          ,{" "}
          <Link href="/posting-rules" className="text-[#FBB03B] hover:underline">
            posting rules
          </Link>{" "}
          and{" "}
          <Link href="/how-it-works" className="text-[#FBB03B] hover:underline">
            how Pippinway works
          </Link>
          .
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Learn more in{" "}
        <Link href="/about" className="text-[#FBB03B] hover:underline">
          About Pippinway
        </Link>
        ,{" "}
        <Link href="/contact" className="text-[#FBB03B] hover:underline">
          Contact
        </Link>
        ,{" "}
        <Link href="/privacy" className="text-[#FBB03B] hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-[#FBB03B] hover:underline">
          Terms
        </Link>
        . Featured Credits highlight a live ad; Rewards come from eligible
        listing activity, not from viewing or clicking advertisements.
      </p>
    </section>
  );
}
