import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { PRESCHOOL_DEMO } from "./content";

const TAP =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl px-2 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(22,58,95,0.12)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2EB5D6]";

export default function PreschoolMobileCta() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-[#FFF9F2]/96 px-3 pt-2 backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-2 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
        <a href={PRESCHOOL_DEMO.phoneTel} className={`${TAP} bg-[#3EC6E8]`}>
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={PRESCHOOL_DEMO.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TAP} bg-[#22A45A]`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a href="#enroll" className={`${TAP} bg-[#F5C542] text-[#163A5F]`}>
          <CalendarDays className="h-4 w-4" aria-hidden />
          Enroll
        </a>
      </div>
    </nav>
  );
}
