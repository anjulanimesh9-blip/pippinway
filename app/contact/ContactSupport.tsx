"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CreditCard,
  Gift,
  HelpCircle,
  LifeBuoy,
  Mail,
  Shield,
  ShieldAlert,
  Tag,
  User,
  Wrench,
} from "lucide-react";
import { GuestAuthLink } from "@/app/components/GuestAuthPrompt";
import { FACEBOOK_PAGE, SUPPORT_EMAIL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

const LINK =
  "text-[#FBB03B] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]";

const TOPICS: Array<{
  title: string;
  icon: typeof User;
  body: ReactNode;
}> = [
  {
    title: "Account problems",
    icon: User,
    body: (
      <>
        Sign in and open{" "}
        <GuestAuthLink href="/profile/settings" className={LINK}>
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
    icon: Tag,
    body: (
      <>
        To post, edit or remove your own ads, use{" "}
        <GuestAuthLink href="/add-listing" className={LINK}>
          Add Listing
        </GuestAuthLink>{" "}
        and{" "}
        <GuestAuthLink href="/profile/listings" className={LINK}>
          My Listings
        </GuestAuthLink>
        . On an ad you own, Edit and Delete appear on the listing page. Follow
        the{" "}
        <Link href="/posting-rules" className={LINK}>
          posting rules
        </Link>{" "}
        so ads stay accurate and lawful.
      </>
    ),
  },
  {
    title: "Reporting a suspicious listing",
    icon: ShieldAlert,
    body: (
      <>
        There is no in-app Report listing button today. Email the listing page
        link (for example https://www.pippinway.com/listings/…) and a short
        description to{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
          {SUPPORT_EMAIL}
        </a>
        . You can also use Help in your profile, which opens Pippinway’s
        Facebook page. More guidance is on the{" "}
        <Link href="/safety" className={LINK}>
          Safety Center
        </Link>
        .
      </>
    ),
  },
  {
    title: "Payments, Featured Ads and packages",
    icon: CreditCard,
    body: (
      <>
        Featured Credits come from{" "}
        <Link href="/featured-packages" className={LINK}>
          Featured Packages
        </Link>{" "}
        after you submit payment proof for admin review, or from Rewards when
        you win credits. Apply credits to your own live ads from{" "}
        <Link href="/featured-ads" className={LINK}>
          Featured Ads
        </Link>
        . Package questions should include the package name and the listing you
        wanted to feature.
      </>
    ),
  },
  {
    title: "Rewards",
    icon: Gift,
    body: (
      <>
        Open{" "}
        <Link href="/rewards" className={LINK}>
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
    icon: Shield,
    body: (
      <>
        Read how information is used on the{" "}
        <Link href="/privacy" className={LINK}>
          Privacy Policy
        </Link>
        . To request deletion, use{" "}
        <Link href="/delete-account" className={LINK}>
          Delete Account
        </Link>{" "}
        or the Danger Zone in profile settings if you are signed in.
      </>
    ),
  },
  {
    title: "Technical problems",
    icon: Wrench,
    body: (
      <>
        If a page fails to load, you cannot sign in, photos will not upload, or
        chat will not open, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
          {SUPPORT_EMAIL}
        </a>{" "}
        with the page URL, the device or browser you used, and what you
        expected to happen. Do not send passwords.
      </>
    ),
  },
  {
    title: "General support",
    icon: Mail,
    body: (
      <>
        Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
          {SUPPORT_EMAIL}
        </a>{" "}
        for general support. You can also use Help in the profile sidebar,
        which opens Pippinway’s Facebook page.
      </>
    ),
  },
];

export default function ContactSupport() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-300">
          <LifeBuoy className="h-3.5 w-3.5 text-[#FBB03B]" aria-hidden />
          {t("support.badge")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[2.125rem]">
          {t("pages.contact")}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-gray-400 sm:text-base">
          {t("support.lead")}
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <section
                key={topic.title}
                className="rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0B1220] text-gray-300">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-white sm:text-lg">
                      {topic.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-300 sm:text-[15px] sm:leading-7">
                      {topic.body}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 sm:p-5">
            <h2 className="text-base font-semibold text-white">
              {t("support.quickHelp")}
            </h2>
            <p className="mt-3 text-sm font-medium text-white">
              {t("support.needHelp")}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t("support.emailLabel")}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={`${LINK} mt-1 block break-all text-sm`}
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {t("support.noPhone")}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 sm:p-5">
            <h2 className="text-base font-semibold text-white">
              {t("support.links")}
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href="/safety"
                  className="flex min-h-11 items-center rounded-xl px-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                >
                  {t("support.safetyCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="flex min-h-11 items-center rounded-xl px-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                >
                  {t("support.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/posting-rules"
                  className="flex min-h-11 items-center rounded-xl px-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                >
                  {t("support.postingRules")}
                </Link>
              </li>
              <li>
                <a
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center rounded-xl px-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                >
                  {t("support.facebookHelp")}
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#FBB03B]/25 bg-[#111827] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <HelpCircle className="h-4 w-4 text-[#FBB03B]" aria-hidden />
              {t("support.emailSupport")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              {t("support.officialEmail")}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {t("support.facebookHelpBody")}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
