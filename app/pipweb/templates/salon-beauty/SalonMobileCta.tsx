import { MessageCircle, Phone } from "lucide-react";
import { SALON_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A]";

export default function SalonMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#C9A07A]/15 bg-[#0B0A09]/95 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href={SALON_DEMO.phoneTel}
          className={`${TAP} border border-[#F3EBE0]/20 text-[#F3EBE0]`}
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={SALON_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#C9A07A] text-[#0B0A09]`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#book" className={`${TAP} border border-[#C9A07A]/50 text-[#C9A07A]`}>
          Book
        </a>
      </div>
    </nav>
  );
}
