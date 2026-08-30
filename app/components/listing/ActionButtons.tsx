"use client";

import { useState } from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { trackSellerContact, type ContactMethod } from "@/lib/analytics";

type ActionButtonsProps = {
  whatsappLink?: string;
  phone?: string;
  onChat: () => void;
  listingId?: string;
  category?: string;
  country?: string;
};

function maskPhone(phone: string) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return "Click to show phone number";
  return `${"•".repeat(Math.max(digits.length - 3, 4))} ${digits.slice(-3)}`;
}

export default function ActionButtons({
  whatsappLink,
  phone,
  onChat,
  listingId,
  category,
  country,
}: ActionButtonsProps) {
  const [showPhone, setShowPhone] = useState(false);
  const hasWhatsapp =
    whatsappLink && whatsappLink !== "#" && whatsappLink.trim() !== "";

  const trackContact = (contact_method: ContactMethod) => {
    if (!listingId) return;
    trackSellerContact({
      listing_id: listingId,
      contact_method,
      category,
      country,
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111827]">
      {phone ? (
        showPhone ? (
          <a
            href={`tel:${phone}`}
            onClick={() => trackContact("call")}
            className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
              <FaPhoneAlt size={14} />
            </span>
            {phone}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3.5 text-left text-sm font-medium text-white hover:bg-white/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
              <FaPhoneAlt size={14} />
            </span>
            <span>
              <span className="block font-semibold">{maskPhone(phone)}</span>
              <span className="text-xs font-normal text-sky-400">
                Click to show phone number
              </span>
            </span>
          </button>
        )
      ) : (
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 text-sm text-gray-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
            <FaPhoneAlt size={14} />
          </span>
          Phone not available
        </div>
      )}

      <button
        type="button"
        onClick={onChat}
        className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBB03B]/20 text-[#FBB03B]">
          <BsChatDotsFill size={15} />
        </span>
        Chat
      </button>

      {hasWhatsapp ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("whatsapp")}
          className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <FaWhatsapp size={18} />
          </span>
          WhatsApp
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
            <FaWhatsapp size={18} />
          </span>
          WhatsApp not available
        </div>
      )}
    </div>
  );
}
