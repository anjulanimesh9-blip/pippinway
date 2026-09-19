import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/app/firebase";
import { compressListingImage } from "@/lib/compressImage";
import { THE_LAST_WITNESS, THE_LAST_WITNESS_SLUG } from "./theLastWitness";
import type { InteractiveStory, StoryScene } from "./types";
import { validateInteractiveStory } from "./validate";

export const VIBE_STORIES_COLLECTION = "vibeStories";
export const VIBE_STORY_COVER_PREFIX = "vibeStories/";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapChoice(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const id = asString(data.id).trim();
  const label = asString(data.label).trim();
  const destinationId = asString(data.destinationId).trim();
  if (!id || !label || !destinationId) return null;
  return { id, label, destinationId };
}

function mapScene(value: unknown): StoryScene | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const id = asString(data.id).trim();
  if (!id) return null;
  const choices = Array.isArray(data.choices)
    ? data.choices.map(mapChoice).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];
  const arriveFromRaw = data.arriveFrom;
  const arriveFrom =
    arriveFromRaw && typeof arriveFromRaw === "object"
      ? Object.fromEntries(
          Object.entries(arriveFromRaw as Record<string, unknown>)
            .map(([key, text]) => [key, asString(text).trim()])
            .filter(([, text]) => text)
        )
      : undefined;
  return {
    id,
    title: asString(data.title).trim(),
    time: asString(data.time).trim(),
    location: asString(data.location).trim(),
    text: asString(data.text).trim(),
    choices,
    isEnding: asBool(data.isEnding),
    arriveFrom: arriveFrom && Object.keys(arriveFrom).length ? arriveFrom : undefined,
    imageUrl: asString(data.imageUrl).trim() || undefined,
    imagePath: asString(data.imagePath).trim() || undefined,
  };
}

export function mapInteractiveStory(
  id: string,
  data: Record<string, unknown>
): InteractiveStory | null {
  const slug = slugify(asString(data.slug) || id);
  if (!slug) return null;
  const scenes = Array.isArray(data.scenes)
    ? data.scenes.map(mapScene).filter((item): item is StoryScene => Boolean(item))
    : [];
  return {
    id,
    slug,
    title: asString(data.title).trim(),
    subtitle: asString(data.subtitle).trim(),
    introduction: asString(data.introduction).trim(),
    coverImageUrl: asString(data.coverImageUrl).trim(),
    coverImagePath: asString(data.coverImagePath).trim(),
    startSceneId: asString(data.startSceneId).trim() || scenes[0]?.id || "",
    published: asBool(data.published),
    scenes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: asString(data.createdBy) || undefined,
  };
}

export function storyBySlug(stories: InteractiveStory[], slug: string) {
  return stories.find((story) => story.slug === slug);
}

export function withSeedSceneImages(story: InteractiveStory): InteractiveStory {
  if (story.slug !== THE_LAST_WITNESS_SLUG) return story;
  return {
    ...story,
    scenes: story.scenes.map((scene) => {
      if (scene.imageUrl) return scene;
      const seed = THE_LAST_WITNESS.scenes.find((item) => item.id === scene.id);
      if (!seed?.imageUrl) return scene;
      return { ...scene, imageUrl: seed.imageUrl, imagePath: scene.imagePath || seed.imagePath };
    }),
  };
}

export function mergePublicStories(remote: InteractiveStory[]): InteractiveStory[] {
  return remote
    .filter((story) => story.published)
    .map(withSeedSceneImages)
    .sort((a, b) => {
      if (a.slug === THE_LAST_WITNESS_SLUG) return -1;
      if (b.slug === THE_LAST_WITNESS_SLUG) return 1;
      return a.title.localeCompare(b.title);
    });
}

export async function fetchPublishedStories(): Promise<InteractiveStory[]> {
  try {
    const snap = await getDocs(
      query(collection(db, VIBE_STORIES_COLLECTION), where("published", "==", true))
    );
    const remote = snap.docs
      .map((item) => mapInteractiveStory(item.id, item.data() as Record<string, unknown>))
      .filter((item): item is InteractiveStory => Boolean(item));
    const published = mergePublicStories(remote);
    if (published.some((story) => story.slug === THE_LAST_WITNESS_SLUG)) {
      return published;
    }

    try {
      const seedSnap = await getDoc(doc(db, VIBE_STORIES_COLLECTION, THE_LAST_WITNESS_SLUG));
      if (seedSnap.exists()) {
        const mapped = mapInteractiveStory(
          seedSnap.id,
          seedSnap.data() as Record<string, unknown>
        );
        return mapped?.published ? mergePublicStories([mapped, ...remote]) : published;
      }
      return mergePublicStories([THE_LAST_WITNESS, ...remote]);
    } catch {
      return published;
    }
  } catch {
    return [THE_LAST_WITNESS];
  }
}

export async function fetchPublicStory(slug: string): Promise<InteractiveStory | null> {
  const stories = await fetchPublishedStories();
  return storyBySlug(stories, slug) ?? null;
}

export async function fetchAdminStories(): Promise<InteractiveStory[]> {
  const snap = await getDocs(collection(db, VIBE_STORIES_COLLECTION));
  const remote = snap.docs
    .map((item) => mapInteractiveStory(item.id, item.data() as Record<string, unknown>))
    .filter((item): item is InteractiveStory => Boolean(item));
  const mapped = remote.map(withSeedSceneImages);
  if (!mapped.some((story) => story.slug === THE_LAST_WITNESS_SLUG)) {
    return [THE_LAST_WITNESS, ...mapped];
  }
  return mapped.sort((a, b) => a.title.localeCompare(b.title));
}

export async function fetchAdminStory(id: string): Promise<InteractiveStory | null> {
  if (id === "new") return emptyStoryDraft();
  if (id === THE_LAST_WITNESS_SLUG) {
    const snap = await getDoc(doc(db, VIBE_STORIES_COLLECTION, THE_LAST_WITNESS_SLUG));
    if (snap.exists()) {
      const mapped = mapInteractiveStory(snap.id, snap.data() as Record<string, unknown>);
      return mapped ? withSeedSceneImages(mapped) : { ...THE_LAST_WITNESS };
    }
    return { ...THE_LAST_WITNESS };
  }
  const snap = await getDoc(doc(db, VIBE_STORIES_COLLECTION, id));
  if (!snap.exists()) return null;
  const mapped = mapInteractiveStory(snap.id, snap.data() as Record<string, unknown>);
  return mapped ? withSeedSceneImages(mapped) : null;
}

export function emptyStoryDraft(): InteractiveStory {
  return {
    id: "",
    slug: "",
    title: "",
    subtitle: "",
    introduction: "",
    coverImageUrl: "",
    coverImagePath: "",
    startSceneId: "01",
    published: false,
    scenes: [
      {
        id: "01",
        title: "",
        time: "",
        location: "",
        text: "",
        choices: [
          { id: "A", label: "", destinationId: "" },
          { id: "B", label: "", destinationId: "" },
        ],
        isEnding: false,
      },
    ],
  };
}

async function uploadStoryAsset(file: File, prefix: string): Promise<{ url: string; path: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in as admin to upload an image.");
  const compressed = await compressListingImage(file);
  const path = `${prefix}${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: "image/jpeg" });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function uploadStoryCover(file: File): Promise<{ url: string; path: string }> {
  return uploadStoryAsset(file, VIBE_STORY_COVER_PREFIX);
}

export async function uploadStorySceneImage(file: File): Promise<{ url: string; path: string }> {
  return uploadStoryAsset(file, `${VIBE_STORY_COVER_PREFIX}scene-`);
}

export async function removeStoryCover(path: string) {
  if (!path.startsWith(VIBE_STORY_COVER_PREFIX)) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Keep going if the old file is already gone.
  }
}

export async function saveInteractiveStory(
  input: InteractiveStory
): Promise<InteractiveStory> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in as admin to save a story.");

  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Add a story title or slug first.");
  const id = input.id || slug;
  const scenes = input.scenes.map((scene) => ({
    ...scene,
    id: scene.id.trim(),
    title: scene.title.trim(),
    time: scene.time.trim(),
    location: scene.location.trim(),
    text: scene.text.trim(),
    imageUrl: scene.imageUrl?.trim() || "",
    imagePath: scene.imagePath?.trim() || "",
    choices: scene.isEnding
      ? []
      : scene.choices
          .map((choice) => ({
            id: choice.id.trim(),
            label: choice.label.trim(),
            destinationId: choice.destinationId.trim(),
          }))
          .filter((choice) => choice.id && choice.label && choice.destinationId),
  }));

  const payload: InteractiveStory = {
    id,
    slug,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    introduction: input.introduction.trim(),
    coverImageUrl: input.coverImageUrl.trim(),
    coverImagePath: input.coverImagePath.trim(),
    startSceneId: input.startSceneId.trim() || scenes[0]?.id || "",
    published: input.published,
    scenes,
    createdBy: input.createdBy || user.uid,
  };

  if (payload.published) {
    const check = validateInteractiveStory(payload);
    if (!check.ok) {
      throw new Error(check.errors[0] || "This story cannot be published yet.");
    }
  }

  const refDoc = doc(db, VIBE_STORIES_COLLECTION, id);
  const existing = await getDoc(refDoc);
  await setDoc(
    refDoc,
    {
      ...payload,
      createdAt: existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    },
    { merge: false }
  );
  return payload;
}

export async function setStoryPublished(id: string, published: boolean) {
  const story = await fetchAdminStory(id);
  if (!story) throw new Error("Story not found.");
  await saveInteractiveStory({ ...story, id, published });
}

export async function deleteInteractiveStory(id: string) {
  await deleteDoc(doc(db, VIBE_STORIES_COLLECTION, id));
}
