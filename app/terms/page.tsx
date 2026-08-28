import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms for using Pippinway, including listings, Featured Ads, Rewards, prohibited content and marketplace responsibilities.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pippinway Terms and Conditions",
    description:
      "Rules for buying, selling and using Featured Ads and Rewards on the Pippinway marketplace.",
    url: `${SITE_URL}/terms`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms and Conditions" updated="28 August 2026">
      <p>
        These terms apply when you use www.pippinway.com. They describe a
        classified marketplace operated as “Pippinway”. They are not a
        substitute for professional legal advice.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          1. Acceptance
        </h2>
        <p>
          By creating an account or using the site, you agree to these terms
          and the{" "}
          <Link href="/privacy" className="text-[#FBB03B] hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use Pippinway.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          2. Eligibility and accounts
        </h2>
        <p>
          You must be old enough to use an online marketplace under the laws
          that apply to you. You are responsible for the email and password you
          register, for activity on the account, and for keeping contact
          details in settings reasonably accurate. Pippinway may refuse,
          suspend or delete an account that is used for abuse, fraud or
          repeated policy breaches.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          3. Pippinway’s role
        </h2>
        <p>
          Pippinway is a platform. It hosts listings, search, chat and related
          tools. It is not the buyer or seller of most advertised goods and
          does not take title to those goods. A deal is between the people who
          use the listing. Pippinway does not guarantee that an item exists,
          that a price is fair, or that a seller or buyer will complete a
          transaction.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          4. Posting listings
        </h2>
        <p>
          You may post an ad only for something you are allowed to sell or
          offer. Provide a truthful title, price, category, location, photos
          and description. Photos should show the actual item or service.
          WhatsApp numbers you add will be visible on the public listing.
          Listings may be limited in number of images and may expire after a
          period set by the service. Pippinway or its admins may hide, reject
          or remove an ad.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          5. Seller and buyer responsibilities
        </h2>
        <p>
          Sellers must be able to supply what they advertised, at the price and
          in the condition described, or they must update or remove the ad.
          Buyers should inspect items, meet in safe places, and never pay
          solely because a listing looks professional. Both sides must keep
          chat and WhatsApp contact civil and lawful.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          6. Prohibited listings and content
        </h2>
        <p>
          Do not post illegal goods or services, stolen items, weapons or
          explosives where they are not lawful, drugs or other controlled
          substances, sexual content involving minors, scams, phishing,
          malware, counterfeit documents, or ads designed only to harvest
          personal data. Do not impersonate others or use another person’s
          photos without permission. Pippinway may remove content that appears
          to break these rules or applicable law.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          7. Fraud, scams and reporting
        </h2>
        <p>
          Do not run advance-fee scams, fake payment receipts, or “too good to
          be true” ads. Listing pages remind users to report suspicious ads.
          Report them through{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Help
          </Link>
          . Pippinway may cooperate with investigations where it is able to,
          but it is not a bank or an escrow service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          8. Communication
        </h2>
        <p>
          In-app chat is for discussing a listing. Do not use it to spam, harass
          or send malware. Pippinway may store messages to provide the feature
          and to review abuse.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          9. Marketplace transactions
        </h2>
        <p>
          Payment for the item itself happens outside Pippinway unless a
          specific product says otherwise. Featured Packages and cash-reward
          payouts are separate from the buyer–seller deal. Pippinway is not
          responsible for cash handed over in person or for transfers you make
          to another user.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          10. Featured Ads, credits and packages
        </h2>
        <p>
          Featured Credits make an eligible live listing appear more often in
          the homepage mix for a limited time. You can buy credits through
          Featured Packages by following the checkout flow and uploading
          payment proof. Credits are applied after admin approval. You can also
          receive credits as a Rewards prize. Credits are not cash, have no
          guaranteed resale value, and may be withheld if payment proof is
          invalid or the listing is not eligible. Featuring an ad is not a
          quality certificate.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          11. Rewards and the prize wheel
        </h2>
        <p>
          Pippinway Rewards are based on eligible marketplace listing activity.
          In the current programme, published approved ads count toward spin
          cycles (including a normal cycle and a larger mega cycle). The wheel
          may award extra Featured Credits, an extra spin, a “try again”
          result, or a cash amount. Cash prizes require you to submit payout
          details (such as PayPal, bank transfer or Wise). Pippinway reviews
          those details before paying and may reject requests that look
          fraudulent.
        </p>
        <p className="mt-4">
          Rewards are not earned by clicking Google advertisements, viewing
          Google advertisements, interacting with AdSense ads, or generating
          AdSense impressions. There is no link between Google ad interaction
          and spin eligibility. Abuse, fake listings, duplicate counting tricks
          or manipulation of the wheel may lead to lost spins, withheld cash
          and account action.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          12. Suspension and removal
        </h2>
        <p>
          Pippinway may remove listings, cancel Featured placement, freeze
          Rewards, or close accounts to protect other users or the service.
          Where possible, use Contact / Help if you think that was a mistake.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          13. Intellectual property
        </h2>
        <p>
          You keep rights in content you upload, and you grant Pippinway a
          licence to host and display it as part of the marketplace. Do not
          upload material you do not have the right to use. The Pippinway name,
          logo and site design are used to identify the service; you may not
          copy them to run a competing site that pretends to be Pippinway.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          14. Third-party services and ads
        </h2>
        <p>
          The site uses Firebase, may show Google AdSense ads, and loads a Meta
          Pixel. WhatsApp links go to a third-party app. Those services have
          their own terms. Pippinway is not responsible for third-party sites
          you open from a listing description or from an advertisement.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          15. Disclaimer
        </h2>
        <p>
          The marketplace is provided as available. Listings can be wrong,
          expired or fraudulent despite moderation. To the extent allowed by
          law, Pippinway is not liable for failed deals, loss of goods, or
          damages that arise from relying on another user’s ad or messages.
          Nothing in these terms excludes liability that cannot be excluded
          under applicable law.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          16. Changes
        </h2>
        <p>
          These terms may be updated on this page. The “Last updated” date
          shows the current version. Continued use after a change means you
          should review the new text.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          17. Contact
        </h2>
        <p>
          Questions about these terms: email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Support
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
