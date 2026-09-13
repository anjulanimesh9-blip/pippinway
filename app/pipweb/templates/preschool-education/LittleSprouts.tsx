import Image from "next/image";
import {
  BookOpen,
  Hash,
  Heart,
  MapPin,
  MessageCircle,
  Music2,
  Palette,
  Phone,
  ShieldCheck,
  Sprout,
  Star,
  Sun,
  Users,
} from "lucide-react";
import PreschoolMobileCta from "./PreschoolMobileCta";
import {
  PRESCHOOL_ACTIVITIES,
  PRESCHOOL_DEMO,
  PRESCHOOL_GALLERY,
  PRESCHOOL_PROGRAMS,
  PRESCHOOL_REASONS,
  PRESCHOOL_TESTIMONIALS,
  PRESCHOOL_TRUST,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E86AB]";
const TAP =
  `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition sm:w-auto ${FOCUS}`;
const PRIMARY = `${TAP} bg-[#2E86AB] text-white hover:bg-[#267394]`;
const SECONDARY = `${TAP} border border-[#2E86AB]/25 bg-white/70 text-[#2E86AB] hover:border-[#2E86AB]/50`;
const TRUST_ICONS = [ShieldCheck, Users, Heart] as const;
const ACTIVITY_ICONS = [BookOpen, Palette, Sun, Music2, Sprout, Hash] as const;

const PROGRAM_ACCENT = {
  sky: "bg-[#EAF6FB] text-[#2E86AB]",
  yellow: "bg-[#FDF3D3] text-[#9A6B12]",
  green: "bg-[#E7F4EA] text-[#3F7A4D]",
  cream: "bg-[#FFF1D6] text-[#8A6A1E]",
} as const;

export default function LittleSprouts() {
  return (
    <div className="overflow-x-hidden bg-[#FFF8F0] pb-[calc(6.75rem+env(safe-area-inset-bottom))] text-[#2F3A42] md:pb-0">
      <section className="relative isolate min-h-[calc(100svh-5.75rem)] overflow-hidden md:min-h-[calc(100svh-7.25rem)]">
        <Image
          src="/pipweb/templates/preschool-education/hero.jpg"
          alt="Teacher and children drawing together in a bright preschool classroom"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0]/88 via-[#FFF8F0]/78 to-[#FFF8F0]/92 lg:bg-gradient-to-r lg:from-[#FFF8F0] lg:via-[#FFF8F0]/82 lg:to-[#FFF8F0]/18"
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-6xl flex-col justify-start px-5 py-6 sm:px-6 sm:py-16 md:min-h-[calc(100svh-7.25rem)] lg:justify-center lg:py-24">
          <span className="mb-5 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#2E86AB]/20 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#2E86AB]">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Harare • {PRESCHOOL_DEMO.ages}
          </span>

          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E86AB] sm:text-xs lg:block">
            {PRESCHOOL_DEMO.location}
          </p>
          <h1 className="max-w-full text-[2.05rem] font-bold leading-[1.05] tracking-tight text-[#2F3A42] sm:mt-3 sm:text-5xl lg:text-6xl">
            <span className="block">Little Sprouts</span>
            <span className="block text-[#2E86AB]">Academy</span>
          </h1>
          <p className="mt-3 max-w-xl text-[1.15rem] leading-snug text-[#3F7A4D] sm:mt-4 sm:text-2xl">
            {PRESCHOOL_DEMO.tagline}
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#5C6770] sm:mt-5 sm:text-base sm:leading-7">
            A warm preschool in Harare for children from 18 months to 6 years —
            safe classrooms, caring teachers, and learning that still feels like
            play.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row">
            <a
              href="#programs"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#2E86AB] px-5 text-[15px] font-semibold text-white transition hover:bg-[#267394] sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              View Programs
            </a>
            <a
              href="#enroll"
              className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#2E86AB]/30 bg-white/80 px-5 text-[15px] font-semibold text-[#2E86AB] transition hover:border-[#2E86AB]/55 sm:min-h-12 sm:w-auto sm:text-sm ${FOCUS}`}
            >
              Enroll Now
            </a>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:flex sm:flex-wrap sm:gap-6">
            {PRESCHOOL_TRUST.map((item, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <li
                  key={item.label}
                  className="flex min-w-0 flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/85 text-[#3F7A4D] sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="mt-1.5 min-w-0 sm:mt-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2F3A42] sm:text-[11px] sm:tracking-[0.12em]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.08em] text-[#5C6770] sm:text-[10px]">
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
        className="scroll-mt-40 bg-white sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E86AB] sm:text-xs">
              About us
            </p>
            <h2 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              A gentle start for growing minds
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5C6770] sm:mt-5 sm:text-base">
              {PRESCHOOL_DEMO.about}
            </p>
            <p className="mt-4 text-sm italic text-[#7A838C]">
              {PRESCHOOL_DEMO.aboutNote}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-2xl bg-[#EAF6FB] p-3 text-center sm:p-5">
                <dt className="text-xl font-bold text-[#2E86AB] sm:text-3xl">12</dt>
                <dd className="mt-1 text-[10px] leading-4 text-[#5C6770] sm:text-sm sm:leading-5">
                  Children per class
                </dd>
              </div>
              <div className="rounded-2xl bg-[#E7F4EA] p-3 text-center sm:p-5">
                <dt className="text-xl font-bold text-[#3F7A4D] sm:text-3xl">8</dt>
                <dd className="mt-1 text-[10px] leading-4 text-[#5C6770] sm:text-sm sm:leading-5">
                  Years in Harare
                </dd>
              </div>
              <div className="rounded-2xl bg-[#FDF3D3] p-3 text-center sm:p-5">
                <dt className="text-xl font-bold text-[#9A6B12] sm:text-3xl">18m</dt>
                <dd className="mt-1 text-[10px] leading-4 text-[#5C6770] sm:text-sm sm:leading-5">
                  Starting age
                </dd>
              </div>
            </dl>
          </div>
          <figure className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-3xl">
            <Image
              src="/pipweb/templates/preschool-education/classroom.jpg"
              alt="Bright preschool classroom with wooden tables and alphabet wall"
              fill
              quality={65}
              sizes="(max-width: 1023px) 100vw, 540px"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section id="programs" className="scroll-mt-40 sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E86AB] sm:text-xs">
              Programs / age groups
            </p>
            <h2 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              The right room for every age
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
            {PRESCHOOL_PROGRAMS.map((program) => (
              <li
                key={program.name}
                className="rounded-2xl border border-[#E6DDD0] bg-white p-5 sm:p-6"
              >
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${PROGRAM_ACCENT[program.accent]}`}
                >
                  {program.ages}
                </span>
                <h3 className="mt-4 text-[1.2rem] font-bold leading-snug sm:text-xl">
                  {program.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6770]">
                  {program.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Why parents choose us
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {PRESCHOOL_REASONS.map((reason) => (
              <li
                key={reason.title}
                className="rounded-2xl border border-[#E6DDD0] bg-[#FFF8F0] p-5"
              >
                <div aria-hidden className="mb-3 h-1 w-8 rounded-full bg-[#F4C44A]" />
                <h3 className="text-base font-semibold text-[#2E86AB]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6770]">
                  {reason.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="activities"
        className="scroll-mt-40 sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E86AB] sm:text-xs">
              Learning activities
            </p>
            <h2 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              Days filled with wonder
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {PRESCHOOL_ACTIVITIES.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[index];
              return (
                <li
                  key={activity.title}
                  className="flex gap-4 rounded-2xl border border-[#E6DDD0] bg-white p-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF6FB] text-[#2E86AB]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{activity.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#5C6770]">
                      {activity.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="gallery"
        className="scroll-mt-40 bg-white sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {PRESCHOOL_GALLERY.map((item) => (
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
                    className="absolute inset-0 bg-gradient-to-t from-[#2F3A42]/70 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">
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
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
            What parents say
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {PRESCHOOL_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-2xl border border-[#E6DDD0] bg-white p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#F4C44A]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7 text-[#2F3A42]">
                  “{item.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F4EA] text-sm font-semibold text-[#3F7A4D]">
                    {item.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[#7A838C]">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="enroll"
        className="scroll-mt-40 bg-[#2E86AB] sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">
            A place is waiting for your child
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
            Enroll for the coming term or book a gentle campus visit. This demo
            shows how families can start from your website.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a href="#contact" className={`${TAP} bg-[#F4C44A] text-[#2F3A42] hover:bg-[#F7D36A]`}>
              Enroll Now
            </a>
            <a
              href={PRESCHOOL_DEMO.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TAP} border border-white/30 text-white hover:bg-white/10`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-40 bg-white sm:scroll-mt-28"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight sm:text-4xl">
              Visit Little Sprouts
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-[#5C6770] sm:mt-8">
              <div>
                <dt className="font-semibold text-[#2E86AB]">Location</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2E86AB]">Hours</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2E86AB]">Telephone</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2E86AB]">Email</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={PRESCHOOL_DEMO.phoneTel} className={PRIMARY}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={PRESCHOOL_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${TAP} bg-[#7CB68A] text-white hover:bg-[#6AA678]`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={PRESCHOOL_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E6DDD0] bg-[#FFF8F0] p-5 sm:p-6">
            <h3 className="text-xl font-bold">A note for this demo</h3>
            <p className="mt-3 text-sm leading-7 text-[#5C6770]">
              In a live PipWeb site, this space can hold an enrollment form,
              WhatsApp enquiry, Google Maps, and your real school details. No
              applications are processed on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E6DDD0] bg-[#FFF8F0]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[#7A838C] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {PRESCHOOL_DEMO.name} · {PRESCHOOL_DEMO.location}
          </p>
          <p>Website demo by PipWeb Studio</p>
        </div>
      </footer>

      <PreschoolMobileCta />
    </div>
  );
}
