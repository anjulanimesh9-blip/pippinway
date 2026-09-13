"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  SALON_BOOKING,
  SALON_DEMO,
  SALON_SERVICES,
} from "./content";
import SalonTimePicker, {
  formatTimeValue,
  isTimeAllowed,
  type TimeValue,
} from "./SalonTimePicker";

const STEPS = [
  "Service",
  "Date",
  "Time",
  "Details",
  "Confirm",
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A07A]";
const PRIMARY =
  `inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#C9A07A] px-5 text-sm font-semibold text-[#0B0A09] transition hover:bg-[#D4B08C] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const GHOST =
  `inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#F3EBE0]/20 px-5 text-sm font-semibold text-[#F3EBE0] transition hover:border-[#C9A07A]/50 disabled:opacity-40 ${FOCUS}`;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSelectableDate(date: Date) {
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  if (day < today) return false;
  return !SALON_BOOKING.closedWeekdays.includes(day.getDay());
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function Calendar({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = first.getDay();
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    const items: Array<Date | null> = [];
    for (let i = 0; i < start; i += 1) items.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    return items;
  }, [cursor]);

  return (
    <div className="rounded-2xl border border-[#C9A07A]/15 bg-[#0B0A09] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[#F3EBE0] ${FOCUS}`}
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-serif text-lg text-[#F3EBE0]">{monthLabel(cursor)}</p>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[#F3EBE0] ${FOCUS}`}
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.12em] text-[#C9A07A]/80">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className="h-10" />;
          }
          const enabled = isSelectableDate(date);
          const selected = value ? sameDay(date, value) : false;
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!enabled}
              onClick={() => onChange(date)}
              className={`h-10 rounded-full text-sm font-semibold ${FOCUS} ${
                selected
                  ? "bg-[#C9A07A] text-[#0B0A09]"
                  : enabled
                    ? "text-[#F3EBE0] hover:bg-[#C9A07A]/15"
                    : "cursor-not-allowed text-[#E8DCC8]/25"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-[#E8DCC8]/50">
        Closed Mondays · Tuesday to Sunday
      </p>
    </div>
  );
}

export default function SalonBooking() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<TimeValue | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canContinue = [
    Boolean(service),
    Boolean(date),
    Boolean(time && isTimeAllowed(time)),
    name.trim().length > 1 && phone.trim().length > 6,
    true,
  ][step];

  function next() {
    setError(null);
    if (!canContinue) return;
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((value) => Math.max(value - 1, 0));
  }

  function confirm() {
    if (!service || !date || !time || !isTimeAllowed(time)) {
      setError("Please choose a valid service, date, and time.");
      return;
    }
    if (name.trim().length < 2 || phone.trim().length < 7) {
      setError("Please add your name and phone number.");
      return;
    }

    const message = [
      `Hello ${SALON_DEMO.name}, I'd like to book an appointment.`,
      "",
      `Service: ${service}`,
      `Date: ${formatDate(date)}`,
      `Selected Time: ${formatTimeValue(time)}`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
    ].join("\n");

    window.open(
      `https://wa.me/${SALON_DEMO.bookingWhatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl text-left">
      <ol className="mb-6 grid grid-cols-5 gap-1">
        {STEPS.map((label, index) => (
          <li key={label} className="min-w-0 text-center">
            <span
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                index === step
                  ? "bg-[#C9A07A] text-[#0B0A09]"
                  : index < step
                    ? "border border-[#C9A07A] text-[#C9A07A]"
                    : "border border-[#C9A07A]/20 text-[#E8DCC8]/40"
              }`}
            >
              {index + 1}
            </span>
            <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.08em] text-[#E8DCC8]/55">
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {SALON_SERVICES.map((item) => {
            const selected = service === item.name;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => setService(item.name)}
                  className={`flex min-h-14 w-full items-center rounded-xl border px-4 py-3 text-left text-sm font-semibold ${FOCUS} ${
                    selected
                      ? "border-[#C9A07A] bg-[#C9A07A]/15 text-[#C9A07A]"
                      : "border-[#C9A07A]/15 text-[#F3EBE0] hover:border-[#C9A07A]/40"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {step === 1 ? <Calendar value={date} onChange={setDate} /> : null}

      {step === 2 ? (
        <SalonTimePicker value={time} onChange={setTime} />
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm text-[#C9A07A]">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#C9A07A]/20 bg-[#0B0A09] px-4 text-sm text-[#F3EBE0] outline-none focus:border-[#C9A07A]"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#C9A07A]">Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#C9A07A]/20 bg-[#0B0A09] px-4 text-sm text-[#F3EBE0] outline-none focus:border-[#C9A07A]"
            />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <dl className="space-y-3 rounded-2xl border border-[#C9A07A]/15 bg-[#0B0A09] p-5 text-sm">
          <div>
            <dt className="text-[#C9A07A]">Service</dt>
            <dd className="mt-1 text-[#F3EBE0]">{service}</dd>
          </div>
          <div>
            <dt className="text-[#C9A07A]">Date</dt>
            <dd className="mt-1 text-[#F3EBE0]">{date ? formatDate(date) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[#C9A07A]">Selected Time</dt>
            <dd className="mt-1 text-[#F3EBE0]">
              {time ? formatTimeValue(time) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[#C9A07A]">Name</dt>
            <dd className="mt-1 text-[#F3EBE0]">{name.trim()}</dd>
          </div>
          <div>
            <dt className="text-[#C9A07A]">Phone</dt>
            <dd className="mt-1 text-[#F3EBE0]">{phone.trim()}</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={back} disabled={step === 0} className={GHOST}>
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} disabled={!canContinue} className={PRIMARY}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={confirm} className={PRIMARY}>
            Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
}
