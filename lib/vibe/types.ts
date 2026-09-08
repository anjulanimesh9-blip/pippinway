export const VIBE_CATEGORIES = [
  "all",
  "your-stars",
  "love-relationships",
  "motivation",
  "fun-memes",
  "lifestyle",
  "trending-zim",
] as const;

export type VibeCategoryId = (typeof VIBE_CATEGORIES)[number];
export type VibePostCategory = Exclude<VibeCategoryId, "all">;

export const VIBE_POST_TYPES = ["text", "image", "poll"] as const;
export type VibePostType = (typeof VIBE_POST_TYPES)[number];

export const VIBE_STATUSES = ["visible", "hidden", "removed"] as const;
export type VibeStatus = (typeof VIBE_STATUSES)[number];

export const VIBE_REPORT_REASONS = [
  "spam",
  "harassment",
  "hate",
  "sexual",
  "misinformation",
  "other",
] as const;
export type VibeReportReason = (typeof VIBE_REPORT_REASONS)[number];

export type VibePost = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  imageUrl: string;
  category: VibePostCategory;
  postType: VibePostType;
  status: VibeStatus;
  likeCount: number;
  commentCount: number;
  createdAt: unknown;
  updatedAt?: unknown;
  zodiacSign?: string;
  parentId?: string | null;
};

export type VibeComment = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  status: VibeStatus;
  parentId: string | null;
  createdAt: unknown;
};

export type VibeProfile = {
  id: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type VibeReport = {
  id: string;
  reporterId: string;
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  reason: VibeReportReason;
  note: string;
  createdAt: unknown;
};
