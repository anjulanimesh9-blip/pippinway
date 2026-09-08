export const ZODIAC_SIGNS = [
  {
    id: "aries",
    name: "Aries",
    emoji: "♈",
    dates: "Mar 21 – Apr 19",
    element: "fire",
  },
  {
    id: "taurus",
    name: "Taurus",
    emoji: "♉",
    dates: "Apr 20 – May 20",
    element: "earth",
  },
  {
    id: "gemini",
    name: "Gemini",
    emoji: "♊",
    dates: "May 21 – Jun 20",
    element: "air",
  },
  {
    id: "cancer",
    name: "Cancer",
    emoji: "♋",
    dates: "Jun 21 – Jul 22",
    element: "water",
  },
  {
    id: "leo",
    name: "Leo",
    emoji: "♌",
    dates: "Jul 23 – Aug 22",
    element: "fire",
  },
  {
    id: "virgo",
    name: "Virgo",
    emoji: "♍",
    dates: "Aug 23 – Sep 22",
    element: "earth",
  },
  {
    id: "libra",
    name: "Libra",
    emoji: "♎",
    dates: "Sep 23 – Oct 22",
    element: "air",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    emoji: "♏",
    dates: "Oct 23 – Nov 21",
    element: "water",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    emoji: "♐",
    dates: "Nov 22 – Dec 21",
    element: "fire",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    emoji: "♑",
    dates: "Dec 22 – Jan 19",
    element: "earth",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    emoji: "♒",
    dates: "Jan 20 – Feb 18",
    element: "air",
  },
  {
    id: "pisces",
    name: "Pisces",
    emoji: "♓",
    dates: "Feb 19 – Mar 20",
    element: "water",
  },
] as const;

export type ZodiacId = (typeof ZODIAC_SIGNS)[number]["id"];
export type ZodiacElement = (typeof ZODIAC_SIGNS)[number]["element"];

export function isZodiacId(value: string): value is ZodiacId {
  return ZODIAC_SIGNS.some((sign) => sign.id === value);
}

export function zodiacById(id: string) {
  return ZODIAC_SIGNS.find((sign) => sign.id === id);
}

export const ZODIAC_DISCLAIMER =
  "Your Stars, Love Match and Lucky Today are for entertainment. They are not advice, forecasts you should rely on, or a substitute for your own judgment.";
