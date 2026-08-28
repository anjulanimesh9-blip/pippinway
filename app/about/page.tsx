import type { Metadata } from "next";
import Link from "next/link";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { FACEBOOK_PAGE, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Pippinway",
  description:
    "Pippinway is a classified marketplace where people buy, sell and discover cars, property, electronics, jobs and more across multiple countries.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "About Pippinway",
    description:
      "Learn how Pippinway connects buyers and sellers through free classified listings, chat, Featured Ads and Rewards.",
    url: `${SITE_URL}/about`,
    siteName: "Pippinway",
    type: "website",
  },
};

const CATEGORIES = [
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
  "Animals",
  "Furniture",
  "Education",
  "Other",
];

const COUNTRIES = [
  "Sri Lanka",
  "Zimbabwe",
  "India",
  "Singapore",
  "the United Kingdom",
  "the United States",
  "Canada",
  "Thailand",
  "South Africa",
  "the Maldives",
];

export default function AboutPage() {
  return (
    <LegalPageShell title="About Pippinway">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">What Pippinway is</h2>
        <p>
          Pippinway is an online classified marketplace. People use it to list
          items and services, browse what others are offering, and get in touch
          when they want to buy or sell. The site is built so that a car in
          Colombo, a phone in Harare, or a spare room in London can sit in the
          same kind of listing card — with photos, a price, a place, and a way
          to message the person who posted it.
        </p>
        <p className="mt-4">
          Pippinway is not a warehouse and it is not the seller of most goods
          you see. Independent users create their own ads. Pippinway supplies
          the pages, search, filters, chat, and account tools that make those
          ads usable.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Buy, sell and discover
        </h2>
        <p>
          Anyone with an account can post an ad. Anyone visiting the homepage
          can browse Latest Ads, filter by country and category, and open a
          listing for the full description. Discovery is the point: Pippinway
          exists so buyers and sellers who would not otherwise meet can find
          each other without needing a separate shopfront for every small sale.
        </p>
        <p className="mt-4">
          Listings typically include a title, price, category, city or area,
          country, photos, and a description written by the seller. Many sellers
          also share a WhatsApp number. Buyers can start an in-app chat from
          the listing page when they are signed in.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Categories on the marketplace
        </h2>
        <p>
          The marketplace is organised so you can scan a type of listing instead
          of scrolling everything at once. Current categories include{" "}
          {CATEGORIES.slice(0, -1).join(", ")} and{" "}
          {CATEGORIES[CATEGORIES.length - 1]}. You can
          open the full grid from{" "}
          <Link href="/categories" className="text-[#FBB03B] hover:underline">
            Categories
          </Link>{" "}
          or filter from the homepage.
        </p>
        <p className="mt-4">
          Country filters currently cover {COUNTRIES.slice(0, -1).join(", ")}{" "}
          and {COUNTRIES.at(-1)}. Currency labels on a listing follow the
          country the seller selected when they posted.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Making local buying and selling simple
        </h2>
        <p>
          The goal is practical: post an ad without a complicated store setup,
          find something nearby or in another supported country, and talk to
          the other person in one place. Search, location, sort and category
          controls sit above the listing feed so you can narrow results without
          leaving the homepage.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Marketplace safety
        </h2>
        <p>
          Pippinway shows safety reminders on listing pages because classified
          deals still happen between people. Treat every ad as coming from an
          independent seller. Inspect goods in person when you can, use public
          meeting spots, and do not send money, one-time passwords, or banking
          details to someone you have not verified.
        </p>
        <p className="mt-4">
          Pippinway does not take possession of most advertised products and
          does not guarantee that a listing is accurate. If an ad looks like a
          scam, use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Help
          </Link>{" "}
          and the in-app Help option in your profile. Pippinway may remove
          listings or restrict accounts that break the{" "}
          <Link href="/terms" className="text-[#FBB03B] hover:underline">
            Terms
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          How to post a listing
        </h2>
        <p>
          Sign in (or register with email, password, phone and country), then
          open{" "}
          <GuestAuthLink href="/add-listing" className="text-[#FBB03B] hover:underline">
            Add Listing
          </GuestAuthLink>
          . You add a title, price, country, city, category, WhatsApp number,
          description and up to four photos. After you publish, the ad can
          appear in Latest Ads when it is live. You can edit or delete your
          own ads from the listing page or from My Listings in your profile.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Featured Listings
        </h2>
        <p>
          Featured Ads are ordinary live listings that a seller chooses to
          highlight so they appear more often in the homepage feed. Sellers
          obtain Featured Credits by buying a featured package (payment proof
          is reviewed before credits are granted) or, when eligible, by
          receiving credits from Pippinway Rewards. Credits are then applied to
          a listing the seller owns. Featured placement is a visibility tool.
          It is not an endorsement that Pippinway has inspected the item.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Pippinway Rewards
        </h2>
        <p>
          Rewards are a prize-wheel programme for people who post eligible
          marketplace listings. Spins unlock from approved listing activity —
          for example, a cycle of published ads — not from browsing the site
          and not from advertising. You cannot earn Rewards by clicking,
          viewing, or interacting with Google ads or AdSense impressions.
          Prize outcomes may include extra Featured Credits, another spin, or
          a cash prize that requires payout details. Full rules are in the{" "}
          <Link href="/terms" className="text-[#FBB03B] hover:underline">
            Terms
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Contact and support
        </h2>
        <p>
          For account issues, listing problems, Featured Ads, Rewards, privacy
          questions or general help, email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or use the{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact
          </Link>{" "}
          page. Signed-in users can also open Help from the profile menu, which
          currently goes to Pippinway’s Facebook page at{" "}
          <a
            href={FACEBOOK_PAGE}
            className="text-[#FBB03B] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com
          </a>
          . Account deletion steps are on{" "}
          <Link href="/delete-account" className="text-[#FBB03B] hover:underline">
            Delete Account
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Buying and selling more safely
        </h2>
        <p>
          Pippinway does not inspect every item and does not guarantee
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
          </Link>{" "}
          before you meet someone or send money.
        </p>
      </section>
    </LegalPageShell>
  );
}
