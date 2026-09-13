import {
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Search,
  Smartphone,
  Wrench,
} from "lucide-react";

const SERVICES = [
  {
    icon: Monitor,
    title: "Website Design",
    description: "Modern, professional websites designed around your business.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive Design",
    description:
      "Your website will look great on phones, tablets, and desktops.",
  },
  {
    icon: Globe,
    title: "Domain & Hosting",
    description: "We help set up your domain and reliable website hosting.",
  },
  {
    icon: Search,
    title: "Basic SEO",
    description:
      "Basic search engine setup to help customers find your business online.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    description:
      "Make it easy for visitors to contact your business directly on WhatsApp.",
  },
  {
    icon: MapPin,
    title: "Google Maps",
    description: "Show customers exactly where your business is located.",
  },
  {
    icon: Mail,
    title: "Contact Forms",
    description: "Simple enquiry forms so customers can reach you quickly.",
  },
  {
    icon: Wrench,
    title: "Website Maintenance",
    description: "Ongoing support for small updates and basic website care.",
  },
] as const;

export default function PipWebServices() {
  return (
    <section
      aria-labelledby="pipweb-services-heading"
      className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pipweb-services-heading"
          className="text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-4xl"
        >
          Everything Your Business Needs Online
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
          Simple, professional digital solutions to help your business look
          better, connect with customers, and grow online.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {SERVICES.map((service) => (
          <li
            key={service.title}
            className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#132038] sm:p-6"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B82F6]/15 text-[#7DD3FC]">
              <service.icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-white sm:text-[17px]">
              {service.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {service.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
