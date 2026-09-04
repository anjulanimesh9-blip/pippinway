"use client";

import { useState } from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { trackSellerContact, type ContactMethod } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";

type ActionButtonsProps = {
  whatsappLink?: string;
  phone?: string;
  onChat: () => void;
  listingId?: string;
  category?: string;
  country?: string;
};

function maskPhone(phone: string, fallback: string) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return fallback;
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
  const { t } = useI18n();
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
              <span className="block font-semibold">
                {maskPhone(phone, t("listing.clickToShowPhone"))}
              </span>
              <span className="text-xs font-normal text-sky-400">
                {t("listing.clickToShowPhone")}
              </span>
            </span>
          </button>
        )
      ) : (
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 text-sm text-gray-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
            <FaPhoneAlt size={14} />
          </span>
          {t("listing.phoneUnavailable")}
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
        {t("listing.chat")}
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
          {t("listing.whatsapp")}
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
            <FaWhatsapp size={18} />
          </span>
          {t("listing.whatsappUnavailable")}
        </div>
      )}
    </div>
  );
}
