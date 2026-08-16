"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/app/firebase";
import { subscribeUserChats } from "@/lib/subscribeUserChats";

export interface Conversation {
  id: string;
  buyerEmail: string;
  sellerEmail: string;
  listingId: string;
  lastMessage: string;
  updatedAt?: unknown;
}

export interface Message {
  id: string;
  text?: string;
  message?: string;
  sender: string;
  createdAt?: unknown;
}

export function useChat() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeUserChats(
      currentUser.email,
      (chats) => {
        setConversations(chats as Conversation[]);
        if (!selectedChat && chats.length > 0) {
          setSelectedChat(chats[0].id);
        }
        setLoading(false);
      },
      () => {
        setConversations([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats", selectedChat, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Message, "id">),
          }))
        );
      },
      (err) => {
        console.error("Messages Error:", err);
      }
    );

    return unsubscribe;
  }, [selectedChat]);

  const sendMessage = async (text: string) => {
    if (!selectedChat) return;

    const currentUser = auth.currentUser;
    if (!currentUser?.email) return;

    await setDoc(
      doc(db, "chats", selectedChat),
      {
        lastMessage: text,
        lastSender: currentUser.email,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", selectedChat, "messages"), {
      text,
      sender: currentUser.email,
      createdAt: serverTimestamp(),
    });
  };

  return {
    loading,
    conversations,
    selectedChat,
    setSelectedChat,
    messages,
    sendMessage,
  };
}
