import { MessageCircle, Phone } from "lucide-react";
import { PRESCHOOL_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E86AB]";

export default function PreschoolMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D8E8F0] bg-[#FFF8F0]/96 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href={PRESCHOOL_DEMO.phoneTel}
          className={`${TAP} border border-[#2E86AB]/25 text-[#2E86AB]`}
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={PRESCHOOL_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#7CB68A] text-white`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#enroll" className={`${TAP} bg-[#2E86AB] text-white`}>
          Enroll
        </a>
      </div>
    </nav>
  );
}
