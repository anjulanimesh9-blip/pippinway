import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pippinway handles account data, listings, messages, Firebase services, advertising and account deletion requests.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pippinway Privacy Policy",
    description:
      "Privacy practices for the Pippinway classified marketplace, including Firebase, AdSense and account deletion.",
    url: `${SITE_URL}/privacy`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="28 August 2026">
      <p>
        This policy describes how Pippinway handles information when you use
        www.pippinway.com. It reflects the features that exist in the current
        product. It is not legal advice and it does not claim that Pippinway
        is a particular registered company.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          1. Information you provide
        </h2>
        <p>
          When you register you provide an email address, a password, a phone
          number and a country. In profile settings you may add a display name
          and a profile photo. When you post a listing you provide a title,
          price, country, city or location, category, WhatsApp number,
          description and photos (up to four images per ad).
        </p>
        <p className="mt-4">
          If you use in-app chat, the messages you send are stored so the
          conversation can be shown to you and the other person. If you win a
          cash reward, you may submit payout details such as a method (for
          example PayPal, bank transfer or Wise), name, email, account
          identifier, bank name and notes. If you buy a Featured Package you
          may upload payment-proof images for admin review.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          2. Information created by using the service
        </h2>
        <p>
          Pippinway stores account records, listing records, favorites (saved
          listing IDs under your user), notifications, featured-credit balances
          and reward history associated with your account. Listing images and
          some profile or payment-proof files are stored as files, not only as
          text. Technical identifiers needed for sign-in (Firebase
          Authentication) are processed so you can stay logged in.
        </p>
        <p className="mt-4">
          The homepage remembers the country you last selected in the browser’s
          local storage so filters can persist between visits. Listing pages
          may also keep a short-lived “saved” heart state in the page until you
          leave.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          3. How we use this information
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and sign you into an account.</li>
          <li>Publish, edit, expire and display marketplace listings.</li>
          <li>Let buyers and sellers message each other.</li>
          <li>Save favorites and show notifications.</li>
          <li>Run Featured Ads, packages and Rewards, including cash-prize follow-up.</li>
          <li>Review payment proof and moderate listings or accounts.</li>
          <li>Operate, secure and debug the website.</li>
          <li>Respond to support and deletion requests.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          4. Firebase and Google infrastructure
        </h2>
        <p>
          Pippinway uses Google Firebase: Authentication (email and password
          sign-in, with browser persistence via IndexedDB and local storage),
          Cloud Firestore (accounts, listings, chats, favorites, notifications,
          rewards and related records), Firebase Storage (listing photos,
          profile images and similar uploads), and Cloud Functions (including
          reward spins, listing expiry logic and related server actions). Those
          services run on Google’s infrastructure. Google processes data as
          needed to provide them, under Google’s own terms for Firebase.
        </p>
        <p className="mt-4">
          The Firebase project configuration includes a Google Analytics
          measurement ID. The current website code does not initialize the
          Firebase Analytics SDK. If that changes, this policy should be
          updated.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          5. Advertising, cookies and similar technologies
        </h2>
        <p>
          The site loads the Google AdSense script (publisher ID
          ca-pub-5400699100789727) on every page so Google can serve or measure
          ads if the programme is approved and ads are shown. Third-party
          vendors, including Google, may use cookies or similar technologies to
          serve and measure advertising, including ads based on visits to this
          and other sites, where their policies allow. You can learn more from
          Google’s advertising documentation and, where offered, ads settings
          or cookie controls in your browser.
        </p>
        <p className="mt-4">
          The site also loads the Meta (Facebook) Pixel. That tool may set
          cookies or similar identifiers to help measure visits and events that
          the pixel is configured to record.
        </p>
        <p className="mt-4">
          Pippinway itself uses local storage for the selected country filter
          and Firebase Auth persistence. These are needed for basic sign-in and
          browsing, not for Rewards. Rewards are never earned by viewing or
          clicking ads.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          6. Listings, images and public information
        </h2>
        <p>
          Anything you put in a live listing — including photos, price, city,
          WhatsApp number and description — can be seen by other visitors and
          by search engines that crawl public listing pages. Do not publish
          information you are not willing to show publicly.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          7. Messages, favorites and location
        </h2>
        <p>
          Chat content is stored to deliver the conversation and to help with
          abuse review. Favorites are stored against your user account.
          Country and city on a listing come from what you typed; the homepage
          country filter is also stored locally in your browser.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          8. Sharing
        </h2>
        <p>
          Pippinway shares information with the service providers required to
          run the product (Firebase / Google, and advertising or measurement
          partners named above). Listing content is shown to other users by
          design. Pippinway may also disclose information if required by law or
          to investigate fraud or abuse. Pippinway does not sell listing
          databases as a consumer product in the current app.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          9. Retention and security
        </h2>
        <p>
          Listings are intended as time-limited classified ads and may expire
          after a period set by the service (currently on the order of thirty
          days for ordinary ads, unless featured rules keep an ad highlighted
          for a shorter featured window). Account, chat, reward and payment
          records are kept while they are needed to operate the marketplace,
          pay rewards, or handle disputes. Reasonable technical measures are
          used, but no online service can promise perfect security.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          10. Your choices and rights
        </h2>
        <p>
          You can update profile fields in settings, change listing content you
          own, and delete listings you posted. You can request deletion of the
          account through{" "}
          <Link href="/delete-account" className="text-[#FBB03B] hover:underline">
            Delete Account
          </Link>{" "}
          or the Danger Zone in settings. Some records may be kept where needed
          for security, fraud prevention or legal reasons, only for as long as
          that purpose requires.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          11. Children
        </h2>
        <p>
          Pippinway is aimed at people who are old enough to form a classifieds
          account under the laws that apply to them. Pippinway does not
          knowingly collect personal information from children in violation of
          those laws. If you believe a child has created an account, use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          12. Changes
        </h2>
        <p>
          If this policy changes, the updated text will be posted on this page
          with a new date. Continued use of Pippinway after an update means you
          should read the new version.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          13. Privacy questions
        </h2>
        <p>
          Use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Support
          </Link>{" "}
          and the in-app Help path. Pippinway will not list a phone number or
          postal address here unless the owner publishes one in the product.
        </p>
      </section>
    </LegalPageShell>
  );
}
