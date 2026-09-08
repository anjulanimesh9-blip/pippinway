import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { User } from "firebase/auth";
import { auth, db, storage } from "@/app/firebase";
import { compressListingImage } from "@/lib/compressImage";
import { isVibePostCategory } from "./categories";
import {
  VIBE_COMMENT_COOLDOWN_MS,
  VIBE_COMMENT_PAGE_SIZE,
  VIBE_FEED_PAGE_SIZE,
  VIBE_LIVE_TEXT_FIELD_MAX,
  VIBE_POST_COOLDOWN_MS,
  VIBE_SIMILAR_LIMIT,
} from "./constants";
import type {
  VibeComment,
  VibePost,
  VibePostCategory,
  VibeProfile,
  VibeReportReason,
} from "./types";
import {
  isAllowedVibeImage,
  validateBio,
  validateCommentInput,
  validateDisplayName,
  validatePostInput,
  validateReportNote,
} from "./validation";

const lastPostAtLocal = new Map<string, number>();
const lastCommentAtLocal = new Map<string, number>();

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const rec = err as { code?: string; message?: string };
  return rec.code === "permission-denied" || /insufficient permissions/i.test(rec.message || "");
}

function asPublishError(err: unknown): Error {
  if (isPermissionDenied(err)) {
    return new Error("Could not publish this post. Please try again in a few seconds.");
  }
  return err instanceof Error ? err : new Error("Could not publish.");
}

export function mapVibePost(id: string, data: Record<string, unknown>): VibePost | null {
  const category = asString(data.category);
  if (!isVibePostCategory(category)) return null;
  const status = asString(data.status) || "visible";
  if (status !== "visible" && status !== "hidden" && status !== "removed") return null;
  const postType = asString(data.postType) || (asString(data.imageUrl) ? "image" : "text");
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName) || "Member",
    authorPhoto: asString(data.authorPhoto),
    text: asString(data.fullText) || asString(data.text),
    imageUrl: asString(data.imageUrl),
    category,
    postType: postType === "poll" || postType === "image" ? postType : "text",
    status,
    likeCount: Math.max(0, asNumber(data.likeCount)),
    commentCount: Math.max(0, asNumber(data.commentCount)),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    zodiacSign: asString(data.zodiacSign) || undefined,
    parentId: data.parentId == null ? null : asString(data.parentId),
  };
}

export function mapVibeComment(
  id: string,
  data: Record<string, unknown>
): VibeComment | null {
  const status = asString(data.status) || "visible";
  if (status !== "visible") return null;
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName) || "Member",
    authorPhoto: asString(data.authorPhoto),
    text: asString(data.text),
    status,
    parentId: data.parentId ? asString(data.parentId) : null,
    createdAt: data.createdAt,
  };
}

export function mapVibeProfile(
  id: string,
  data: Record<string, unknown>
): VibeProfile {
  return {
    id,
    displayName: asString(data.displayName) || "Member",
    photoURL: asString(data.photoURL),
    bio: asString(data.bio),
    followerCount: Math.max(0, asNumber(data.followerCount)),
    followingCount: Math.max(0, asNumber(data.followingCount)),
    postCount: Math.max(0, asNumber(data.postCount)),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function followId(followerId: string, followingId: string) {
  return `${followerId}_${followingId}`;
}

function reportId(uid: string, targetType: string, targetId: string) {
  return `${uid}_${targetType}_${targetId}`;
}

export async function authorSnapshot(user: User): Promise<{
  name: string;
  photo: string;
}> {
  let name = user.displayName || "";
  let photo = user.photoURL || "";
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      name = asString(data.displayName) || name;
      photo = asString(data.profileImage) || photo;
    }
  } catch {
    // Own user read can fail offline; fall back to auth fields.
  }
  try {
    const vibe = await getDoc(doc(db, "vibeProfiles", user.uid));
    if (vibe.exists()) {
      const data = vibe.data();
      name = asString(data.displayName) || name;
      photo = asString(data.photoURL) || photo;
    }
  } catch {
    // Public profile read is optional here.
  }
  return { name: validateDisplayName(name || user.email?.split("@")[0] || "Member"), photo };
}

export async function ensureVibeProfile(user: User): Promise<VibeProfile> {
  const author = await authorSnapshot(user);
  const fallback: VibeProfile = {
    id: user.uid,
    displayName: author.name,
    photoURL: author.photo,
    bio: "",
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
  };
  try {
    const refDoc = doc(db, "vibeProfiles", user.uid);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) {
      await setDoc(refDoc, {
        displayName: author.name,
        photoURL: author.photo,
        bio: "",
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        createdAt: serverTimestamp(),
      });
      return fallback;
    }
    const mapped = mapVibeProfile(user.uid, snap.data() as Record<string, unknown>);
    const patch: Record<string, string> = {};
    if (!mapped.displayName && author.name) patch.displayName = author.name;
    if (!mapped.photoURL && author.photo) patch.photoURL = author.photo;
    if (Object.keys(patch).length) {
      await updateDoc(refDoc, { ...patch, updatedAt: serverTimestamp() }).catch(() => undefined);
    }
    return { ...mapped, ...patch };
  } catch {
    return fallback;
  }
}

export async function updateVibeBio(uid: string, bio: string): Promise<string> {
  const clean = validateBio(bio);
  await updateDoc(doc(db, "vibeProfiles", uid), {
    bio: clean,
    updatedAt: serverTimestamp(),
  });
  return clean;
}

export async function getVibeProfile(uid: string): Promise<VibeProfile | null> {
  const snap = await getDoc(doc(db, "vibeProfiles", uid));
  if (!snap.exists()) return null;
  return mapVibeProfile(uid, snap.data() as Record<string, unknown>);
}

export async function getVibePost(id: string): Promise<VibePost | null> {
  const snap = await getDoc(doc(db, "vibePosts", id));
  if (!snap.exists()) return null;
  return mapVibePost(id, snap.data() as Record<string, unknown>);
}

export async function uploadVibeImage(user: User, file: File): Promise<string> {
  if (!isAllowedVibeImage(file)) {
    throw new Error("Choose a JPG, PNG, WEBP or GIF under 8MB.");
  }
  const compressed = await compressListingImage(file);
  const stamp = Date.now();
  const paths = [`vibe/${user.uid}/${stamp}.jpg`, `listings/vibe-${user.uid}-${stamp}.jpg`];
  let lastError: unknown;
  for (const path of paths) {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, compressed, { contentType: "image/jpeg" });
      return getDownloadURL(storageRef);
    } catch (err) {
      lastError = err;
      if (!isPermissionDenied(err)) throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not upload photo.");
}

function assertCooldown(map: Map<string, number>, uid: string, waitMs: number, label: string) {
  const prev = map.get(uid) ?? 0;
  const wait = waitMs - (Date.now() - prev);
  if (wait > 0) {
    throw new Error(`Please wait ${Math.ceil(wait / 1000)}s before another ${label}.`);
  }
}

export async function createVibePost(input: {
  text: string;
  category: string;
  zodiacSign?: string;
  imageFile?: File | null;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to post.");
  assertCooldown(lastPostAtLocal, user.uid, VIBE_POST_COOLDOWN_MS, "post");

  const parsed = validatePostInput({
    text: input.text,
    category: input.category,
    zodiacSign: input.zodiacSign,
    hasImage: Boolean(input.imageFile),
  });
  if (!parsed.ok) throw new Error(parsed.error);

  await ensureVibeProfile(user).catch(() => undefined);
  const author = await authorSnapshot(user);
  let imageUrl = "";
  if (input.imageFile) {
    try {
      imageUrl = await uploadVibeImage(user, input.imageFile);
    } catch (err) {
      throw asPublishError(err);
    }
  }

  const previewText =
    parsed.text.length <= VIBE_LIVE_TEXT_FIELD_MAX
      ? parsed.text
      : parsed.text.slice(0, VIBE_LIVE_TEXT_FIELD_MAX);
  const payload: Record<string, unknown> = {
    authorId: user.uid,
    authorName: author.name,
    authorPhoto: author.photo,
    text: previewText,
    imageUrl,
    category: parsed.category,
    postType: imageUrl ? "image" : "text",
    status: "visible",
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  };
  if (parsed.text.length > VIBE_LIVE_TEXT_FIELD_MAX) {
    payload.fullText = parsed.text;
  }
  if (parsed.zodiacSign) payload.zodiacSign = parsed.zodiacSign;

  const postRef = await addDoc(collection(db, "vibePosts"), payload).catch((err) => {
    throw asPublishError(err);
  });
  await updateDoc(doc(db, "vibeProfiles", user.uid), {
    lastPostAt: serverTimestamp(),
    postCount: increment(1),
    displayName: author.name,
    photoURL: author.photo,
    updatedAt: serverTimestamp(),
  }).catch(() => undefined);
  lastPostAtLocal.set(user.uid, Date.now());
  return postRef.id;
}

export async function removeOwnVibePost(post: VibePost, isAdmin = false): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in first.");
  if (post.authorId !== user.uid && !isAdmin) throw new Error("You can only remove your own post.");
  await updateDoc(doc(db, "vibePosts", post.id), {
    status: "removed",
    updatedAt: serverTimestamp(),
  });
  if (post.authorId) {
    await updateDoc(doc(db, "vibeProfiles", post.authorId), {
      postCount: increment(-1),
      updatedAt: serverTimestamp(),
    }).catch(() => undefined);
  }
}

export async function adminSetPostStatus(
  postId: string,
  status: "visible" | "hidden" | "removed"
): Promise<void> {
  await updateDoc(doc(db, "vibePosts", postId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function adminSetCommentStatus(
  postId: string,
  commentId: string,
  status: "visible" | "hidden" | "removed"
): Promise<void> {
  await updateDoc(doc(db, "vibePosts", postId, "comments", commentId), {
    status,
  });
}

export type FeedPage = {
  posts: VibePost[];
  cursor: QueryDocumentSnapshot | null;
};

export async function fetchSimilarVibePosts(options: {
  excludeId: string;
  category: VibePostCategory;
  limitCount?: number;
}): Promise<VibePost[]> {
  const wanted = options.limitCount ?? VIBE_SIMILAR_LIMIT;
  const extra = wanted + 1;
  const sameCategory = await fetchVibeFeed({
    category: options.category,
    pageSize: extra,
  });
  const picked: VibePost[] = [];
  const seen = new Set<string>([options.excludeId]);
  for (const post of sameCategory.posts) {
    if (seen.has(post.id)) continue;
    picked.push(post);
    seen.add(post.id);
    if (picked.length >= wanted) return picked;
  }

  const recent = await fetchVibeFeed({
    category: "all",
    pageSize: extra,
  });
  for (const post of recent.posts) {
    if (seen.has(post.id)) continue;
    picked.push(post);
    seen.add(post.id);
    if (picked.length >= wanted) break;
  }
  return picked;
}

export async function fetchVibeFeed(options: {
  category?: VibePostCategory | "all";
  authorId?: string;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot | DocumentSnapshot | null;
}): Promise<FeedPage> {
  const pageSize = options.pageSize ?? VIBE_FEED_PAGE_SIZE;
  const constraints: QueryConstraint[] = [where("status", "==", "visible")];
  if (options.authorId) constraints.push(where("authorId", "==", options.authorId));
  if (options.category && options.category !== "all") {
    constraints.push(where("category", "==", options.category));
  }
  constraints.push(orderBy("createdAt", "desc"));
  if (options.cursor) constraints.push(startAfter(options.cursor));
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, "vibePosts"), ...constraints));
  const posts = snap.docs
    .map((item) => mapVibePost(item.id, item.data() as Record<string, unknown>))
    .filter((item): item is VibePost => Boolean(item));
  const cursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;
  return { posts, cursor };
}

export async function fetchSavedPosts(uid: string): Promise<VibePost[]> {
  const saved = await getDocs(collection(db, "users", uid, "vibeSaves"));
  const ids = saved.docs.map((item) => item.id);
  const posts = await Promise.all(ids.map((id) => getVibePost(id)));
  return posts.filter((post): post is VibePost => post !== null && post.status === "visible");
}

export async function hasLiked(postId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "vibePosts", postId, "likes", uid));
  return snap.exists();
}

export async function hasSaved(postId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid, "vibeSaves", postId));
  return snap.exists();
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "vibeFollows", followId(followerId, followingId)));
  return snap.exists();
}

export async function toggleLike(post: VibePost, liked: boolean): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to like posts.");
  const likeRef = doc(db, "vibePosts", post.id, "likes", user.uid);
  const postRef = doc(db, "vibePosts", post.id);
  const batch = writeBatch(db);
  if (liked) {
    batch.delete(likeRef);
    batch.update(postRef, { likeCount: increment(-1) });
  } else {
    batch.set(likeRef, { createdAt: serverTimestamp() });
    batch.update(postRef, { likeCount: increment(1) });
  }
  await batch.commit();
  return !liked;
}

export async function toggleSave(postId: string, saved: boolean): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to save posts.");
  const saveRef = doc(db, "users", user.uid, "vibeSaves", postId);
  if (saved) {
    await deleteDoc(saveRef);
  } else {
    await setDoc(saveRef, { createdAt: serverTimestamp() });
  }
  return !saved;
}

export async function toggleFollow(
  targetUid: string,
  following: boolean
): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to follow people.");
  if (user.uid === targetUid) throw new Error("You cannot follow yourself.");
  await ensureVibeProfile(user);
  const rel = doc(db, "vibeFollows", followId(user.uid, targetUid));
  const me = doc(db, "vibeProfiles", user.uid);
  const them = doc(db, "vibeProfiles", targetUid);
  const targetSnap = await getDoc(them);
  const batch = writeBatch(db);
  if (following) {
    batch.delete(rel);
    batch.update(me, { followingCount: increment(-1) });
    if (targetSnap.exists()) {
      batch.update(them, { followerCount: increment(-1) });
    }
  } else {
    batch.set(rel, {
      followerId: user.uid,
      followingId: targetUid,
      createdAt: serverTimestamp(),
    });
    batch.update(me, { followingCount: increment(1) });
    if (targetSnap.exists()) {
      batch.update(them, { followerCount: increment(1) });
    }
  }
  await batch.commit();
  return !following;
}

export async function fetchComments(
  postId: string,
  cursor?: QueryDocumentSnapshot | null
): Promise<{ comments: VibeComment[]; cursor: QueryDocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "visible"),
    orderBy("createdAt", "asc"),
    limit(VIBE_COMMENT_PAGE_SIZE),
  ];
  if (cursor) constraints.push(startAfter(cursor));
  const snap = await getDocs(
    query(collection(db, "vibePosts", postId, "comments"), ...constraints)
  );
  const comments = snap.docs
    .map((item) => mapVibeComment(item.id, item.data() as Record<string, unknown>))
    .filter((item): item is VibeComment => Boolean(item));
  const next =
    snap.docs.length === VIBE_COMMENT_PAGE_SIZE
      ? snap.docs[snap.docs.length - 1]
      : null;
  return { comments, cursor: next };
}

export async function addVibeComment(postId: string, text: string): Promise<VibeComment> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to comment.");
  assertCooldown(lastCommentAtLocal, user.uid, VIBE_COMMENT_COOLDOWN_MS, "comment");
  const parsed = validateCommentInput(text);
  if (!parsed.ok) throw new Error(parsed.error);

  await ensureVibeProfile(user);
  const author = await authorSnapshot(user);
  const payload = {
    authorId: user.uid,
    authorName: author.name,
    authorPhoto: author.photo,
    text: parsed.text,
    status: "visible" as const,
    parentId: null,
    createdAt: serverTimestamp(),
  };
  const refDoc = await addDoc(collection(db, "vibePosts", postId, "comments"), payload);
  await updateDoc(doc(db, "vibePosts", postId), {
    commentCount: increment(1),
  });
  await updateDoc(doc(db, "vibeProfiles", user.uid), {
    lastCommentAt: serverTimestamp(),
  }).catch(() => undefined);
  lastCommentAtLocal.set(user.uid, Date.now());
  return {
    id: refDoc.id,
    ...payload,
    createdAt: new Date(),
  };
}

export async function removeOwnComment(
  postId: string,
  comment: VibeComment,
  isAdmin = false
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in first.");
  if (comment.authorId !== user.uid && !isAdmin) {
    throw new Error("You can only remove your own comment.");
  }
  await updateDoc(doc(db, "vibePosts", postId, "comments", comment.id), {
    status: "removed",
  });
  await updateDoc(doc(db, "vibePosts", postId), {
    commentCount: increment(-1),
  });
}

export async function reportVibeContent(input: {
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  reason: VibeReportReason;
  note?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to report.");
  const id = reportId(user.uid, input.targetType, input.targetId);
  await setDoc(doc(db, "vibeReports", id), {
    reporterId: user.uid,
    targetType: input.targetType,
    targetId: input.targetId,
    postId: input.postId,
    reason: input.reason,
    note: validateReportNote(input.note ?? ""),
    createdAt: serverTimestamp(),
  });
}

export async function blockVibeUser(blockedUid: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in first.");
  if (user.uid === blockedUid) throw new Error("You cannot block yourself.");
  await setDoc(doc(db, "users", user.uid, "vibeBlocks", blockedUid), {
    createdAt: serverTimestamp(),
  });
}

export async function fetchBlockedIds(uid: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "users", uid, "vibeBlocks"));
    return snap.docs.map((item) => item.id);
  } catch {
    return [];
  }
}

export async function fetchAdminVibePosts(limitCount = 80): Promise<VibePost[]> {
  const snap = await getDocs(
    query(collection(db, "vibePosts"), orderBy("createdAt", "desc"), limit(limitCount))
  );
  return snap.docs
    .map((item) => mapVibePost(item.id, item.data() as Record<string, unknown>))
    .filter((item): item is VibePost => Boolean(item));
}

export async function fetchAdminReports(limitCount = 80) {
  const snap = await getDocs(
    query(collection(db, "vibeReports"), orderBy("createdAt", "desc"), limit(limitCount))
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  if (user.email === "anjulanimesh9@gmail.com") return true;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    return snap.data()?.role === "admin";
  } catch {
    return false;
  }
}
