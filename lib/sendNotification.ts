import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase";

export async function sendNotification(params: {
  userEmail: string;
  title: string;
  message: string;
  type: string;
  listingId?: string;
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      userEmail: params.userEmail,
      title: params.title,
      message: params.message,
      type: params.type,
      listingId: params.listingId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}
