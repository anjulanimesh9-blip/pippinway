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

export interface Conversation {
  id: string;
  buyerEmail: string;
  sellerEmail: string;
  listingId: string;
  lastMessage: string;
  updatedAt?: any;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt?: any;
}

export function useChat() {
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  // Load conversations
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Conversation, "id">),
        }))
        .filter(
          (chat) =>
            chat.buyerEmail === currentUser.email ||
            chat.sellerEmail === currentUser.email
        );

      setConversations(chats);

      if (!selectedChat && chats.length > 0) {
        setSelectedChat(chats[0].id);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Load messages of selected conversation
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats", selectedChat, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));

      setMessages(data);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Send message
  const sendMessage = async (text: string) => {
    if (!selectedChat) return;

    const currentUser = auth.currentUser;

    if (!currentUser?.email) return;

    await setDoc(
      doc(db, "chats", selectedChat),
      {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(
      collection(db, "chats", selectedChat, "messages"),
      {
        text,
        sender: currentUser.email,
        createdAt: serverTimestamp(),
      }
    );
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