import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { vibeCategoryLabel } from "./categories";
import { VIBE_PATHS } from "./constants";

export const VIBE_OG_IMAGE_PATH = "/images/vibe-og.jpg";

export const VIBE_OG_IMAGE = {
  url: VIBE_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Pippinway Vibe",
} as const;

export function vibeUrl(path: string = VIBE_PATHS.home): string {
  return `${SITE_URL}${path}`;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export const VIBE_HOME_DESCRIPTION =
  "Pippinway Vibe is the community side of Pippinway: share thoughts, Your Stars, Love Match, quizzes and local conversation. Share. Read. Connect. Discover.";

export function vibeHomeMetadata(): Metadata {
  const canonical = vibeUrl();
  const title = "Pippinway Vibe";
  return {
    title,
    description: VIBE_HOME_DESCRIPTION,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: VIBE_HOME_DESCRIPTION,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: [VIBE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: VIBE_HOME_DESCRIPTION,
      images: [VIBE_OG_IMAGE.url],
    },
  };
}

export function vibeSectionMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const canonical = vibeUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: [VIBE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [VIBE_OG_IMAGE.url],
    },
  };
}

export type PublicVibePost = {
  id: string;
  text: string;
  imageUrl?: string;
  category?: string;
  authorName?: string;
  status?: string;
};

export function vibePostMetadata(post: PublicVibePost | null, id: string): Metadata {
  const canonical = vibeUrl(VIBE_PATHS.post(id));
  if (!post || post.status !== "visible") {
    return {
      title: "Pippinway Vibe",
      description: VIBE_HOME_DESCRIPTION,
      robots: { index: false, follow: false },
      alternates: { canonical },
      openGraph: {
        title: `Pippinway Vibe | ${SITE_NAME}`,
        description: VIBE_HOME_DESCRIPTION,
        url: canonical,
        siteName: SITE_NAME,
        type: "article",
        images: [VIBE_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: `Pippinway Vibe | ${SITE_NAME}`,
        description: VIBE_HOME_DESCRIPTION,
        images: [VIBE_OG_IMAGE.url],
      },
    };
  }

  const category = post.category ? vibeCategoryLabel(post.category) : "Vibe";
  const firstLine = post.text.split(/\n/)[0]?.replace(/^[◆•\-–\s]+/, "").trim() || "";
  const description = clip(
    post.text || `A ${category} post on Pippinway Vibe.`,
    160
  );
  const title =
    clip(firstLine, 70) ||
    clip(post.text, 70) ||
    `${category} on Pippinway Vibe`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [VIBE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [VIBE_OG_IMAGE.url],
    },
  };
}

export function vibeProfileMetadata(
  name: string | undefined,
  uid: string,
  bio?: string
): Metadata {
  const canonical = vibeUrl(VIBE_PATHS.profile(uid));
  const display = name?.trim() || "Vibe creator";
  const description = clip(
    bio?.trim() || `${display} on Pippinway Vibe. Follow their posts and join the conversation.`,
    160
  );
  return {
    title: display,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${display} | Pippinway Vibe`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "profile",
      images: [VIBE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${display} | Pippinway Vibe`,
      description,
      images: [VIBE_OG_IMAGE.url],
    },
  };
}
