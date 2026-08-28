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
    body: "Meet in public where you can, inspect items before paying, and never share OTPs or banking passwords. Report suspicious listings through Contact / Help.",
  },
  {
    title: "Featured listings",
    body: "Sellers can highlight an approved ad with Featured Credits from a package or from Pippinway Rewards. Rewards come from eligible listing activity, not from viewing or clicking ads.",
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
