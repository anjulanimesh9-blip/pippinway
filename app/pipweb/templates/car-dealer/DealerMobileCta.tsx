import { Car, MessageCircle, Phone } from "lucide-react";
import { DEALER_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";

export default function DealerMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0E1014]/95 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href={DEALER_DEMO.phoneTel}
          className={`${TAP} border border-white/15 text-[#F5F7FA]`}
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={DEALER_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#3B82F6] text-white`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#vehicles" className={`${TAP} border border-[#3B82F6]/50 text-[#60A5FA]`}>
          <Car className="h-4 w-4" aria-hidden />
          View Cars
        </a>
      </div>
    </nav>
  );
}
