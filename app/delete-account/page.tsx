export const metadata = {
  title: "Delete Account | Pippinway",
  description: "Request deletion of your Pippinway account and associated data.",
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Delete Your Pippinway Account
          </h1>

          <p className="mt-3 text-gray-600">
            You can request deletion of your Pippinway account and associated
            personal data at any time.
          </p>
        </div>

        <section className="space-y-6 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              How to request account deletion
            </h2>

            <ol className="mt-3 list-decimal space-y-2 pl-6">
              <li>
                Send an account deletion request to{" "}
                <a
                  href="mailto:support@pippinway.com?subject=Pippinway%20Account%20Deletion%20Request"
                  className="font-medium text-purple-600 hover:underline"
                >
                 anjulanimesh9@gmail.com
                </a>
              </li>
              <li>
                Use the email address associated with your Pippinway account.
              </li>
              <li>
                Include <strong>&quot;Account Deletion Request&quot;</strong>{" "}
                in the subject line.
              </li>
              <li>
                We will process the request and delete the account and
                associated personal data, subject to any information that must
                be retained for legal, security, or fraud-prevention purposes.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Data that will be deleted
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Your Pippinway account</li>
              <li>Your account profile information</li>
              <li>Your listings and associated account information</li>
              <li>Your favorites and saved account data</li>
              <li>Your account-related chat information, where applicable</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Data that may be retained
            </h2>

            <p className="mt-3">
              Certain information may be retained when required by law or
              necessary for security, fraud prevention, dispute resolution, or
              other legitimate legal purposes. Any retained information will
              only be kept for as long as necessary.
            </p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Request account deletion
            </h2>

            <p className="mt-2 text-gray-600">
              Contact Pippinway using the button below.
            </p>

            <a
              href="mailto:support@pippinway.com?subject=Pippinway%20Account%20Deletion%20Request"
              className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              Request Account Deletion
            </a>
          </div>

          <div className="border-t pt-6">
            <p>
              For more information about how Pippinway handles personal data,
              please see our{" "}
              <a
                href="/privacy-policy"
                className="font-medium text-purple-600 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}