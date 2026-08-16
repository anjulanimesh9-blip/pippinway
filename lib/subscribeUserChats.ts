import {
  collection,
  onSnapshot,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/app/firebase";

export type ChatDoc = {
  id: string;
  buyerEmail?: string;
  sellerEmail?: string;
  listingId?: string;
  lastMessage?: string;
  lastSender?: string;
  updatedAt?: unknown;
  readBy?: Record<string, boolean>;
};

function mapChatDoc(d: QueryDocumentSnapshot): ChatDoc {
  return { id: d.id, ...(d.data() as Omit<ChatDoc, "id">) };
}

function getUpdatedAtMs(chat: ChatDoc): number {
  const raw = chat.updatedAt;
  if (!raw) return 0;
  if (typeof (raw as { toMillis?: () => number }).toMillis === "function") {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (typeof (raw as { seconds?: number }).seconds === "number") {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function isPermissionDenied(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "permission-denied"
  );
}

/**
 * Realtime chat rooms for one participant. Two scoped queries (no orderBy)
 * so Firestore rules and missing composite indexes do not reject the listen.
 */
export function subscribeUserChats(
  email: string,
  onUpdate: (chats: ChatDoc[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!email) {
    onUpdate([]);
    return () => {};
  }

  let buyerChats: ChatDoc[] = [];
  let sellerChats: ChatDoc[] = [];

  const emit = () => {
    const merged = new Map<string, ChatDoc>();
    for (const chat of [...buyerChats, ...sellerChats]) {
      merged.set(chat.id, chat);
    }
    onUpdate(
      Array.from(merged.values()).sort(
        (a, b) => getUpdatedAtMs(b) - getUpdatedAtMs(a)
      )
    );
  };

  const handleError = (err: unknown) => {
    if (isPermissionDenied(err)) {
      onUpdate([]);
      return;
    }
    onError?.(err);
  };

  const qBuyer = query(
    collection(db, "chats"),
    where("buyerEmail", "==", email)
  );

  const qSeller = query(
    collection(db, "chats"),
    where("sellerEmail", "==", email)
  );

  const unsubBuyer = onSnapshot(
    qBuyer,
    (snapshot) => {
      buyerChats = snapshot.docs.map(mapChatDoc);
      emit();
    },
    handleError
  );

  const unsubSeller = onSnapshot(
    qSeller,
    (snapshot) => {
      sellerChats = snapshot.docs.map(mapChatDoc);
      emit();
    },
    handleError
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}
