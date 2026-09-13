import { MessageCircle, Phone } from "lucide-react";
import { RESTAURANT_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]";

export default function RestaurantMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9c7a2]/15 bg-[#1a1612]/95 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a href={RESTAURANT_DEMO.phoneTel} className={`${TAP} border border-[#f4ead8]/20 text-[#f4ead8]`}>
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={RESTAURANT_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#c9a227] text-[#1a1612]`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#reserve" className={`${TAP} border border-[#e8c36a]/40 text-[#e8c36a]`}>
          Reserve
        </a>
      </div>
    </nav>
  );
}
