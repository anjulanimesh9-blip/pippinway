import type { VibeCategoryId, VibePostCategory } from "./types";

export type VibeCategory = {
  id: VibeCategoryId;
  label: string;
  emoji: string;
  href: string;
  description: string;
};

export const VIBE_CATEGORY_LIST: VibeCategory[] = [
  {
    id: "all",
    label: "All",
    emoji: "✨",
    href: "/vibe",
    description: "Everything in Pippinway Vibe",
  },
  {
    id: "your-stars",
    label: "Your Stars",
    emoji: "⭐",
    href: "/vibe/stars",
    description: "Zodiac, signs and starry notes",
  },
  {
    id: "love-relationships",
    label: "Love & Relationships",
    emoji: "❤️",
    href: "/vibe?category=love-relationships",
    description: "Feelings, dating and connection",
  },
  {
    id: "motivation",
    label: "Motivation",
    emoji: "💪",
    href: "/vibe?category=motivation",
    description: "Encouragement for brighter days",
  },
  {
    id: "fun-memes",
    label: "Fun & Memes",
    emoji: "😂",
    href: "/vibe?category=fun-memes",
    description: "Light jokes and good humour",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    emoji: "🌿",
    href: "/vibe?category=lifestyle",
    description: "Everyday living, style and habits",
  },
  {
    id: "trending-zim",
    label: "Trending in Zim",
    emoji: "🔥",
    href: "/vibe/trending",
    description: "Community talk from Zimbabwe",
  },
];

export const VIBE_POST_CATEGORIES = VIBE_CATEGORY_LIST.filter(
  (item): item is VibeCategory & { id: VibePostCategory } => item.id !== "all"
);

export function isVibeCategoryId(value: string): value is VibeCategoryId {
  return VIBE_CATEGORY_LIST.some((item) => item.id === value);
}

export function isVibePostCategory(value: string): value is VibePostCategory {
  return value !== "all" && isVibeCategoryId(value);
}

export function vibeCategoryById(id: string): VibeCategory | undefined {
  return VIBE_CATEGORY_LIST.find((item) => item.id === id);
}

export function vibeCategoryLabel(id: string): string {
  return vibeCategoryById(id)?.label ?? id;
}
