"use client";

import { useEffect, useId, useState } from "react";
import { ESTATE_BOOKING } from "./content";

export type TimeValue = {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
};

const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = [0, 15, 30, 45] as const;
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A54]";

export function toHour24(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function timeToMinutes(value: TimeValue): number {
  return toHour24(value.hour12, value.period) * 60 + value.minute;
}

export function isTimeAllowed(value: TimeValue): boolean {
  const total = timeToMinutes(value);
  return (
    total >= ESTATE_BOOKING.minMinutes &&
    total <= ESTATE_BOOKING.maxMinutes &&
    value.minute % ESTATE_BOOKING.interval === 0
  );
}

export function isHourAllowed(hour12: number, period: "AM" | "PM"): boolean {
  return MINUTES.some((minute) => isTimeAllowed({ hour12, minute, period }));
}

export function formatTimeValue(value: TimeValue): string {
  return `${String(value.hour12).padStart(2, "0")}:${String(value.minute).padStart(2, "0")} ${value.period}`;
}

function ClockPanel({
  draft,
  face,
  onHour,
  onMinute,
  onPeriod,
  onFace,
}: {
  draft: TimeValue;
  face: "hour" | "minute";
  onHour: (hour12: number) => void;
  onMinute: (minute: number) => void;
  onPeriod: (period: "AM" | "PM") => void;
  onFace: (face: "hour" | "minute") => void;
}) {
  const values = face === "hour" ? CLOCK_HOURS : MINUTES;

  return (
    <div className="flex flex-col items-center">
      <p className="text-3xl font-semibold tracking-tight text-[#1F7A54]">
        {formatTimeValue(draft)}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#6B6560]">
        {face === "hour" ? "Choose hour" : "Choose minutes"}
      </p>
      <div className="relative mt-5 h-56 w-56 shrink-0">
        <div className="absolute inset-0 rounded-full border border-[#E8DFD2] bg-[#FAF8F4]" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1F7A54]" />
        {values.map((value, index) => {
          const count = values.length;
          const angle = (index / count) * 360 - 90;
          const allowed =
            face === "hour"
              ? isHourAllowed(value, draft.period)
              : isTimeAllowed({ ...draft, minute: value });
          const selected =
            face === "hour" ? draft.hour12 === value : draft.minute === value;
          const label =
            face === "hour" ? String(value) : String(value).padStart(2, "0");
          return (
            <button
              key={`${face}-${value}`}
              type="button"
              disabled={!allowed}
              onClick={() => (face === "hour" ? onHour(value) : onMinute(value))}
              className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold ${FOCUS} ${
                selected
                  ? "bg-[#1F7A54] text-white"
                  : allowed
                    ? "text-[#2C2A26] hover:bg-[#1F7A54]/10"
                    : "cursor-not-allowed text-[#C4BDB4]"
              }`}
              style={{
                left: `${50 + Math.cos((angle * Math.PI) / 180) * 38}%`,
                top: `${50 + Math.sin((angle * Math.PI) / 180) * 38}%`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid w-full max-w-[14rem] grid-cols-2 gap-2">
        {(["hour", "minute"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFace(item)}
            className={`min-h-10 rounded-full text-xs font-semibold uppercase tracking-[0.14em] ${FOCUS} ${
              face === item
                ? "bg-[#1F7A54] text-white"
                : "border border-[#E8DFD2] text-[#2C2A26]"
            }`}
          >
            {item === "hour" ? "Hour" : "Minutes"}
          </button>
        ))}
      </div>
      <div className="mt-3 grid w-full max-w-[14rem] grid-cols-2 gap-2">
        {(["AM", "PM"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPeriod(item)}
            className={`min-h-11 rounded-full text-sm font-semibold ${FOCUS} ${
              draft.period === item
                ? "bg-[#1F7A54] text-white"
                : "border border-[#E8DFD2] text-[#2C2A26]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#6B6560]">
        Viewings from 09:00 AM to 05:00 PM · 15-minute times
      </p>
    </div>
  );
}

export default function EstateTimePicker({
  value,
  onChange,
}: {
  value: TimeValue | null;
  onChange: (value: TimeValue) => void;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [face, setFace] = useState<"hour" | "minute">("hour");
  const [draft, setDraft] = useState<TimeValue>(
    value ?? { hour12: 9, minute: 0, period: "AM" },
  );

  useEffect(() => {
    if (value) setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function commit(next: TimeValue) {
    if (isTimeAllowed(next)) onChange(next);
  }

  function setHour(hour12: number) {
    const next = { ...draft, hour12 };
    const fallback = MINUTES.find((minute) => isTimeAllowed({ ...next, minute }));
    const resolved = { ...next, minute: fallback ?? 0 };
    setDraft(resolved);
    if (isTimeAllowed(resolved)) onChange(resolved);
    setFace("minute");
  }

  function setMinute(minute: number) {
    const next = { ...draft, minute };
    setDraft(next);
    commit(next);
  }

  function setPeriod(period: "AM" | "PM") {
    const hour = isHourAllowed(draft.hour12, period)
      ? draft.hour12
      : (CLOCK_HOURS.find((item) => isHourAllowed(item, period)) ?? 9);
    const resolvedBase = { ...draft, period, hour12: hour };
    const minute =
      MINUTES.find((item) => isTimeAllowed({ ...resolvedBase, minute: item })) ?? 0;
    const resolved = { ...resolvedBase, minute };
    setDraft(resolved);
    if (isTimeAllowed(resolved)) onChange(resolved);
  }

  const panel = (
    <ClockPanel
      draft={draft}
      face={face}
      onHour={setHour}
      onMinute={setMinute}
      onPeriod={setPeriod}
      onFace={setFace}
    />
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm md:hidden ${FOCUS} ${
          value
            ? "border-[#1F7A54] bg-[#1F7A54]/10 text-[#1F7A54]"
            : "border-[#E8DFD2] text-[#6B6560]"
        }`}
      >
        <span>{value ? formatTimeValue(value) : "Choose a time"}</span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#1F7A54]">
          Clock
        </span>
      </button>
      <div className="hidden rounded-2xl border border-[#E8DFD2] bg-white p-5 md:block">
        {panel}
      </div>
      {open ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close time picker"
            className="absolute inset-0 bg-[#2C2A26]/50"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E8DFD2]" />
            <h3 id={titleId} className="text-center text-xl font-semibold text-[#2C2A26]">
              Select time
            </h3>
            <div className="mt-3">{panel}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={!value || !isTimeAllowed(value)}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1F7A54] text-sm font-semibold text-white disabled:opacity-40"
            >
              Use this time
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
