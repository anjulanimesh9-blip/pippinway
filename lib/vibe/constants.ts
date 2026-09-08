export const VIBE_FEED_PAGE_SIZE = 8;
export const VIBE_COMMENT_PAGE_SIZE = 20;
export const VIBE_TEXT_MAX = 2000;
export const VIBE_COMMENT_MAX = 500;
export const VIBE_BIO_MAX = 160;
export const VIBE_NAME_MAX = 80;
export const VIBE_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const VIBE_POST_COOLDOWN_MS = 20_000;
export const VIBE_COMMENT_COOLDOWN_MS = 8_000;
export const VIBE_REPORT_NOTE_MAX = 280;

export const VIBE_PATHS = {
  home: "/vibe",
  compose: "/vibe?compose=1",
  post: (id: string) => `/vibe/post/${encodeURIComponent(id)}`,
  profile: (uid: string) => `/vibe/u/${encodeURIComponent(uid)}`,
  stars: "/vibe/stars",
  loveMatch: "/vibe/love-match",
  lucky: "/vibe/lucky",
  quizzes: "/vibe/quizzes",
  quiz: (slug: string) => `/vibe/quizzes/${encodeURIComponent(slug)}`,
  trending: "/vibe/trending",
  saved: "/vibe/saved",
} as const;
