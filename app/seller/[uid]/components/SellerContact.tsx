"use client";

import { Seller } from "../hooks/useSeller";

interface Props {
  seller: Seller;
}

export default function SellerContact({
  seller,
}: Props) {
  const shareProfile = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${seller.displayName}'s Profile`,
          text: `Check out ${seller.displayName}'s profile on Pippinway`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">

      <h2 className="mb-6 text-xl font-bold text-white">
        Contact Seller
      </h2>

      <div className="space-y-3">

        {/* Message */}
        <button
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          💬 Message Seller
        </button>

        {/* WhatsApp */}
        {seller.whatsapp && (
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${seller.whatsapp.replace(/\D/g, "")}`,
                "_blank"
              )
            }
            className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            📱 WhatsApp
          </button>
        )}

        {/* Call */}
        {seller.phone && (
          <button
            onClick={() => window.open(`tel:${seller.phone}`)}
            className="w-full rounded-xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-600"
          >
            📞 Call Seller
          </button>
        )}

        {/* Share */}
        <button
          onClick={shareProfile}
          className="w-full rounded-xl border border-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          🔗 Share Profile
        </button>

      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#020817] p-4">
        <h3 className="mb-2 font-semibold text-white">
          Seller Safety Tips
        </h3>

        <ul className="space-y-2 text-sm text-slate-400">
          <li>✔ Meet in a safe public place.</li>
          <li>✔ Inspect the item before paying.</li>
          <li>✔ Never share passwords or OTP codes.</li>
          <li>✔ Report suspicious activity.</li>
        </ul>
      </div>

    </div>
  );
}