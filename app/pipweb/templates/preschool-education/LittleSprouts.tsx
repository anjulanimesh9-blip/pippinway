import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
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
  PRESCHOOL_STATS,
  PRESCHOOL_TESTIMONIALS,
  PRESCHOOL_TRUST,
} from "./content";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2EB5D6]";
const SCRIPT = "font-[family-name:var(--font-preschool-script)]";
const TRUST_ICONS = [ShieldCheck, Heart, Users] as const;
const STAT_ICONS = [Users, GraduationCap, MapPin, Heart] as const;
const ACTIVITY_ICONS = [BookOpen, Palette, Sun, Music2, Sprout, Hash] as const;

const TONE = {
  sky: "bg-[#E7F7FD] text-[#2EB5D6]",
  pink: "bg-[#FDE8F0] text-[#E85A8C]",
  green: "bg-[#E5F7EC] text-[#22A45A]",
  gold: "bg-[#FFF3D0] text-[#D4A017]",
  teal: "bg-[#E5F6FB] text-[#2EB5D6]",
} as const;

const ARROW = {
  sky: "bg-[#3EC6E8] text-white",
  gold: "bg-[#F5C542] text-[#163A5F]",
  green: "bg-[#22A45A] text-white",
  teal: "bg-[#2EB5D6] text-white",
} as const;

function SunMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="36" cy="36" r="14" fill="#F5C542" />
      {Array.from({ length: 10 }).map((_, index) => {
        const angle = (index * Math.PI * 2) / 10;
        const x1 = 36 + Math.cos(angle) * 20;
        const y1 = 36 + Math.sin(angle) * 20;
        const x2 = 36 + Math.cos(angle) * 28;
        const y2 = 36 + Math.sin(angle) * 28;
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#F5C542"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export default function LittleSprouts() {
  return (
    <div className="overflow-x-hidden bg-[#FFF9F2] pb-[calc(7.25rem+env(safe-area-inset-bottom))] text-[#163A5F] md:pb-0">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-[#CDEFD8]/80 lg:h-56 lg:w-56"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-24 h-32 w-32 rounded-full bg-[#D7F3FB]/90 lg:right-24"
        />

        <div className="relative mx-auto max-w-6xl px-5 pt-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-8 lg:pt-8">
          <div className="relative z-10 min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#3EC6E8] sm:text-xs sm:tracking-[0.22em]">
              Play • Learn • Grow • Belong
            </p>
            <div className="relative mt-2">
              <h1 className="max-w-[16ch] pr-[4.5rem] text-[2.15rem] font-extrabold leading-[1.08] tracking-tight sm:pr-0 sm:text-5xl lg:text-[3.35rem]">
                Little Minds,
                <span className="block text-[#22A45A]">Bright Futures</span>
              </h1>
              <div className="pointer-events-none absolute right-0 top-0 w-[4.75rem] sm:-right-1 sm:-top-2 sm:w-28 lg:-right-8 lg:top-1 lg:w-32">
                <SunMark className="h-9 w-9 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                <p
                  className={`${SCRIPT} -mt-0.5 rotate-[-8deg] text-[0.95rem] leading-4 text-[#22A45A] sm:-mt-1 sm:text-[1.35rem] sm:leading-6 lg:text-[1.55rem]`}
                >
                  Happy Children
                  <br />
                  Brighter
                  <br />
                  Tomorrows
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#5A6B7B] sm:mt-5 sm:text-base">
              A warm preschool in Harare for children from 18 months to 6 years —
              safe classrooms, caring teachers, and learning that feels like play.
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
              <a
                href="#enroll"
                className={`inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-full bg-[#F5C542] px-6 text-[15px] font-bold text-[#163A5F] shadow-[0_10px_22px_rgba(245,197,66,0.35)] transition hover:bg-[#F7D36A] sm:min-h-12 sm:w-auto ${FOCUS}`}
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#programs"
                className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-[#2EB5D6] bg-white px-6 text-[15px] font-bold text-[#163A5F] transition hover:bg-[#EAF8FC] sm:min-h-12 sm:w-auto ${FOCUS}`}
              >
                View Programs
              </a>
            </div>

            <ul className="mt-8 hidden gap-6 lg:flex">
              {PRESCHOOL_TRUST.map((item, index) => {
                const Icon = TRUST_ICONS[index];
                return (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${TONE[item.tone]}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-bold leading-5 text-[#163A5F]">
                      {item.label}
                      <span className="block font-semibold text-[#5A6B7B]">
                        {item.hint}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative mt-8 min-w-0 lg:mt-0">
            <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.75rem] lg:rounded-bl-[7rem]">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[5/4] lg:min-h-[28rem]">
                <Image
                  src="/pipweb/templates/preschool-education/hero-girl.jpg"
                  alt="Smiling preschool girl in a bright classroom"
                  fill
                  priority
                  quality={75}
                  sizes="(max-width: 1023px) 100vw, 540px"
                  className="object-cover object-[center_20%]"
                />
              </div>
              <div
                aria-hidden
                className="absolute right-3 top-3 hidden w-28 rotate-[-4deg] rounded-2xl bg-[#2C3A3B]/90 px-3 py-3 text-center text-white shadow-lg sm:block lg:right-6 lg:top-6 lg:w-32"
              >
                <p className={`${SCRIPT} text-2xl leading-6`}>
                  Play
                  <br />
                  Learn
                  <br />
                  Grow
                </p>
                <p className="mt-1 text-lg text-[#F7A8C4]">♡</p>
              </div>
              <div className="absolute bottom-24 left-3 rounded-full bg-[#FDE8F0]/95 px-4 py-3 text-center shadow-md lg:bottom-16 lg:left-6">
                <p className="text-[11px] font-extrabold leading-4 text-[#E85A8C]">
                  Every
                  <br />
                  Child
                  <br />
                  Matters
                </p>
                <p className="text-sm text-[#E85A8C]">♡</p>
              </div>
            </div>

            <ul className="relative z-10 mx-1 -mt-10 grid grid-cols-3 gap-1 rounded-[1.6rem] bg-white px-2 py-3 shadow-[0_16px_36px_rgba(22,58,95,0.10)] lg:hidden">
              {PRESCHOOL_TRUST.map((item, index) => {
                const Icon = TRUST_ICONS[index];
                return (
                  <li key={item.label} className="flex min-w-0 flex-col items-center px-1 text-center">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${TONE[item.tone]}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="mt-1.5 text-[10px] font-bold leading-4 text-[#163A5F]">
                      {item.label}
                      <span className="mt-0.5 block font-semibold text-[#5A6B7B]">
                        {item.hint}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-5 max-w-6xl px-5 sm:px-6 lg:-mt-6 lg:pb-4">
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-0 lg:rounded-[2rem] lg:bg-white lg:px-4 lg:py-5 lg:shadow-[0_18px_40px_rgba(22,58,95,0.08)]">
            {PRESCHOOL_STATS.map((item, index) => {
              const Icon = STAT_ICONS[index];
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_10px_24px_rgba(22,58,95,0.06)] lg:justify-center lg:rounded-none lg:bg-transparent lg:p-2 lg:shadow-none lg:first:justify-start"
                >
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE[item.tone]}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-extrabold leading-5 text-[#163A5F] sm:text-lg">
                      {item.value}
                    </span>
                    <span className="block text-[11px] font-semibold leading-4 text-[#5A6B7B] sm:text-xs">
                      {item.label}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="programs" className="scroll-mt-36 lg:scroll-mt-48">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2EB5D6] sm:text-xs">
              Our programs
            </p>
            <h2 className="mt-2 text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
              The right room for every age
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5A6B7B] sm:text-base">
              Age-appropriate programs designed to help your child learn, explore
              and grow with confidence.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-4">
            {PRESCHOOL_PROGRAMS.map((program) => (
              <li key={program.name}>
                <a
                  href="#enroll"
                  className={`flex min-w-0 items-center gap-3 rounded-[1.6rem] bg-white p-3 shadow-[0_14px_30px_rgba(22,58,95,0.07)] transition hover:-translate-y-0.5 lg:flex-col lg:items-stretch lg:p-3 ${FOCUS}`}
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl lg:h-44 lg:w-full">
                    <Image
                      src={program.src}
                      alt={program.alt}
                      fill
                      quality={65}
                      sizes="(max-width: 1023px) 96px, 240px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-1 lg:px-2 lg:pb-3 lg:pt-3">
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                        program.accent === "gold"
                          ? "text-[#D4A017]"
                          : program.accent === "green"
                            ? "text-[#22A45A]"
                            : program.accent === "teal"
                              ? "text-[#2EB5D6]"
                              : "text-[#3EC6E8]"
                      }`}
                    >
                      {program.ages}
                    </p>
                    <h3 className="mt-1 text-[1.05rem] font-extrabold leading-snug lg:text-lg">
                      {program.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-5 text-[#5A6B7B]">
                      {program.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full lg:ml-auto lg:mr-2 lg:self-end ${ARROW[program.accent]}`}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-36 bg-white lg:scroll-mt-48"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2EB5D6] sm:text-xs">
              About us
            </p>
            <h2 className="mt-2 text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
              A gentle start for growing minds
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5A6B7B] sm:text-base">
              {PRESCHOOL_DEMO.about}
            </p>
            <p className="mt-4 text-sm italic text-[#7A8A97]">
              {PRESCHOOL_DEMO.aboutNote}
            </p>
          </div>
          <figure className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(22,58,95,0.10)]">
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

      <section className="bg-[#FFF9F2]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-center text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
            Why parents choose us
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {PRESCHOOL_REASONS.map((reason) => (
              <li
                key={reason.title}
                className="rounded-[1.6rem] bg-white p-5 shadow-[0_12px_28px_rgba(22,58,95,0.06)]"
              >
                <div aria-hidden className="mb-3 h-1.5 w-8 rounded-full bg-[#F5C542]" />
                <h3 className="text-base font-extrabold text-[#163A5F]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5A6B7B]">{reason.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="activities" className="scroll-mt-36 bg-white lg:scroll-mt-48">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2EB5D6] sm:text-xs">
              Learning activities
            </p>
            <h2 className="mt-2 text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
              Days filled with wonder
            </h2>
          </div>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {PRESCHOOL_ACTIVITIES.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[index];
              return (
                <li
                  key={activity.title}
                  className="flex gap-4 rounded-[1.6rem] bg-[#FFF9F2] p-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7F7FD] text-[#2EB5D6]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold">{activity.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#5A6B7B]">
                      {activity.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-36 lg:scroll-mt-48">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-center text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
            Gallery
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {PRESCHOOL_GALLERY.map((item) => (
              <li key={item.title} className="group min-w-0">
                <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] shadow-[0_12px_28px_rgba(22,58,95,0.08)]">
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
                    className="absolute inset-0 bg-gradient-to-t from-[#163A5F]/70 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-bold text-white">
                    {item.title}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-center text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
            What parents say
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {PRESCHOOL_TESTIMONIALS.map((item) => (
              <li
                key={item.name}
                className="flex flex-col rounded-[1.6rem] bg-[#FFF9F2] p-5 sm:p-6"
              >
                <div className="flex gap-0.5 text-[#F5C542]" aria-label="5 star review">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-7">“{item.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F7EC] text-sm font-bold text-[#22A45A]">
                    {item.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">{item.name}</p>
                    <p className="text-xs text-[#7A8A97]">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="enroll" className="scroll-mt-36 lg:scroll-mt-48">
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <div className="rounded-[2rem] bg-[#2EB5D6] px-5 py-10 shadow-[0_18px_40px_rgba(46,181,214,0.28)] sm:px-10 sm:py-14">
            <h2 className="text-[1.7rem] font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              A place is waiting for your child
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
              Enroll for the coming term or book a gentle campus visit. This demo
              shows how families can start from your website.
            </p>
            <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <a
                href="#contact"
                className={`inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#F5C542] px-6 text-sm font-bold text-[#163A5F] hover:bg-[#F7D36A] sm:w-auto ${FOCUS}`}
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={PRESCHOOL_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 px-6 text-sm font-bold text-white hover:bg-white/10 sm:w-auto ${FOCUS}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-36 bg-white lg:scroll-mt-48">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <h2 className="text-[1.7rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
              Visit Little Sprouts
            </h2>
            <dl className="mt-6 space-y-4 text-sm leading-6 text-[#5A6B7B] sm:mt-8">
              <div>
                <dt className="font-extrabold text-[#2EB5D6]">Location</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.address}</dd>
              </div>
              <div>
                <dt className="font-extrabold text-[#2EB5D6]">Hours</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.hours}</dd>
              </div>
              <div>
                <dt className="font-extrabold text-[#2EB5D6]">Telephone</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.phone}</dd>
              </div>
              <div>
                <dt className="font-extrabold text-[#2EB5D6]">Email</dt>
                <dd className="mt-1">{PRESCHOOL_DEMO.email}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a
                href={PRESCHOOL_DEMO.phoneTel}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3EC6E8] px-5 text-sm font-bold text-white ${FOCUS}`}
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={PRESCHOOL_DEMO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#22A45A] px-5 text-sm font-bold text-white ${FOCUS}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href={PRESCHOOL_DEMO.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#2EB5D6] px-5 text-sm font-bold text-[#163A5F] ${FOCUS}`}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Directions
              </a>
            </div>
          </div>
          <div className="rounded-[1.6rem] bg-[#FFF9F2] p-5 shadow-[0_12px_28px_rgba(22,58,95,0.06)] sm:p-6">
            <h3 className="text-xl font-extrabold">A note for this demo</h3>
            <p className="mt-3 text-sm leading-7 text-[#5A6B7B]">
              In a live PipWeb site, this space can hold an enrollment form,
              WhatsApp enquiry, Google Maps, and your real school details. No
              applications are processed on this demo page.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#2EB5D6] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
