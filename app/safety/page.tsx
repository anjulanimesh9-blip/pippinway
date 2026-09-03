import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Marketplace Safety on Pippinway",
  description:
    "Practical safety guidance for buying and selling on Pippinway: chat, meetings, payments, OTPs, phishing, and how to report a suspicious listing.",
  alternates: {
    canonical: `${SITE_URL}/safety`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Marketplace Safety on Pippinway",
    description:
      "How to communicate, meet, and pay more carefully when using Pippinway classified ads.",
    url: `${SITE_URL}/safety`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function SafetyPage() {
  return (
    <LegalPageShell title="Pippinway Safety Center" updated="28 August 2026">
      <p>
        Pippinway is a classified marketplace. Independent people post ads for
        cars, motorbikes, property, electronics, fashion, jobs, services and
        more across the countries the site supports. Pippinway provides the
        listing pages, search, filters, in-app chat and account tools. It is
        not the seller of most items you see, it does not hold money in escrow,
        and it does not guarantee that a transaction will complete.
      </p>
      <p>
        This page explains how to use those tools more carefully. It is
        practical guidance, not a promise that every ad is genuine or that
        every seller has been identity-checked. Some accounts may show a
        Verified Seller badge when an admin has marked that account. Most
        listings are ordinary user posts.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          How Pippinway fits into a deal
        </h2>
        <p>
          A typical flow is: browse Latest Ads or search, open a listing, read
          the photos and description, then contact the poster through Pippinway
          chat or the WhatsApp number they chose to share. Featured Ads are
          listings a seller paid or used credits to highlight. Featured
          placement is visibility, not an inspection of the item.
        </p>
        <p className="mt-4">
          You and the other person decide where to meet, how to pay, and
          whether the item is acceptable. Keep that in mind before sending
          money, handing over goods, or sharing extra personal details.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Communicating safely
        </h2>
        <p>
          Prefer Pippinway chat for the first messages so you have a record
          next to the listing. If you move to WhatsApp, keep the conversation
          about the same ad — title, price, location and the questions you
          already asked on the listing page.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Ask for extra photos of serial numbers, damage, documents or the
            actual parking space or room. Vague answers or refusal to show the
            item are a reason to slow down.
          </li>
          <li>
            Keep the price discussion consistent with the listing. A sudden
            “new price” sent only on WhatsApp, with pressure to pay immediately,
            is a common scam pattern.
          </li>
          <li>
            Do not send copies of your ID, bank statements, or one-time
            passwords to “confirm you are a serious buyer.” Pippinway never
            asks for OTPs or banking passwords.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Check the item before you pay
        </h2>
        <p>
          For local deals, inspect the item in person when you can. Switch a
          phone on, test a laptop, look at a vehicle in daylight, walk a
          property, or check a fashion item for size and defects. If someone
          will only ship after full payment and you have never dealt with them,
          treat that as higher risk.
        </p>
        <p className="mt-4">
          Advance-payment scams often use urgency: “another buyer is coming,”
          “pay a deposit to reserve,” or “I already sent a courier.” Pippinway
          cannot reverse a bank transfer, mobile-money payment, or crypto
          payment you make outside the site.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Suspiciously low prices
        </h2>
        <p>
          Compare similar live ads in the same country and category on
          Pippinway. A brand-new phone, a car, or a rental far below nearby
          listings — especially with stock photos and little text — deserves
          extra questions. “Too good to be true” ads are not automatically
          removed by search ranking. You still have to judge them.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Passwords, OTPs and phishing
        </h2>
        <p>
          Nobody from Pippinway support will ask you to read out an SMS code,
          authenticator code, or email verification link. Do not type your
          password on a page that is not www.pippinway.com. If a message
          includes a shortened link “to update your ad” or “to release payment,”
          open the site yourself by typing the address or using your saved
          bookmark instead of tapping the link.
        </p>
        <p className="mt-4">
          Fake payment screenshots are common. Confirm money in your own bank
          or wallet app before you hand over an item. A PDF receipt is not
          payment.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Meeting for local transactions
        </h2>
        <p>
          Meet in a public place with other people around — a busy shop, a
          station, or a daytime café. Tell a friend where you are going. Bring
          someone with you for higher-value items such as vehicles. Avoid
          isolated car parks at night and avoid going to a private house for
          the first meeting if you feel uneasy.
        </p>
        <p className="mt-4">
          For vehicles, check documents that apply in that country (ownership,
          insurance, plates) and, where you can, have a mechanic look at the
          car. For property, visit in person, confirm who you are meeting, and
          do not pay a large “reservation fee” to an unknown person to “hold”
          a room. For electronics, verify IMEI or serial numbers and factory
          reset status before you pay.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Keep conversations clear
        </h2>
        <p>
          Agree in writing on the price, what is included (charger, spare
          keys, furniture), and when you will meet. If the story keeps changing,
          walk away. After a sale, sellers should edit or delete the listing
          from the listing page or My Listings so other buyers are not chasing
          an item that is gone.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Reporting a suspicious listing
        </h2>
        <p>
          Pippinway does not currently have a separate in-app “Report listing”
          button. If an ad looks fraudulent, email the full listing page link
          and a short description of the problem to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          . You can also use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Help
          </Link>
          . Include the title and URL so the team can find the same document in
          Firestore. Pippinway may remove ads that appear to break the{" "}
          <Link href="/terms" className="text-[#FBB03B] hover:underline">
            Terms
          </Link>
          . It cannot recover money you already sent.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          If something already looks fraudulent
        </h2>
        <p>
          Stop further payments. Keep screenshots of the listing, chat and
          payment requests. Change passwords if you shared an OTP. Contact your
          bank or mobile-money provider if you sent funds. Email Pippinway
          support with the listing link. For threats or theft, use local
          emergency or police channels in your country — Pippinway is not a
          law-enforcement agency.
        </p>
      </section>

      <p>
        More detail:{" "}
        <Link href="/posting-rules" className="text-[#FBB03B] hover:underline">
          Posting rules
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
    </LegalPageShell>
  );
}
