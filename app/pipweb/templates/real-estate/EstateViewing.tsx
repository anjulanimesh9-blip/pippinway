"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ESTATE_BOOKING,
  ESTATE_DEMO,
  ESTATE_PROPERTIES,
} from "./content";
import EstateTimePicker, {
  formatTimeValue,
  isTimeAllowed,
  type TimeValue,
} from "./EstateTimePicker";

const STEPS = ["Property", "Date", "Time", "Details", "Confirm"] as const;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A54]";
const PRIMARY =
  `inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1F7A54] px-5 text-sm font-semibold text-white transition hover:bg-[#196348] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const GHOST =
  `inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#E8DFD2] px-5 text-sm font-semibold text-[#2C2A26] disabled:opacity-40 ${FOCUS}`;

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
  return !ESTATE_BOOKING.closedWeekdays.includes(day.getDay());
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
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const items: Array<Date | null> = [];
    for (let i = 0; i < start; i += 1) items.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    return items;
  }, [cursor]);

  return (
    <div className="rounded-2xl border border-[#E8DFD2] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${FOCUS}`}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-lg font-semibold text-[#2C2A26]">{monthLabel(cursor)}</p>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${FOCUS}`}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.12em] text-[#1F7A54]">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="h-10" />;
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
                  ? "bg-[#1F7A54] text-white"
                  : enabled
                    ? "text-[#2C2A26] hover:bg-[#1F7A54]/10"
                    : "cursor-not-allowed text-[#C4BDB4]"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-[#6B6560]">
        Closed Sundays · Monday to Saturday
      </p>
    </div>
  );
}

export default function EstateViewing() {
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<TimeValue | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canContinue = [
    Boolean(property),
    Boolean(date),
    Boolean(time && isTimeAllowed(time)),
    name.trim().length > 1 && phone.trim().length > 6,
    true,
  ][step];

  function confirm() {
    if (!property || !date || !time || !isTimeAllowed(time)) {
      setError("Please choose a property, date, and time.");
      return;
    }
    if (name.trim().length < 2 || phone.trim().length < 7) {
      setError("Please add your name and phone number.");
      return;
    }
    const message = [
      `Hello ${ESTATE_DEMO.name}, I'd like to book a viewing.`,
      "",
      `Property: ${property}`,
      `Date: ${formatDate(date)}`,
      `Selected Time: ${formatTimeValue(time)}`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
    ].join("\n");
    window.open(
      `https://wa.me/${ESTATE_DEMO.bookingWhatsapp}?text=${encodeURIComponent(message)}`,
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
                  ? "bg-[#1F7A54] text-white"
                  : index < step
                    ? "border border-[#1F7A54] text-[#1F7A54]"
                    : "border border-[#E8DFD2] text-[#C4BDB4]"
              }`}
            >
              {index + 1}
            </span>
            <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.08em] text-[#6B6560]">
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <ul className="grid gap-2">
          {ESTATE_PROPERTIES.map((item) => {
            const selected = property === item.title;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setProperty(item.title)}
                  className={`flex min-h-14 w-full flex-col items-start rounded-xl border px-4 py-3 text-left ${FOCUS} ${
                    selected
                      ? "border-[#1F7A54] bg-[#1F7A54]/10 text-[#1F7A54]"
                      : "border-[#E8DFD2] text-[#2C2A26] hover:border-[#1F7A54]/40"
                  }`}
                >
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 text-xs text-[#6B6560]">{item.location}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {step === 1 ? <Calendar value={date} onChange={setDate} /> : null}
      {step === 2 ? <EstateTimePicker value={time} onChange={setTime} /> : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm text-[#1F7A54]">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#E8DFD2] bg-white px-4 text-sm text-[#2C2A26] outline-none focus:border-[#1F7A54]"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#1F7A54]">Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#E8DFD2] bg-white px-4 text-sm text-[#2C2A26] outline-none focus:border-[#1F7A54]"
            />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <dl className="space-y-3 rounded-2xl border border-[#E8DFD2] bg-white p-5 text-sm">
          <div>
            <dt className="text-[#1F7A54]">Property</dt>
            <dd className="mt-1 text-[#2C2A26]">{property}</dd>
          </div>
          <div>
            <dt className="text-[#1F7A54]">Date</dt>
            <dd className="mt-1 text-[#2C2A26]">{date ? formatDate(date) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[#1F7A54]">Selected Time</dt>
            <dd className="mt-1 text-[#2C2A26]">{time ? formatTimeValue(time) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[#1F7A54]">Name</dt>
            <dd className="mt-1 text-[#2C2A26]">{name.trim()}</dd>
          </div>
          <div>
            <dt className="text-[#1F7A54]">Phone</dt>
            <dd className="mt-1 text-[#2C2A26]">{phone.trim()}</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep((value) => Math.max(value - 1, 0));
          }}
          disabled={step === 0}
          className={GHOST}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              if (!canContinue) return;
              setError(null);
              setStep((value) => Math.min(value + 1, STEPS.length - 1));
            }}
            disabled={!canContinue}
            className={PRIMARY}
          >
            Continue
          </button>
        ) : (
          <button type="button" onClick={confirm} className={PRIMARY}>
            Confirm Viewing
          </button>
        )}
      </div>
    </div>
  );
}
