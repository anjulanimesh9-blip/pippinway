import { ZODIAC_SIGNS, type ZodiacId } from "./zodiac";

const COLORS = [
  "Gold",
  "Sky blue",
  "Forest green",
  "Soft lilac",
  "Warm coral",
  "Ivory",
  "Deep teal",
  "Sunset orange",
];

const MESSAGES = [
  "Take the small kind step you have been postponing.",
  "A calm conversation can open a better day.",
  "Share something useful, not just something loud.",
  "Your people notice when you show up steadily.",
  "Leave room for a pleasant surprise.",
  "Do one practical thing for your future self.",
  "A smile in the queue still counts.",
  "Protect your energy, then spend it well.",
];

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export type LuckyTodayResult = {
  dateLabel: string;
  number: number;
  color: string;
  message: string;
  signName?: string;
};

export function luckyToday(signId?: string, date = new Date()): LuckyTodayResult {
  const sign = ZODIAC_SIGNS.find((item) => item.id === signId);
  const seed = hashSeed(`${dayKey(date)}:${sign?.id ?? "all"}`);
  return {
    dateLabel: date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    number: (seed % 63) + 1,
    color: COLORS[seed % COLORS.length],
    message: MESSAGES[(seed >> 3) % MESSAGES.length],
    signName: sign?.name,
  };
}

export function luckySignOptions(): Array<{ id: ZodiacId | ""; name: string }> {
  return [{ id: "", name: "Any sign" }, ...ZODIAC_SIGNS.map((sign) => ({ id: sign.id, name: sign.name }))];
}
