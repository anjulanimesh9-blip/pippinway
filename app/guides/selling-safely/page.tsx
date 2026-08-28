import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Selling Safely on Pippinway",
  description:
    "How to write accurate Pippinway listings, handle buyer messages, avoid fake-payment scams, and update ads after a sale.",
  alternates: {
    canonical: `${SITE_URL}/guides/selling-safely`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Selling Safely on Pippinway",
    description:
      "Practical steps for posting honest ads and completing sales more carefully on Pippinway.",
    url: `${SITE_URL}/guides/selling-safely`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function SellingSafelyPage() {
  return (
    <LegalPageShell title="Selling safely on Pippinway" updated="28 August 2026">
      <p>
        Anyone with a Pippinway account can post an ad from Add Listing: title,
        price, country, city, category, WhatsApp number, description and up to
        four photos. After you publish, a live ad can appear in Latest Ads.
        This guide covers how to sell without oversharing, and how to avoid
        buyers who never intend to pay.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Write an accurate listing
        </h2>
        <p>
          Describe the item you actually have. Include faults, mileage, missing
          accessories, or that a phone is locked to an account. Misleading ads
          waste everyone’s time and can be removed under the{" "}
          <Link href="/terms" className="text-[#FBB03B] hover:underline">
            Terms
          </Link>
          . Use a clear title that matches the category you picked — Cars,
          Electronics, Property, and so on — so the right buyers find it.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Use clear, real photos
        </h2>
        <p>
          Photograph the real item in ordinary light. Show corners, screens,
          dashboards, or rooms from more than one angle. Do not use
          manufacturer catalogue shots as if they were your photos. Buyers on
          Pippinway decide from the listing gallery; honest pictures reduce
          no-shows and arguments at handover.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Price realistically
        </h2>
        <p>
          Look at similar live ads in your country on Pippinway before you set
          a figure. Extreme underpricing attracts scam “buyers” as well as
          genuine ones. Extreme overpricing just sits in the feed. Featured
          Credits change how often an approved ad appears; they do not change
          whether the price makes sense.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Answer buyer questions
        </h2>
        <p>
          Reply through Pippinway chat or WhatsApp with the same facts that are
          on the listing. If you no longer have the item, say so and take the
          ad down. Ignoring people or changing the price only in private
          messages creates confusion and looks like bait.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Protect personal information
        </h2>
        <p>
          You already share a WhatsApp number if you put it on the ad. You do
          not need to share your full home address, ID numbers, or bank login
          details in the first message. Meet in a public place for handover
          when you can. For property viewings, consider having someone with
          you.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Fake-payment scams
        </h2>
        <p>
          A buyer may send a screenshot that looks like a bank or EcoCash or
          card payment and ask you to release the item or refund an
          “overpayment.” Check your own account. Until the money is actually
          there, you have not been paid. Overpayment-and-refund stories are a
          classic fraud. Pippinway does not process those transfers.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          OTPs, passwords and strange links
        </h2>
        <p>
          Nobody needs your Pippinway password, email code, or SMS OTP to buy
          your item. Do not install remote-access apps because a “buyer”
          wants to pay from your phone. Do not tap links that claim to be
          Pippinway billing, Rewards payout, or Featured Ads invoices unless
          you opened Featured Packages or Rewards yourself on www.pippinway.com.
        </p>
        <p className="mt-4">
          Rewards spins come from eligible published listings, not from
          clicking Google ads. Anyone who tells you to interact with
          advertisements to unlock a prize is not describing how Pippinway
          Rewards works.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Meet safely and confirm payment
        </h2>
        <p>
          Choose a public location. For vehicles, bring documents and do not
          hand over keys until you have confirmed payment in your own app or
          bank. For cash, count it. For higher-value electronics, consider
          completing the transfer while you are still together.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Keep records and close the listing
        </h2>
        <p>
          Keep chat history and proof of payment. After the sale, use Edit or
          Delete on the listing page, or My Listings in your profile, so the
          ad does not stay in Latest Ads. Leaving a sold item up invites more
          messages and can look like a phantom listing.
        </p>
        <p className="mt-4">
          If a buyer’s messages look like fraud aimed at other users, email
          the listing link to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          . There is no separate report form in the app today. See the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/buying-safely"
            className="text-[#FBB03B] hover:underline"
          >
            Buying safely
          </Link>{" "}
          for the other side of a deal.
        </p>
      </section>
    </LegalPageShell>
  );
}
