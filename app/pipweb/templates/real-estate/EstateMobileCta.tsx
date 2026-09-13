import { MessageCircle, Phone } from "lucide-react";
import { ESTATE_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A54]";

export default function EstateMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8DFD2] bg-white/96 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a href={ESTATE_DEMO.phoneTel} className={`${TAP} border border-[#E8DFD2] text-[#2C2A26]`}>
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={ESTATE_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#1F7A54] text-white`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#properties" className={`${TAP} border border-[#1F7A54]/40 px-1 text-center text-[11px] leading-tight text-[#1F7A54]`}>
          View Properties
        </a>
      </div>
    </nav>
  );
}
