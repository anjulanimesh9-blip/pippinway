import Image from "next/image";
import {
  BadgeCheck,
  Car,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  Repeat,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import DealerMobileCta from "./DealerMobileCta";
import {
  DEALER_DEMO,
  DEALER_GALLERY,
  DEALER_REASONS,
  DEALER_TESTIMONIALS,
  DEALER_TRUST,
  DEALER_TYPES,
  DEALER_VEHICLES,
  dealerVehicleWhatsapp,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";
const TAP =
  `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition sm:w-auto ${FOCUS}`;
const PRIMARY = `${TAP} bg-[#3B82F6] text-white hover:bg-[#2563EB]`;
const SECONDARY = `${TAP} border border-white/15 text-[#F5F7FA] hover:border-[#60A5FA]/50`;
const TRUST_ICONS = [ShieldCheck, Wallet, Repeat] as const;
const REASON_ICONS = [BadgeCheck, Gauge, Wallet, Car] as const;

export default function PrimeDrive() {
  return (
    <div className="overflow-x-hidden bg-[#0E1014] pb-[calc(6.75rem+env(safe-area-inset-bottom))] text-[#F5F7FA] md:pb-0">
      <section className="relative isolate min-h-[calc(100svh-5.75rem)] overflow-hidden md:min-h-[calc(100svh-7.25rem)]">
        <Image
          src="/pipweb/templates/car-dealer/hero.jpg"
          alt="PrimeDrive Motors showroom with premium vehicles under cool lighting"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#0E1014]/70 via-[#0E1014]/82 to-[#0E1014] lg:bg-gradient-to-r lg:from-[#0E1014] lg:via-[#0E1014]/80 lg:to-[#0E1014]/25"
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-6xl flex-col justify-start px-5 py-6 sm:px-6 sm:py-16 md:min-h-[calc(100svh-7.25rem)] lg:justify-center lg:py-24">
          <span className="mb-5 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#3B82F6]/30 bg-[#0E1014]/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#60A5FA]">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Harare • Inspected stock
          </span>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#60A5FA] lg:block">
            {DEALER_DEMO.location}
          </p>
          <h1 className="max-w-full text-[2.05rem] font-bold leading-[1.05] tracking-tight sm:mt-3 sm:text-5xl lg:text-6xl">
            <span className="block">PrimeDrive</span>
            <span className="block text-[#60A5FA]">Motors</span>
          </h1>
          <p className="mt-3 max-w-xl text-[1.15rem] leading-snug text-white/90 sm:mt-4 sm:text-2xl">
            {DEALER_DEMO.tagline}
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-6 text-white/65 sm:mt-5 sm:text-base sm:leading-7">
            SUVs, bakkies, sedans, and city cars — listed with mileage, condition,
            and a price you can actually start from.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row">
            <a
              href="#vehicles"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] px-5 text-[15px] font-semibold text-white hover:bg-[#2563EB] sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              View Cars
            </a>
            <a
              href="#finance"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-white/20 px-5 text-[15px] font-semibold text-white hover:border-[#60A5FA]/50 sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              Finance / Trade-In
            </a>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:flex sm:flex-wrap sm:gap-6">
            {DEALER_TRUST.map((item, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <li
                  key={item.label}
                  className="flex min-w-0 flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/40 text-[#60A5FA] sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="mt-1.5 min-w-0 sm:mt-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#60A5FA] sm:text-[11px]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.08em] text-white/50 sm:text-[10px]">
                      {item.hint}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="vehicles" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#60A5FA] sm:text-xs">
              Featured vehicles
            </p>
            <h2 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              Ready for the road
            </h2>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {DEALER_VEHICLES.map((vehicle) => (
              <li
                key={vehicle.id}
                id={vehicle.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#161A22]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={vehicle.src}
                    alt={vehicle.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#0E1014]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#60A5FA]">
                    {vehicle.type}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[1.15rem] font-bold leading-snug">
                        {vehicle.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/55">{vehicle.year}</p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-[#60A5FA]">
                      {vehicle.price}
                    </p>
                  </div>
                  <ul className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/65">
                    <li className="rounded-lg bg-white/5 px-2 py-2 text-center">
                      <Gauge className="mx-auto mb-1 h-3.5 w-3.5 text-[#60A5FA]" aria-hidden />
                      {vehicle.mileage}
                    </li>
                    <li className="rounded-lg bg-white/5 px-2 py-2 text-center">
                      <Car className="mx-auto mb-1 h-3.5 w-3.5 text-[#60A5FA]" aria-hidden />
                      {vehicle.transmission}
                    </li>
                    <li className="rounded-lg bg-white/5 px-2 py-2 text-center">
                      <Fuel className="mx-auto mb-1 h-3.5 w-3.5 text-[#60A5FA]" aria-hidden />
                      {vehicle.fuel}
                    </li>
                  </ul>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <a href="#contact" className={`${PRIMARY} sm:w-full`}>
                      View Details
                    </a>
                    <a
                      href={dealerVehicleWhatsapp(vehicle.name, vehicle.year)}
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

      <section
        id="types"
        className="scroll-mt-40 border-y border-white/10 bg-[#161A22] sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Browse by type
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {DEALER_TYPES.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-white/10 bg-[#0E1014] p-4 transition hover:border-[#3B82F6]/50 ${FOCUS}`}
                >
                  <span className="text-base font-bold">{item.name}</span>
                  <span className="mt-1 text-sm text-white/50">{item.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="why" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Why buy from us
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEALER_REASONS.map((reason, index) => {
              const Icon = REASON_ICONS[index];
              return (
                <li
                  key={reason.title}
                  className="rounded-2xl border border-white/10 bg-[#161A22] p-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/15 text-[#60A5FA]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{reason.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="finance"
        className="scroll-mt-40 bg-[#161A22] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="rounded-2xl border border-[#3B82F6]/25 bg-[#0E1014] p-5 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
              Finance
            </p>
            <h2 className="mt-3 text-[1.5rem] font-bold leading-tight sm:text-3xl">
              Drive now. Structure the deal.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Tell us the vehicle and we will walk you through a simple finance
              enquiry — this demo shows the path, not a live application.
            </p>
            <a href={DEALER_DEMO.whatsappHref} target="_blank" rel="noopener noreferrer" className={`${PRIMARY} mt-6`}>
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp Finance
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-5 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
              Trade-in
            </p>
            <h2 className="mt-3 text-[1.5rem] font-bold leading-tight sm:text-3xl">
              Bring your current car.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Fair offers against any vehicle on the floor. Send photos and we
              start the conversation the same day.
            </p>
            <a href="#contact" className={`${SECONDARY} mt-6`}>
              Start a Trade-In
            </a>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEALER_GALLERY.map((item) => (
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
                    className="absolute inset-0 bg-gradient-to-t from-[#0E1014]/80 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium">
                    {item.title}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#161A22]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Customer stories
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEALER_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-white/10 bg-[#0E1014] p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#60A5FA]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7">“{item.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]/15 text-sm font-semibold text-[#60A5FA]">
                    {item.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-white/45">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-40 sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              Visit the showroom
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-white/65 sm:mt-8">
              <div>
                <dt className="text-[#60A5FA]">Location</dt>
                <dd className="mt-1">{DEALER_DEMO.address}</dd>
              </div>
              <div>
                <dt className="text-[#60A5FA]">Hours</dt>
                <dd className="mt-1">{DEALER_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="text-[#60A5FA]">Telephone</dt>
                <dd className="mt-1">{DEALER_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="text-[#60A5FA]">Email</dt>
                <dd className="mt-1">{DEALER_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={DEALER_DEMO.phoneTel} className={PRIMARY}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={DEALER_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={PRIMARY}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={DEALER_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#161A22] p-5 sm:p-6">
            <h3 className="text-xl font-bold">A note for this demo</h3>
            <p className="mt-3 text-sm leading-7 text-white/60">
              In a live PipWeb site, this space can hold stock search, finance
              forms, WhatsApp enquiry, Google Maps, and your real yard details.
              No vehicles are for sale on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {DEALER_DEMO.name} · {DEALER_DEMO.location}
          </p>
          <p>Website demo by PipWeb Studio</p>
        </div>
      </footer>

      <DealerMobileCta />
    </div>
  );
}
