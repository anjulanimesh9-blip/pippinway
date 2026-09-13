import Image from "next/image";
import {
  Bath,
  BedDouble,
  KeyRound,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import EstateMobileCta from "./EstateMobileCta";
import EstateViewing from "./EstateViewing";
import {
  ESTATE_DEMO,
  ESTATE_GALLERY,
  ESTATE_PROPERTIES,
  ESTATE_REASONS,
  ESTATE_SERVICES,
  ESTATE_TESTIMONIALS,
  ESTATE_TYPES,
  estatePropertyWhatsapp,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A54]";
const TAP =
  `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition sm:w-auto ${FOCUS}`;
const PRIMARY = `${TAP} bg-[#1F7A54] text-white hover:bg-[#196348]`;
const SECONDARY = `${TAP} border border-[#E8DFD2] bg-white text-[#2C2A26] hover:border-[#1F7A54]/40`;

export default function UrbanNest() {
  return (
    <div className="overflow-x-hidden bg-[#FAF8F4] pb-[calc(6.75rem+env(safe-area-inset-bottom))] text-[#2C2A26] md:pb-0">
      <section className="relative isolate min-h-[calc(100svh-5.75rem)] overflow-hidden md:min-h-[calc(100svh-7.25rem)]">
        <Image
          src="/pipweb/templates/real-estate/hero.jpg"
          alt="Luxury family home with landscaped garden at golden hour"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[center_45%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#2C2A26]/35 via-[#2C2A26]/55 to-[#FAF8F4] lg:bg-gradient-to-r lg:from-[#2C2A26]/80 lg:via-[#2C2A26]/45 lg:to-transparent"
        />
        <div className="relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-6xl flex-col justify-end px-5 pb-10 pt-8 sm:px-6 md:min-h-[calc(100svh-7.25rem)] lg:justify-center lg:pb-24 lg:pt-16">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-[#2C2A26]/40 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#F3EDE4]">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Harare · Homes & land
          </span>
          <h1 className="max-w-xl text-[2.05rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            UrbanNest
            <span className="mt-1 block text-[#D4C4A8]">Properties</span>
          </h1>
          <p className="mt-4 max-w-lg text-[1.15rem] leading-snug text-white/90 sm:text-2xl">
            {ESTATE_DEMO.tagline}
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-6 text-white/75 sm:text-base">
            Houses, apartments, townhouses, land, and commercial space — listed
            with the details that matter before you book a viewing.
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row">
            <a
              href="#properties"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#1F7A54] px-5 text-[15px] font-semibold text-white hover:bg-[#196348] sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              View Properties
            </a>
            <a
              href="#viewing"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-[15px] font-semibold text-white sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              Book a Viewing
            </a>
          </div>
        </div>
      </section>

      <section id="properties" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1F7A54]">
            Featured properties
          </p>
          <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Spaces worth walking through
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {ESTATE_PROPERTIES.map((property) => (
              <li
                key={property.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-[#E8DFD2] bg-white shadow-[0_12px_28px_rgba(44,42,38,0.05)]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={property.src}
                    alt={property.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F7A54]">
                    {property.type}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[1.1rem] font-semibold leading-snug">
                        {property.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#6B6560]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {property.location}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-semibold text-[#1F7A54]">
                      {property.price}
                    </p>
                  </div>
                  <ul className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-[#6B6560]">
                    <li className="rounded-lg bg-[#FAF8F4] px-2 py-2 text-center">
                      <BedDouble className="mx-auto mb-1 h-3.5 w-3.5 text-[#1F7A54]" aria-hidden />
                      {property.beds} bed
                    </li>
                    <li className="rounded-lg bg-[#FAF8F4] px-2 py-2 text-center">
                      <Bath className="mx-auto mb-1 h-3.5 w-3.5 text-[#1F7A54]" aria-hidden />
                      {property.baths} bath
                    </li>
                    <li className="rounded-lg bg-[#FAF8F4] px-2 py-2 text-center">
                      <Maximize className="mx-auto mb-1 h-3.5 w-3.5 text-[#1F7A54]" aria-hidden />
                      {property.size}
                    </li>
                  </ul>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <a href="#viewing" className={`${PRIMARY} sm:w-full`}>
                      View Details
                    </a>
                    <a
                      href={estatePropertyWhatsapp(property.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${SECONDARY} sm:w-full`}
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      WhatsApp Enquiry
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="types" className="scroll-mt-40 bg-white sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Browse by property type
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ESTATE_TYPES.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex min-h-[4.75rem] flex-col justify-center rounded-2xl border border-[#E8DFD2] bg-[#FAF8F4] p-4 transition hover:border-[#1F7A54]/40 ${FOCUS}`}
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="mt-1 text-sm text-[#6B6560]">{item.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="scroll-mt-40">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Why choose us
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESTATE_REASONS.map((reason) => (
              <li key={reason.title} className="rounded-2xl border border-[#E8DFD2] bg-white p-5">
                <div aria-hidden className="mb-3 h-1 w-8 rounded-full bg-[#1F7A54]" />
                <h3 className="text-base font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B6560]">{reason.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="scroll-mt-40 bg-white sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Property services
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {ESTATE_SERVICES.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-2xl border border-[#E8DFD2] bg-[#FAF8F4] p-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1F7A54]/10 text-[#1F7A54]">
                  <KeyRound className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#6B6560]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="scroll-mt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <figure className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-[2rem] sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src="/pipweb/templates/real-estate/agent.jpg"
              alt="UrbanNest principal agent"
              fill
              quality={65}
              sizes="(max-width: 1023px) 100vw, 480px"
              className="object-cover"
            />
          </figure>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1F7A54]">
              Your agent
            </p>
            <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight sm:text-4xl">
              {ESTATE_DEMO.agentName}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#1F7A54]">
              {ESTATE_DEMO.agentRole}
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[#6B6560] sm:text-base">
              {ESTATE_DEMO.about} Rumbi leads viewings in person and stays with
              every file from first enquiry to handover.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-[#6B6560]">
              <ShieldCheck className="h-5 w-5 text-[#1F7A54]" aria-hidden />
              Registered agency · Harare
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-40 bg-white sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ESTATE_GALLERY.map((item) => (
              <li key={item.title} className="group min-w-0">
                <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#2C2A26]/70 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium text-white">
                    {item.title}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Client stories
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ESTATE_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-[#E8DFD2] bg-white p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#1F7A54]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7">“{item.quote}”</p>
                <div className="mt-5">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-[#6B6560]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="viewing" className="scroll-mt-40 bg-white sm:scroll-mt-28">
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
            Book a viewing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6B6560] sm:text-base">
            Choose a property, pick a date and time, and send the request on
            WhatsApp. No bookings are stored on this demo.
          </p>
          <EstateViewing />
        </div>
      </section>

      <section id="contact" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <h2 className="text-[1.7rem] font-semibold leading-tight sm:text-4xl">
              Visit UrbanNest
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-[#6B6560] sm:mt-8">
              <div>
                <dt className="font-semibold text-[#1F7A54]">Location</dt>
                <dd className="mt-1">{ESTATE_DEMO.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1F7A54]">Hours</dt>
                <dd className="mt-1">{ESTATE_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1F7A54]">Telephone</dt>
                <dd className="mt-1">{ESTATE_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1F7A54]">Email</dt>
                <dd className="mt-1">{ESTATE_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={ESTATE_DEMO.phoneTel} className={PRIMARY}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={ESTATE_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={PRIMARY}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={ESTATE_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E8DFD2] bg-white p-5 sm:p-6">
            <h3 className="text-xl font-semibold">A note for this demo</h3>
            <p className="mt-3 text-sm leading-7 text-[#6B6560]">
              In a live PipWeb site, this space can hold listing search, a viewing
              calendar, WhatsApp enquiry, Google Maps, and your real office
              details. No properties are for sale on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8DFD2] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[#6B6560] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {ESTATE_DEMO.name} · {ESTATE_DEMO.location}
          </p>
          <p>Website demo by PipWeb Studio</p>
        </div>
      </footer>

      <EstateMobileCta />
    </div>
  );
}
