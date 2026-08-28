import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import { FACEBOOK_PAGE, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Pippinway Support",
  description:
    "How to reach Pippinway about accounts, listings, suspicious ads, payments, Featured Ads, Rewards and privacy.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Contact Pippinway Support",
    description:
      "Support paths for Pippinway marketplace accounts, listings, Featured Ads, Rewards and privacy requests.",
    url: `${SITE_URL}/contact`,
    siteName: "Pippinway",
    type: "website",
  },
};

const TOPICS: Array<{ title: string; body: ReactNode }> = [
  {
    title: "Account problems",
    body: (
      <>
        Sign in and open{" "}
        <GuestAuthLink href="/profile/settings" className="text-[#FBB03B] hover:underline">
          Profile settings
        </GuestAuthLink>{" "}
        to update your display name, phone, country, photo or password. If you
        cannot sign in, use Help from the profile menu after you recover access,
        or the Facebook page linked below.
      </>
    ),
  },
  {
    title: "Listings",
    body: (
      <>
        To post, edit or remove your own ads, use{" "}
        <GuestAuthLink href="/add-listing" className="text-[#FBB03B] hover:underline">
          Add Listing
        </GuestAuthLink>{" "}
        and{" "}
        <GuestAuthLink href="/profile/listings" className="text-[#FBB03B] hover:underline">
          My Listings
        </GuestAuthLink>
        . On an ad you own, Edit and Delete appear on the listing page.
      </>
    ),
  },
  {
    title: "Reporting a suspicious listing",
    body: (
      <>
        There is no in-app Report listing button today. Email the listing page
        link (for example https://www.pippinway.com/listings/…) and a short
        description to{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-[#FBB03B] hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        . You can also use Help in your profile, which opens Pippinway’s
        Facebook page. More guidance is on the{" "}
        <Link href="/safety" className="text-[#FBB03B] hover:underline">
          Safety Center
        </Link>
        .
      </>
    ),
  },
  {
    title: "Payments, Featured Ads and packages",
    body: (
      <>
        Featured Credits come from{" "}
        <Link href="/featured-packages" className="text-[#FBB03B] hover:underline">
          Featured Packages
        </Link>{" "}
        after you submit payment proof for admin review, or from Rewards when
        you win credits. Apply credits to your own live ads from{" "}
        <Link href="/featured-ads" className="text-[#FBB03B] hover:underline">
          Featured Ads
        </Link>
        . Package questions should include the package name and the listing you
        wanted to feature.
      </>
    ),
  },
  {
    title: "Rewards",
    body: (
      <>
        Open{" "}
        <Link href="/rewards" className="text-[#FBB03B] hover:underline">
          Rewards
        </Link>{" "}
        while signed in to see spin progress, history and cash-prize payout
        details. Rewards unlock from eligible published listings only. They are
        never granted for clicking or viewing Google advertisements.
      </>
    ),
  },
  {
    title: "Privacy and account deletion",
    body: (
      <>
        Read how information is used on the{" "}
        <Link href="/privacy" className="text-[#FBB03B] hover:underline">
          Privacy Policy
        </Link>
        . To request deletion, use{" "}
        <Link href="/delete-account" className="text-[#FBB03B] hover:underline">
          Delete Account
        </Link>{" "}
        or the Danger Zone in profile settings if you are signed in.
      </>
    ),
  },
  {
    title: "Technical problems",
    body: (
      <>
        If a page fails to load, you cannot sign in, photos will not upload, or
        chat will not open, email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-[#FBB03B] hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        with the page URL, the device or browser you used, and what you
        expected to happen. Do not send passwords.
      </>
    ),
  },
  {
    title: "General support",
    body: (
      <>
        Email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-[#FBB03B] hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        for general support. You can also use Help in the profile sidebar,
        which opens Pippinway’s Facebook page.
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <LegalPageShell title="Pippinway Support">
      <p>
        Use this page to work out where to go for account problems, listings,
        suspicious ads, payments, Featured Ads, Rewards, privacy concerns and
        general support. Email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-[#FBB03B] hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        for Pippinway support. Pippinway does not publish a phone number or
        street address. In-app paths below and the Facebook Help page remain
        available.
      </p>

      <div className="space-y-4">
        {TOPICS.map((topic) => (
          <section
            key={topic.title}
            className="rounded-2xl border border-white/10 bg-[#111827] p-5"
          >
            <h2 className="text-lg font-semibold text-white">{topic.title}</h2>
            <p className="mt-2 text-gray-300">{topic.body}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-[#FBB03B]/30 bg-[#111827] p-5">
        <h2 className="text-lg font-semibold text-white">Email support</h2>
        <p className="mt-2">
          Official Pippinway support, privacy and contact email:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <h2 className="text-lg font-semibold text-white">Facebook Help</h2>
        <p className="mt-2">
          Profile → Help opens{" "}
          <a
            href={FACEBOOK_PAGE}
            className="text-[#FBB03B] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pippinway on Facebook
          </a>
          . You can also email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
