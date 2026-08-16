"use client";

import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";

type ActionButtonsProps = {
  whatsappLink?: string;
  phone?: string;
  onChat: () => void;
};

export default function ActionButtons({
  whatsappLink,
  phone,
  onChat,
}: ActionButtonsProps) {
  const hasWhatsapp =
    whatsappLink &&
    whatsappLink !== "#" &&
    whatsappLink.trim() !== "";

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Contact Seller
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Call */}
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 text-white font-semibold text-lg shadow-lg transition duration-300 hover:scale-[1.03]"
          >
            <FaPhoneAlt className="text-xl" />
            <span>Call</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-3 rounded-2xl bg-gray-700 py-4 text-gray-400 font-semibold cursor-not-allowed"
          >
            <FaPhoneAlt className="text-xl" />
            <span>Call</span>
          </button>
        )}

        {/* Chat */}
        <button
          onClick={onChat}
          className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-white font-semibold text-lg shadow-lg transition duration-300 hover:scale-[1.03]"
        >
          <BsChatDotsFill className="text-xl" />
          <span>Chat</span>
        </button>

        {/* WhatsApp */}
        {hasWhatsapp ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 py-4 text-white font-semibold text-lg shadow-lg transition duration-300 hover:scale-[1.03]"
          >
            <FaWhatsapp className="text-2xl" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-3 rounded-2xl bg-gray-700 py-4 text-gray-400 font-semibold cursor-not-allowed"
          >
            <FaWhatsapp className="text-2xl" />
            <span>WhatsApp</span>
          </button>
        )}

      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-center text-sm text-gray-400">
          Contact the seller directly using Call, Chat or WhatsApp.
        </p>
      </div>

    </div>
  );
}