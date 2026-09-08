import { ZODIAC_SIGNS, zodiacById, type ZodiacElement, type ZodiacId } from "./zodiac";

const COMPATIBLE: Record<ZodiacElement, ZodiacElement> = {
  fire: "air",
  air: "fire",
  earth: "water",
  water: "earth",
};

function scoreFor(a: ZodiacId, b: ZodiacId): number {
  if (a === b) return 92;
  const left = zodiacById(a);
  const right = zodiacById(b);
  if (!left || !right) return 50;
  if (left.element === right.element) return 86;
  if (COMPATIBLE[left.element] === right.element) return 78;
  return 61;
}

const BLURBS: Record<string, string> = {
  high: "These signs often click. There is room for warmth, humour and a little spark — enjoy it, and still talk things through.",
  good: "A promising mix. Differences can keep things interesting if both people stay kind and curious.",
  mixed: "Not an automatic match, and that can still be fun. Patience and honesty matter more than any star chart.",
};

export type LoveMatchResult = {
  a: (typeof ZODIAC_SIGNS)[number];
  b: (typeof ZODIAC_SIGNS)[number];
  score: number;
  label: string;
  blurb: string;
};

export function loveMatch(a: string, b: string): LoveMatchResult | null {
  const left = zodiacById(a);
  const right = zodiacById(b);
  if (!left || !right) return null;
  const score = scoreFor(left.id, right.id);
  const label = score >= 84 ? "Strong spark" : score >= 72 ? "Good mix" : "Interesting contrast";
  const blurb = score >= 84 ? BLURBS.high : score >= 72 ? BLURBS.good : BLURBS.mixed;
  return { a: left, b: right, score, label, blurb };
}
