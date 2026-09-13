import Image from "next/image";
import { MapPin, MessageCircle, Phone, Star } from "lucide-react";
import RestaurantMobileCta from "./RestaurantMobileCta";
import RestaurantNav from "./RestaurantNav";
import {
  RESTAURANT_DEMO,
  RESTAURANT_GALLERY,
  RESTAURANT_MENU,
  RESTAURANT_REASONS,
  RESTAURANT_TESTIMONIALS,
  RESTAURANT_TRUST,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]";
const TAP =
  `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition sm:w-auto ${FOCUS}`;
const PRIMARY = `${TAP} bg-[#c9a227] text-[#1a1612] hover:bg-[#e8c36a]`;
const SECONDARY = `${TAP} border border-[#f4ead8]/20 text-[#f4ead8] hover:border-[#e8c36a]/50`;

export default function SavannaKitchen() {
  return (
    <div id="top" className="bg-[#12100e] pb-[5.75rem] text-[#efe4d0] md:pb-0">
      <RestaurantNav />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,162,39,0.16),_transparent_55%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c36a] sm:text-xs">
              {RESTAURANT_DEMO.location}
            </p>
            <h1 className="mt-3 font-serif text-[2.35rem] leading-[1.12] tracking-tight text-[#f4ead8] sm:mt-4 sm:text-6xl lg:text-7xl">
              {RESTAURANT_DEMO.name}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-[#efe4d0] sm:mt-4 sm:text-2xl">
              {RESTAURANT_DEMO.tagline}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#d9c7a2]/80 sm:mt-5 sm:text-base">
              Contemporary dining in Harare — wood-fired flavour, seasonal plates,
              and a room made for unhurried evenings.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <a href="#menu" className={PRIMARY}>
                View the Menu
              </a>
              <a href="#reserve" className={SECONDARY}>
                Reserve a Table
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d9c7a2]/80 sm:mt-8 sm:text-xs">
              {RESTAURANT_TRUST.map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span aria-hidden className="text-[#e8c36a]">
                      •
                    </span>
                  ) : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-2xl ring-1 ring-[#e8c36a]/20 sm:min-h-[340px] sm:rounded-3xl lg:min-h-[520px]">
            <Image
              src="/pipweb/templates/restaurant-cafe/hero.jpg"
              alt="Savanna Kitchen dining room with set tables and warm gold screens"
              fill
              priority
              quality={75}
              sizes="(max-width: 1023px) 100vw, 560px"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#12100e]/75 via-[#c9a227]/12 to-[#12100e]/20"
            />
            <span className="absolute bottom-4 left-4 rounded-full border border-[#e8c36a]/35 bg-[#12100e]/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#e8c36a] backdrop-blur-sm sm:bottom-5 sm:left-5 sm:px-4 sm:text-xs">
              Harare • Fresh Daily
            </span>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-40 border-t border-[#d9c7a2]/10 bg-[#1a1612] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c36a] sm:text-xs">
              Our story
            </p>
            <h2 className="mt-3 font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
              A Harare table with room to linger
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#d9c7a2]/85 sm:mt-5 sm:text-base">
              {RESTAURANT_DEMO.about}
            </p>
            <p className="mt-4 text-sm italic text-[#d9c7a2]/60">
              {RESTAURANT_DEMO.aboutNote}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#5a3a1c] to-[#1c1814] p-5 sm:p-6">
              <p className="font-serif text-3xl text-[#e8c36a] sm:text-4xl">11</p>
              <p className="mt-2 text-sm text-[#efe4d0]/80">Years of hosting</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#3a4030] to-[#151814] p-5 sm:mt-8 sm:p-6">
              <p className="font-serif text-3xl text-[#e8c36a] sm:text-4xl">18</p>
              <p className="mt-2 text-sm text-[#efe4d0]/80">Seasonal plates</p>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c36a] sm:text-xs">
              Featured menu
            </p>
            <h2 className="mt-3 font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
              Plates worth returning for
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {RESTAURANT_MENU.map((item) => (
              <li
                key={item.name}
                className="rounded-2xl border border-[#d9c7a2]/12 bg-[#1a1612] p-5 transition hover:border-[#e8c36a]/30 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8c36a]/80">
                      {item.highlight ?? item.category}
                    </p>
                    <h3 className="mt-1.5 font-serif text-[1.2rem] leading-snug text-[#f4ead8] sm:text-xl">
                      {item.name}
                    </h3>
                  </div>
                  <p className="shrink-0 font-serif text-lg text-[#e8c36a]">
                    {item.price}
                  </p>
                </div>
                <div aria-hidden className="mt-4 h-px bg-[#d9c7a2]/12" />
                <p className="mt-4 text-sm leading-6 text-[#d9c7a2]/75">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#d9c7a2]/10 bg-[#1a1612]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
            Why guests choose us
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {RESTAURANT_REASONS.map((reason) => (
              <li
                key={reason.title}
                className="rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-5 transition hover:border-[#e8c36a]/25"
              >
                <div aria-hidden className="mb-3 h-0.5 w-8 bg-[#c9a227]" />
                <h3 className="text-base font-semibold text-[#e8c36a]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#d9c7a2]/75">
                  {reason.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {RESTAURANT_GALLERY.map((item) => (
              <li key={item.title} className="group">
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
                    className="absolute inset-0 bg-gradient-to-t from-[#12100e]/80 via-[#12100e]/15 to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium text-[#f4ead8]">
                    {item.title}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#1a1612]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
            What our guests say
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {RESTAURANT_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#e8c36a]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7 text-[#efe4d0]">
                  “{item.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a227]/15 font-serif text-sm text-[#e8c36a]">
                    {item.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#e8c36a]">{item.name}</p>
                    <p className="text-xs text-[#d9c7a2]/60">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="reserve"
        className="scroll-mt-40 border-y border-[#d9c7a2]/10 sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <h2 className="font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
            Reserve a table
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#d9c7a2]/80 sm:text-base">
            Join us for lunch or a long evening. This demo reservation path
            shows how guests can book from your website.
          </p>
          <a href="#contact" className={`${PRIMARY} mt-8`}>
            Request a Reservation
          </a>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-40 bg-[#1a1612] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="font-serif text-[1.85rem] leading-tight text-[#f4ead8] sm:text-4xl">
              Visit Savanna Kitchen
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-[#d9c7a2]/85 sm:mt-8">
              <div>
                <dt className="text-[#e8c36a]">Location</dt>
                <dd className="mt-1">{RESTAURANT_DEMO.address}</dd>
              </div>
              <div>
                <dt className="text-[#e8c36a]">Hours</dt>
                <dd className="mt-1">{RESTAURANT_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="text-[#e8c36a]">Telephone</dt>
                <dd className="mt-1">{RESTAURANT_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="text-[#e8c36a]">Email</dt>
                <dd className="mt-1">{RESTAURANT_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={RESTAURANT_DEMO.phoneTel} className={PRIMARY}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={RESTAURANT_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={PRIMARY}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={RESTAURANT_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-5 sm:p-6">
            <h3 className="font-serif text-2xl text-[#f4ead8]">
              A note for this demo
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#d9c7a2]/75">
              In a live PipWeb site, this space can hold a reservation form,
              WhatsApp booking, Google Maps, and your real contact details. No
              bookings are processed on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d9c7a2]/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[#d9c7a2]/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{RESTAURANT_DEMO.name} · {RESTAURANT_DEMO.location}</p>
          <p>Website demo by PipWeb Studio</p>
        </div>
      </footer>

      <RestaurantMobileCta />
    </div>
  );
}
