"use client";

import Link from "next/link";
import { GuestAuthLink } from "../../GuestAuthPrompt";
import useCountryNavigation from "@/app/hooks/useCountryNavigation";
import { useI18n } from "@/lib/i18n";

function FooterLinks({
  links,
}: {
  links: Array<{ href: string; label: string; auth?: boolean }>;
}) {
  return (
    <div className="flex flex-col gap-3 text-gray-400">
      {links.map((link) =>
        link.auth ? (
          <GuestAuthLink
            key={link.href + link.label}
            href={link.href}
            className="transition hover:text-[#FBB03B]"
          >
            {link.label}
          </GuestAuthLink>
        ) : (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="transition hover:text-[#FBB03B]"
          >
            {link.label}
          </Link>
        )
      )}
    </div>
  );
}

export default function Footer() {
  const { marketplaceHome, addListingHref } = useCountryNavigation();
  const { t } = useI18n();
  const pippinwayLinks = [
    { href: "/about", label: t("footer.about") },
    { href: "/how-it-works", label: t("footer.howItWorks") },
  ];
  const supportLinks = [
    { href: "/contact", label: t("footer.helpContact") },
    { href: "/safety", label: t("footer.safety") },
    { href: "/posting-rules", label: t("footer.postingRules") },
  ];
  const legalLinks = [
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
  ];
  const marketplaceLinks = [
    { href: marketplaceHome, label: t("footer.browseListings") },
    { href: "/categories", label: t("footer.categories") },
    { href: addListingHref, label: t("footer.postAd"), auth: true },
  ];

  return (
    <footer className="mt-16 border-t border-gray-800 bg-[#020817] lg:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/images/logo.png"
              alt="Pippinway"
              className="mb-4 w-[180px] max-w-full sm:w-[220px]"
            />
            <p className="text-sm leading-7 text-gray-400">
              {t("footer.blurb")}
            </p>
            <h3 className="mb-3 mt-6 text-lg font-bold text-white">{t("footer.pippinway")}</h3>
            <FooterLinks links={pippinwayLinks} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{t("footer.support")}</h3>
            <FooterLinks links={supportLinks} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{t("footer.legal")}</h3>
            <FooterLinks links={legalLinks} />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{t("footer.marketplace")}</h3>
            <FooterLinks links={marketplaceLinks} />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>{t("footer.copyright", { year: 2026 })}</p>
        </div>
      </div>
    </footer>
  );
}
