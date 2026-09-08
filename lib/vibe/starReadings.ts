import { luckyToday } from "./luckyToday";
import { ZODIAC_SIGNS, zodiacById, type ZodiacId } from "./zodiac";

const TIMES = ["Morning", "Afternoon", "Evening", "Night"] as const;

const NOTES: Record<string, string[]> = {
  fire: [
    "A small brave step beats a perfect plan you never start.",
    "Your warmth is useful today — spend it on one real person.",
    "Channel the extra energy into something you can finish.",
  ],
  earth: [
    "Steady work will look better than a dramatic gesture.",
    "Protect your time. One practical task is enough.",
    "Something simple and well done will lift the whole day.",
  ],
  air: [
    "A clear message will travel further than a long speech.",
    "Stay curious. One good question can change the mood.",
    "Share an idea, then leave room for someone else to add to it.",
  ],
  water: [
    "A kind check-in matters more than a perfect reply.",
    "Trust the feeling, then give it a calm next step.",
    "Quiet company can be the most generous thing you offer.",
  ],
};

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

export type StarReading = {
  signId: ZodiacId;
  name: string;
  emoji: string;
  dates: string;
  dateLabel: string;
  message: string;
  luckyNumber: number;
  luckyColor: string;
  bestTime: (typeof TIMES)[number];
};

export function defaultSignForDate(date = new Date()): ZodiacId {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const value = month * 100 + day;
  if (value >= 321 && value <= 419) return "aries";
  if (value >= 420 && value <= 520) return "taurus";
  if (value >= 521 && value <= 620) return "gemini";
  if (value >= 621 && value <= 722) return "cancer";
  if (value >= 723 && value <= 822) return "leo";
  if (value >= 823 && value <= 922) return "virgo";
  if (value >= 923 && value <= 1022) return "libra";
  if (value >= 1023 && value <= 1121) return "scorpio";
  if (value >= 1122 && value <= 1221) return "sagittarius";
  if (value >= 1222 || value <= 119) return "capricorn";
  if (value >= 120 && value <= 218) return "aquarius";
  return "pisces";
}

export function dailyStarReading(signId: string, date = new Date()): StarReading | null {
  const sign = zodiacById(signId);
  if (!sign) return null;
  const lucky = luckyToday(sign.id, date);
  const seed = hashSeed(`${dayKey(date)}:stars:${sign.id}`);
  const notes = NOTES[sign.element];
  return {
    signId: sign.id,
    name: sign.name,
    emoji: sign.emoji,
    dates: sign.dates,
    dateLabel: lucky.dateLabel,
    message: notes[seed % notes.length],
    luckyNumber: lucky.number,
    luckyColor: lucky.color,
    bestTime: TIMES[(seed >> 4) % TIMES.length],
  };
}

export function allDailyReadings(date = new Date()): StarReading[] {
  return ZODIAC_SIGNS.map((sign) => dailyStarReading(sign.id, date)).filter(
    (item): item is StarReading => Boolean(item)
  );
}
