import { cache } from "react";
import type { PublicVibePost } from "@/lib/vibe/seo";

const PROJECT_ID = "pippinway-e9719";
const API_KEY = "AIzaSyDJhlz8ZZ1GZPfFigBPT_eLFicpUECTqRE";

function firestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  if ("stringValue" in rec) return rec.stringValue;
  if ("integerValue" in rec) return Number(rec.integerValue);
  if ("doubleValue" in rec) return rec.doubleValue;
  if ("booleanValue" in rec) return rec.booleanValue;
  if ("timestampValue" in rec) return rec.timestampValue;
  if ("nullValue" in rec) return null;
  if ("mapValue" in rec) {
    const fields = (rec.mapValue as { fields?: Record<string, unknown> }).fields;
    if (!fields) return {};
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(fields)) {
      out[key] = firestoreValue(nested);
    }
    return out;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function parsePost(
  id: string,
  fields: Record<string, unknown> | undefined
): PublicVibePost | null {
  if (!fields) return null;
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    parsed[key] = firestoreValue(value);
  }
  return {
    id,
    text: asString(parsed.text) ?? "",
    imageUrl: asString(parsed.imageUrl),
    category: asString(parsed.category),
    authorName: asString(parsed.authorName),
    status: asString(parsed.status) ?? "visible",
  };
}

export const getPublicVibePost = cache(
  async (id: string): Promise<PublicVibePost | null> => {
    if (!id) return null;
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
      `/databases/(default)/documents/vibePosts/${encodeURIComponent(id)}` +
      `?key=${API_KEY}`;
    try {
      const response = await fetch(url, { next: { revalidate: 120 } });
      if (!response.ok) return null;
      const payload = (await response.json()) as {
        fields?: Record<string, unknown>;
      };
      return parsePost(id, payload.fields);
    } catch {
      return null;
    }
  }
);

export const getPublicVibeProfile = cache(
  async (
    uid: string
  ): Promise<{ displayName?: string; bio?: string } | null> => {
    if (!uid) return null;
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
      `/databases/(default)/documents/vibeProfiles/${encodeURIComponent(uid)}` +
      `?key=${API_KEY}`;
    try {
      const response = await fetch(url, { next: { revalidate: 300 } });
      if (!response.ok) return null;
      const payload = (await response.json()) as {
        fields?: Record<string, unknown>;
      };
      if (!payload.fields) return null;
      return {
        displayName: asString(firestoreValue(payload.fields.displayName)),
        bio: asString(firestoreValue(payload.fields.bio)),
      };
    } catch {
      return null;
    }
  }
);

export async function getPublicVibePostsForSitemap(
  limit = 80
): Promise<PublicVibePost[]> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents:runQuery?key=${API_KEY}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
      signal: controller.signal,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "vibePosts" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "visible" },
            },
          },
          orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
          limit,
        },
      }),
    });
    clearTimeout(timer);
    if (!response.ok) return [];

    const rows = (await response.json()) as Array<{
      document?: { name?: string; fields?: Record<string, unknown> };
    }>;

    const posts: PublicVibePost[] = [];
    for (const row of rows) {
      const name = row.document?.name;
      const id = name?.split("/").pop();
      if (!id) continue;
      const post = parsePost(id, row.document?.fields);
      if (post && post.status === "visible") posts.push(post);
    }
    return posts;
  } catch {
    return [];
  }
}
