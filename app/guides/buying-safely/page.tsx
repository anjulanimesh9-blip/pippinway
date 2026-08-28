import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buying Safely on Pippinway",
  description:
    "A practical guide to researching Pippinway listings, asking questions, inspecting items, and spotting payment and meeting scams.",
  alternates: {
    canonical: `${SITE_URL}/guides/buying-safely`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Buying Safely on Pippinway",
    description:
      "How to research ads, contact sellers, and complete local purchases more carefully on Pippinway.",
    url: `${SITE_URL}/guides/buying-safely`,
    siteName: "Pippinway",
    type: "website",
  },
};

export default function BuyingSafelyPage() {
  return (
    <LegalPageShell title="Buying safely on Pippinway" updated="28 August 2026">
      <p>
        This guide is for people browsing Pippinway ads — cars, property,
        electronics, fashion, jobs and the other categories on the homepage.
        Pippinway hosts the listing. You still decide whether the person on
        the other side is someone you want to meet or pay.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Research the listing
        </h2>
        <p>
          Open the full listing page, not only the card in Latest Ads. Read
          the title, price, country, city, category and the seller’s own
          description. Look at every photo. Stock images, one blurry picture,
          or photos that do not match the text are reasons to ask more
          questions before you travel.
        </p>
        <p className="mt-4">
          Note when the ad was posted. A brand-new account with an expensive
          item and pressure to pay the same day is higher risk than a detailed
          local ad with several real photos.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Compare prices
        </h2>
        <p>
          Use Pippinway search, country and category filters to see what
          similar items cost in the same market. If one ad is far cheaper than
          the rest, ask why — cosmetic damage, missing charger, urgent move —
          and verify that explanation in person. Do not treat a low number on
          the card as a locked-in bargain.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Check seller and listing details
        </h2>
        <p>
          The listing page shows the name the poster used and a link to their
          seller shop when an owner id exists. A Verified Seller label appears
          only when that account has been marked in admin tools. Most sellers
          will not have that badge. Absence of a badge is normal, not proof of
          a scam — and a badge is not a guarantee of the item.
        </p>
        <p className="mt-4">
          Featured Ads are ordinary live listings that were highlighted with
          credits. They are not inspected by Pippinway.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Ask questions
        </h2>
        <p>
          Use Pippinway chat or the WhatsApp number on the ad. Ask about
          condition, reason for selling, whether the price includes extras, and
          where you can view the item. Clear, patient answers are a good sign.
          Copy-paste replies, refusal to meet, or a request to continue only
          on a new “secure payment website” are not.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Inspect products
        </h2>
        <p>
          For phones, laptops and consoles: power the device on, check storage,
          test cameras and ports, and confirm the serial or IMEI matches what
          the seller claimed. For fashion and furniture: check size, stains and
          completeness. Do not pay in full for a sealed box you are not allowed
          to open if that is unusual for that kind of sale.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Vehicles
        </h2>
        <p>
          See the car or bike in daylight. Check documents that matter in that
          country, rust, warning lights, and service history if offered. A
          short test drive in a safe area is reasonable for many private sales.
          Do not transfer a large deposit to “hold” a vehicle you have not
          seen. Pippinway does not broker vehicle finance.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Electronics
        </h2>
        <p>
          Beware of “shipping from abroad, pay customs first” stories attached
          to a local-looking ad. Prefer handover in person. If you must use a
          courier, use a method you understand and never share card PINs or
          remote-access apps so the seller can “help you pay.”
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Property and rentals
        </h2>
        <p>
          Visit the place. Meet the person who claims to be the owner or agent.
          Be cautious of listings that only offer video tours and then ask for
          a holding deposit to a personal account before you have a written
          agreement that you understand. Pippinway is not a letting agent and
          does not verify title deeds.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Payment scams and meetings
        </h2>
        <p>
          Common patterns include fake payment screenshots, requests to pay a
          “courier insurance fee,” and jobs that ask you to send money to
          receive a larger return. Pay only when you are satisfied with the
          item, using a method you can trace. Meet in a public place. Tell
          someone where you are going.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Keep records and red flags
        </h2>
        <p>
          Save the listing URL, chat, and any payment confirmation. Red flags
          include OTPs, remote-access software, prices that collapse only if
          you pay in the next ten minutes, and sellers who will not let you
          inspect the item.
        </p>
        <p className="mt-4">
          There is no in-app report button. Email the listing link to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or see{" "}
          <Link href="/contact" className="text-[#FBB03B] hover:underline">
            Contact
          </Link>
          . Broader marketplace advice is on the{" "}
          <Link href="/safety" className="text-[#FBB03B] hover:underline">
            Safety Center
          </Link>
          . Sellers can read{" "}
          <Link
            href="/guides/selling-safely"
            className="text-[#FBB03B] hover:underline"
          >
            Selling safely
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
