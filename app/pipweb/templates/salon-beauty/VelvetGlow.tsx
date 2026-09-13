import Image from "next/image";
import {
  CalendarDays,
  Eye,
  MapPin,
  MessageCircle,
  Paintbrush,
  Palette,
  Phone,
  Scissors,
  Sparkles,
  Star,
  Flower2,
} from "lucide-react";
import SalonBooking from "./SalonBooking";
import SalonMobileCta from "./SalonMobileCta";
import {
  SALON_DEMO,
  SALON_GALLERY,
  SALON_REASONS,
  SALON_SERVICES,
  SALON_TESTIMONIALS,
  SALON_TREATMENTS,
  SALON_TRUST,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A]";
const TAP =
  `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition sm:w-auto ${FOCUS}`;
const PRIMARY = `${TAP} bg-[#C9A07A] text-[#0B0A09] hover:bg-[#D4B08C]`;
const SECONDARY = `${TAP} border border-[#F3EBE0]/20 text-[#F3EBE0] hover:border-[#C9A07A]/50`;
const TRUST_ICONS = [Sparkles, Flower2, CalendarDays] as const;
const SERVICE_ICONS = [Scissors, Sparkles, Paintbrush, Palette, Flower2, Eye] as const;

export default function VelvetGlow() {
  return (
    <div className="overflow-x-hidden bg-[#0B0A09] pb-[calc(6.75rem+env(safe-area-inset-bottom))] text-[#E8DCC8] md:pb-0">
      <section className="relative isolate min-h-[calc(100svh-5.75rem)] overflow-hidden md:min-h-[calc(100svh-7.25rem)]">
        <Image
          src="/pipweb/templates/salon-beauty/hero.jpg"
          alt="Velvet Glow Beauty Studio salon with rose gold lighting and a client in the chair"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#0B0A09]/55 via-[#0B0A09]/78 to-[#0B0A09]/94 lg:bg-gradient-to-r lg:from-[#0B0A09] lg:via-[#0B0A09]/82 lg:to-[#0B0A09]/20"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B0A09] to-transparent"
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-6xl flex-col justify-start px-5 py-6 sm:px-6 sm:py-16 md:min-h-[calc(100svh-7.25rem)] lg:justify-center lg:py-24">
          <span className="mb-5 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#C9A07A]/30 bg-[#0B0A09]/65 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#C9A07A]">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Harare • Beauty Studio
          </span>

          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A07A] sm:text-xs lg:block">
            {SALON_DEMO.location}
          </p>
          <h1 className="max-w-full font-serif text-[2.15rem] leading-[1.02] tracking-tight text-[#F3EBE0] sm:mt-3 sm:text-5xl lg:text-6xl">
            <span className="block">Velvet Glow</span>
            <span className="block text-[#C9A07A]">Beauty Studio</span>
          </h1>
          <p className="mt-3 max-w-xl text-[1.15rem] leading-snug text-[#E8DCC8] sm:mt-4 sm:text-2xl">
            {SALON_DEMO.tagline}
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#E8DCC8]/75 sm:mt-5 sm:text-base sm:leading-7">
            Hair, braids, nails, makeup, and skin — a private salon in Harare
            for clients who prefer quiet luxury over noise.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row">
            <a
              href="#services"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#C9A07A] px-5 text-[15px] font-semibold text-[#0B0A09] transition hover:bg-[#D4B08C] sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              View Services
            </a>
            <a
              href="#book"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#F3EBE0]/25 px-5 text-[15px] font-semibold text-[#F3EBE0] transition hover:border-[#C9A07A]/50 sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              Book Now
            </a>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:flex sm:flex-wrap sm:gap-6">
            {SALON_TRUST.map((item, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <li
                  key={item.label}
                  className="flex min-w-0 flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C9A07A]/35 text-[#C9A07A] sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="mt-1.5 min-w-0 sm:mt-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C9A07A] sm:text-[11px] sm:tracking-[0.12em]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.08em] text-[#E8DCC8]/65 sm:text-[10px]">
                      {item.hint}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-40 border-t border-[#C9A07A]/10 bg-[#141210] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A07A] sm:text-xs">
              About
            </p>
            <h2 className="mt-3 font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
              Beauty, without the rush
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#E8DCC8]/80 sm:mt-5 sm:text-base">
              {SALON_DEMO.about}
            </p>
            <p className="mt-4 text-sm italic text-[#E8DCC8]/50">
              {SALON_DEMO.aboutNote}
            </p>
          </div>
          <figure className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-3xl">
            <Image
              src="/pipweb/templates/salon-beauty/interior.jpg"
              alt="Black marble salon vanities with rose gold lighting and orchids"
              fill
              quality={65}
              sizes="(max-width: 1023px) 100vw, 540px"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section id="services" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A07A] sm:text-xs">
              Services
            </p>
            <h2 className="mt-3 font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
              Everything for a considered finish
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SALON_SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index];
              return (
                <li
                  key={service.name}
                  className="rounded-2xl border border-[#C9A07A]/12 bg-[#141210] p-5 sm:p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C9A07A]/25 text-[#C9A07A]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-serif text-[1.2rem] leading-snug text-[#F3EBE0] sm:text-xl">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#E8DCC8]/70">
                    {service.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="treatments"
        className="scroll-mt-40 bg-[#141210] sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A07A] sm:text-xs">
              Featured treatments
            </p>
            <h2 className="mt-3 font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
              Booked again and again
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SALON_TREATMENTS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-[#C9A07A]/20 bg-[#0B0A09] p-5 sm:p-6"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9A07A]">
                  {item.detail}
                </p>
                <h3 className="mt-3 font-serif text-[1.35rem] leading-tight text-[#F3EBE0] sm:text-2xl">
                  {item.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#E8DCC8]/70">
                  {item.description}
                </p>
                <p className="mt-5 font-serif text-xl text-[#C9A07A]">{item.price}</p>
                <a href="#book" className={`${PRIMARY} mt-5`}>
                  Book This
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#C9A07A]/10">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
            Why clients choose us
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {SALON_REASONS.map((reason) => (
              <li
                key={reason.title}
                className="rounded-2xl border border-[#C9A07A]/12 bg-[#141210] p-5"
              >
                <div aria-hidden className="mb-3 h-px w-8 bg-[#C9A07A]" />
                <h3 className="text-base font-semibold text-[#C9A07A]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#E8DCC8]/70">
                  {reason.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SALON_GALLERY.map((item) => (
              <li key={item.title} className="group min-w-0">
                <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#0B0A09]/80 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium text-[#F3EBE0]">
                    {item.title}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#141210]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
            Client stories
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SALON_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-[#C9A07A]/12 bg-[#0B0A09] p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#C9A07A]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7 text-[#F3EBE0]">
                  “{item.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A07A]/15 font-serif text-sm text-[#C9A07A]">
                    {item.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#C9A07A]">{item.name}</p>
                    <p className="text-xs text-[#E8DCC8]/55">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="book"
        className="scroll-mt-40 border-y border-[#C9A07A]/10 sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
            Reserve your chair
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#E8DCC8]/75 sm:text-base">
            Book a quiet hour with us. Choose a service, date, and time — then
            send the request on WhatsApp.
          </p>
          <SalonBooking />
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-40 bg-[#141210] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <h2 className="font-serif text-[1.7rem] leading-tight text-[#F3EBE0] sm:text-4xl">
              Visit Velvet Glow
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-[#E8DCC8]/80 sm:mt-8">
              <div>
                <dt className="text-[#C9A07A]">Location</dt>
                <dd className="mt-1">{SALON_DEMO.address}</dd>
              </div>
              <div>
                <dt className="text-[#C9A07A]">Hours</dt>
                <dd className="mt-1">{SALON_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="text-[#C9A07A]">Telephone</dt>
                <dd className="mt-1">{SALON_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="text-[#C9A07A]">Email</dt>
                <dd className="mt-1">{SALON_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={SALON_DEMO.phoneTel} className={PRIMARY}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={SALON_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={PRIMARY}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={SALON_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-[#C9A07A]/12 bg-[#0B0A09] p-5 sm:p-6">
            <h3 className="font-serif text-xl text-[#F3EBE0] sm:text-2xl">
              A note for this demo
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#E8DCC8]/70">
              In a live PipWeb site, this space can hold a booking form,
              WhatsApp scheduling, Google Maps, and your real studio details. No
              appointments are processed on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#C9A07A]/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[#E8DCC8]/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {SALON_DEMO.name} · {SALON_DEMO.location}
          </p>
          <p>Website demo by PipWeb Studio</p>
        </div>
      </footer>

      <SalonMobileCta />
    </div>
  );
}
