import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Posting Rules",
  description:
    "Rules for posting ads on Pippinway: accurate listings, prohibited content, duplicate and spam ads, and how to report a problem.",
  alternates: {
    canonical: `${SITE_URL}/posting-rules`,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Pippinway Posting Rules",
    description:
      "What you may post on Pippinway, what is prohibited, and how duplicate or misleading ads are handled.",
    url: `${SITE_URL}/posting-rules`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function PostingRulesPage() {
  return (
    <LegalPageShell title="Posting rules" updated="3 September 2026">
      <p>
        These rules apply when you publish a classified ad on Pippinway. They
        sit alongside the{" "}
        <Link href="/terms" className="text-[#FBB03B] hover:underline">
          Terms
        </Link>
        . Pippinway or its admins may hide, reject or remove an ad that
        appears to break them.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Post an accurate ad
        </h2>
        <p>
          Use a title that matches the item or service. Set a real price,
          category, country and city. Write a description you would accept if
          you were the buyer. Photos should show the actual item or place —
          not a random catalogue shot you do not have. WhatsApp numbers you
          add are public on the listing.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          One listing per offer
        </h2>
        <p>
          Do not flood Latest Ads with copies of the same item. If you need to
          change the price or photos, edit the existing ad. Duplicate and spam
          posts may be removed and can affect Rewards eligibility, which is
          based on genuine published listings — not on repeating the same ad.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Prohibited listings
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Illegal goods or services, stolen items, or fraud.</li>
          <li>Weapons, explosives, or controlled drugs where they are not lawful.</li>
          <li>Sexual content involving minors, or any sexual exploitation.</li>
          <li>Counterfeit documents, phishing, malware, or data-harvesting ads.</li>
          <li>Content that impersonates another person or uses their photos without permission.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Misleading ads
        </h2>
        <p>
          Do not advertise an item you cannot supply, a job that is only a
          deposit scam, or a property you do not have the right to offer. Do
          not bait with a low price and switch the deal in private messages.
          Featured placement does not excuse a misleading description.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          After the item sells
        </h2>
        <p>
          Edit or delete the listing so other buyers are not chasing something
          that is gone. Use the listing page or My Listings while signed in.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Reporting a problem
        </h2>
        <p>
          There is no in-app report button yet. Email the listing URL and a
          short description to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or use{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact / Help
          </Link>
          . Buying and meeting advice is on the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
