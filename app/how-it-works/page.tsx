import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Pippinway Works",
  description:
    "How to browse listings, check a seller, make contact, post an ad, and complete a classified deal more carefully on Pippinway.",
  alternates: {
    canonical: `${SITE_URL}/how-it-works`,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How Pippinway Works",
    description:
      "A practical walkthrough of buying and selling on the Pippinway classified marketplace.",
    url: `${SITE_URL}/how-it-works`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return (
    <LegalPageShell title="How Pippinway works">
      <p>
        Pippinway is a classified marketplace. You browse ads other people
        posted, or you post your own. Pippinway does not warehouse the goods
        and does not hold the buyer’s money. This page is the plain sequence
        most people follow.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          1. Browse or search listings
        </h2>
        <p>
          Open the homepage without an account. Latest Ads shows live,
          approved listings. Use the country filter (including Zimbabwe), a
          category, or a keyword to narrow the feed.{" "}
          <Link href="/categories" className="text-[#FBB03B] hover:underline">
            Categories
          </Link>{" "}
          is a simple grid if you prefer to start from Cars, Property,
          Electronics and the rest.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          2. Check the listing and seller
        </h2>
        <p>
          Open the ad. Read the title, price, city, country, photos and the
          seller’s description. Look at the seller card. Featured placement
          only means the seller used credits to highlight the ad — it is not
          an inspection of the item. Compare a few similar live ads before
          you travel or pay.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          3. Contact the seller
        </h2>
        <p>
          Signed-in buyers can start Pippinway chat from the listing. Many
          sellers also publish a WhatsApp number on the ad. Ask about
          condition, extras, and where you can view the item. Keep the first
          messages attached to that listing so you have a record.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          4. Arrange the transaction safely
        </h2>
        <p>
          Inspect the item before you pay when you can. Meet in a public
          place. Do not send OTPs, remote-access apps, or banking passwords.
          Pippinway cannot reverse a transfer you make outside the site.
          Longer advice is on the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Posting your own ad
        </h2>
        <p>
          Create an account, then open{" "}
          <GuestAuthLink
            href="/add-listing"
            className="text-[#FBB03B] hover:underline"
          >
            Add Listing
          </GuestAuthLink>
          . Add a truthful title, price, country, city, category, photos and
          description. Follow the{" "}
          <Link href="/posting-rules" className="text-[#FBB03B] hover:underline">
            posting rules
          </Link>
          . Live ads can appear in Latest Ads after they are eligible to show.
          Edit or delete your ads from the listing page or My Listings.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Featured Ads and Rewards
        </h2>
        <p>
          Featured Credits make one of your live ads appear more often for a
          limited time. Rewards spins come from eligible published listings,
          not from viewing or clicking Google ads. Details are in the{" "}
          <Link href="/terms" className="text-[#FBB03B] hover:underline">
            Terms
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
