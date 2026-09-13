import Image from "next/image";
import RestaurantNav from "./RestaurantNav";
import {
  RESTAURANT_DEMO,
  RESTAURANT_GALLERY,
  RESTAURANT_MENU,
  RESTAURANT_REASONS,
  RESTAURANT_TESTIMONIALS,
} from "./content";

export default function SavannaKitchen() {
  return (
    <div id="top" className="bg-[#12100e] text-[#efe4d0]">
      <RestaurantNav />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,162,39,0.16),_transparent_55%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8c36a]">
            {RESTAURANT_DEMO.location}
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-tight text-[#f4ead8] sm:text-6xl lg:text-7xl">
            {RESTAURANT_DEMO.name}
          </h1>
          <p className="mt-4 max-w-xl text-xl text-[#efe4d0] sm:text-2xl">
            {RESTAURANT_DEMO.tagline}
          </p>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d9c7a2]/80 sm:text-base">
            Contemporary dining in Harare — wood-fired flavour, seasonal plates,
            and a room made for unhurried evenings.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#menu"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#c9a227] px-6 text-sm font-semibold text-[#1a1612] transition hover:bg-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
            >
              View the Menu
            </a>
            <a
              href="#reserve"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#f4ead8]/20 px-6 text-sm font-semibold text-[#f4ead8] transition hover:border-[#e8c36a]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
            >
              Reserve a Table
            </a>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-36 border-t border-[#d9c7a2]/10 bg-[#1a1612] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c36a]">
              Our story
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#f4ead8] sm:text-4xl">
              A Harare table with room to linger
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[#d9c7a2]/85 sm:text-base">
              {RESTAURANT_DEMO.about}
            </p>
            <p className="mt-4 text-sm italic text-[#d9c7a2]/60">
              {RESTAURANT_DEMO.aboutNote}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#5a3a1c] to-[#1c1814] p-6">
              <p className="font-serif text-4xl text-[#e8c36a]">11</p>
              <p className="mt-2 text-sm text-[#efe4d0]/80">Years of hosting</p>
            </div>
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#3a4030] to-[#151814] p-6">
              <p className="font-serif text-4xl text-[#e8c36a]">18</p>
              <p className="mt-2 text-sm text-[#efe4d0]/80">Seasonal plates</p>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="scroll-mt-36 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c36a]">
              Featured menu
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#f4ead8] sm:text-4xl">
              Plates worth returning for
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESTAURANT_MENU.map((item) => (
              <li
                key={item.name}
                className="rounded-2xl border border-[#d9c7a2]/12 bg-[#1a1612] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl text-[#f4ead8]">{item.name}</h3>
                  <p className="shrink-0 text-sm font-semibold text-[#e8c36a]">
                    {item.price}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#d9c7a2]/75">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#d9c7a2]/10 bg-[#1a1612]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl text-[#f4ead8] sm:text-4xl">
            Why guests choose us
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESTAURANT_REASONS.map((reason) => (
              <li
                key={reason.title}
                className="rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-5"
              >
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

      <section id="gallery" className="scroll-mt-36 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl text-[#f4ead8] sm:text-4xl">Gallery</h2>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESTAURANT_GALLERY.map((item) => (
              <li key={item.title} className="group">
                <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                    className="object-cover transition duration-500 ease-out group-hover:scale-105"
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl text-[#f4ead8] sm:text-4xl">
            What our guests say
          </h2>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3">
            {RESTAURANT_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-6"
              >
                <p className="text-[15px] leading-7 text-[#efe4d0]">
                  “{item.quote}”
                </p>
                <p className="mt-4 text-sm font-semibold text-[#e8c36a]">
                  {item.name}
                </p>
                <p className="text-xs text-[#d9c7a2]/60">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="reserve"
        className="scroll-mt-36 border-y border-[#d9c7a2]/10 sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl text-[#f4ead8] sm:text-4xl">
            Reserve a table
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#d9c7a2]/80 sm:text-base">
            Join us for lunch or a long evening. This demo reservation path
            shows how guests can book from your website.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#c9a227] px-7 text-sm font-semibold text-[#1a1612] transition hover:bg-[#e8c36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c36a]"
          >
            Request a Reservation
          </a>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-36 bg-[#1a1612] sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="font-serif text-3xl text-[#f4ead8] sm:text-4xl">
              Visit Savanna Kitchen
            </h2>
            <dl className="mt-8 space-y-4 text-sm leading-6 text-[#d9c7a2]/85">
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
          </div>
          <div className="rounded-2xl border border-[#d9c7a2]/12 bg-[#12100e] p-6">
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
    </div>
  );
}
