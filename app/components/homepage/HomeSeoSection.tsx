import Link from "next/link";

const items = [
  {
    title: "Browse marketplace categories",
    body: "Filter cars, motorbikes, property, electronics, fashion, jobs, services, animals, furniture, education and more by country and location.",
  },
  {
    title: "How Pippinway works",
    body: "Open a listing to read the seller’s description, photos, price and location. Contact the seller through Pippinway chat or the WhatsApp number they chose to share.",
  },
  {
    title: "Post an ad",
    body: "Create a free account, tap Add Listing, add photos and details, then publish. Live ads appear in Latest Ads after they are eligible to show on the marketplace.",
  },
  {
    title: "Discover local products",
    body: "Use search, country and category filters to find items and services near you in Sri Lanka, Zimbabwe, India, Singapore, the UK, the USA, Canada, Thailand, South Africa and the Maldives.",
  },
  {
    title: "Marketplace safety",
    body: "Meet in public where you can, inspect items before paying, and never share OTPs or banking passwords. Email a suspicious listing link to support, or read the Safety Center.",
  },
  {
    title: "Featured listings",
    body: "Sellers can highlight an approved ad with Featured Credits from a package or from Pippinway Rewards. Rewards come from eligible listing activity, not from viewing or clicking ads.",
  },
];

const steps = [
  {
    n: "1",
    title: "Browse or search",
    body: "Use Latest Ads, categories, country and keywords to find a listing.",
  },
  {
    n: "2",
    title: "Contact sellers",
    body: "Open the ad, read the details, then use Pippinway chat or WhatsApp.",
  },
  {
    n: "3",
    title: "Post your own ad",
    body: "Sign in, add photos and a honest description, then publish from Add Listing.",
  },
];

export default function HomeSeoSection() {
  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-[#111827] px-5 py-8 sm:px-8">
      <h2 className="text-xl font-bold text-white sm:text-2xl">
        Buy and sell with Pippinway
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
        Pippinway is a classified marketplace for buying, selling and discovering
        products and services. Independent sellers post their own ads. Pippinway
        provides the listing tools, search, messaging and safety guidance — it
        does not own most of the items shown.
      </p>

      <h3 className="mt-8 text-lg font-semibold text-white">
        How Pippinway works
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.n}
            className="rounded-xl border border-white/10 bg-[#0f172a] p-4"
          >
            <p className="text-xs font-bold text-[#FBB03B]">Step {step.n}</p>
            <h4 className="mt-1 text-sm font-semibold text-white">{step.title}</h4>
            <p className="mt-2 text-sm leading-6 text-gray-400">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <h3 className="text-lg font-semibold text-white">
          Shop and sell more safely
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Inspect items before you pay, meet in public where you can, and never
          share OTPs or banking passwords. Pippinway does not guarantee
          transactions. Read the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>
          ,{" "}
          <Link
            href="/guides/buying-safely"
            className="text-[#FBB03B] hover:underline"
          >
            Buying safely
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/selling-safely"
            className="text-[#FBB03B] hover:underline"
          >
            Selling safely
          </Link>
          .
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="text-sm font-semibold text-[#FBB03B]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">{item.body}</p>
          </div>
        ))}
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
        .
      </p>
    </section>
  );
}
