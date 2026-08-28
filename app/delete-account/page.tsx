import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/app/components/legal/LegalPageShell";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

const DELETE_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Pippinway%20Account%20Deletion%20Request`;

export const metadata: Metadata = {
  title: "Delete Account | Pippinway",
  description: "Request deletion of your Pippinway account and associated data.",
  alternates: {
    canonical: `${SITE_URL}/delete-account`,
  },
};

export default function DeleteAccountPage() {
  return (
    <LegalPageShell title="Delete Your Pippinway Account">
      <p>
        You can request deletion of your Pippinway account and associated
        personal data at any time.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          How to request account deletion
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Send an account deletion request to{" "}
            <a
              href={DELETE_MAILTO}
              className="text-[#FBB03B] hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            Use the email address associated with your Pippinway account.
          </li>
          <li>
            Include <strong>&quot;Account Deletion Request&quot;</strong> in
            the subject line.
          </li>
          <li>
            We will process the request and delete the account and associated
            personal data, subject to any information that must be retained
            for legal, security, or fraud-prevention purposes.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Data that will be deleted
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your Pippinway account</li>
          <li>Your account profile information</li>
          <li>Your listings and associated account information</li>
          <li>Your favorites and saved account data</li>
          <li>Your account-related chat information, where applicable</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Data that may be retained
        </h2>
        <p>
          Certain information may be retained when required by law or
          necessary for security, fraud prevention, dispute resolution, or
          other legitimate legal purposes. Any retained information will only
          be kept for as long as necessary.
        </p>
      </section>

      <section className="rounded-2xl border border-[#FBB03B]/30 bg-[#111827] p-5">
        <h2 className="text-lg font-semibold text-white">
          Request account deletion
        </h2>
        <p className="mt-2">
          Contact Pippinway at{" "}
          <a
            href={DELETE_MAILTO}
            className="text-[#FBB03B] hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <a
          href={DELETE_MAILTO}
          className="mt-4 inline-block rounded-lg bg-[#FBB03B] px-6 py-3 font-semibold text-black transition hover:bg-[#e09a2a]"
        >
          Request Account Deletion
        </a>
      </section>

      <p>
        For more information about how Pippinway handles personal data, please
        see our{" "}
        <Link href="/privacy" className="text-[#FBB03B] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
