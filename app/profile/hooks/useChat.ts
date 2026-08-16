"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "../../firebase";
import { subscribeUserChats } from "@/lib/subscribeUserChats";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function useChat() {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState("");

  const [popupChat, setPopupChat] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [showMessages, setShowMessages] = useState(false);

  const [lastMessageId, setLastMessageId] = useState("");

  const unreadCount = chatRooms.filter(
    (chat: any) =>
      chat.lastSender !== user?.email &&
      !(user?.uid && chat.readBy?.[user.uid])
  ).length;

  // ===========================
  // Chat Rooms
  // ===========================

  useEffect(() => {
    if (!user?.email) {
      setChatRooms([]);
      return;
    }

    const unsub = subscribeUserChats(user.email, (chats) => {
      setChatRooms(chats);

      const latestUnread = chats.find(
        (chat) =>
          chat.lastSender !== user.email &&
          !(user.uid && chat.readBy?.[user.uid])
      );

      if (
        latestUnread &&
        latestUnread.lastMessage &&
        latestUnread.lastMessage !== lastMessageId
      ) {
        setPopupChat(latestUnread);
        setLastMessageId(latestUnread.lastMessage);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
      }
    });

    return unsub;
  }, [user?.email, user?.uid, lastMessageId]);

  // ===========================
  // Mark Read
  // ===========================

  useEffect(() => {
    if (!selectedChat || !user?.uid) return;

    updateDoc(doc(db, "chats", selectedChat.id), {
      [`readBy.${user.uid}`]: true,
    }).catch(console.error);
  }, [selectedChat, user?.uid]);

  // ===========================
  // Messages
  // ===========================

  useEffect(() => {
    if (!selectedChat?.id) {
      setChatMessages([]);
      return;
    }

    console.log("Selected Chat:", selectedChat.id);

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "Messages Found:",
          snapshot.docs.length
        );

        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        console.log(msgs);

        setChatMessages(msgs);

        if (user?.uid) {
          updateDoc(doc(db, "chats", selectedChat.id), {
            [`readBy.${user.uid}`]: true,
          }).catch(console.error);
        }
      },
      (error) => {
        console.error("Messages Error:", error);
      }
    );

    return unsub;
  }, [selectedChat?.id, user?.uid]);

  // ===========================
  // Send Message
  // ===========================

  const handleSendMessage = async () => {
    if (!replyMessage.trim()) return;
    if (!selectedChat) return;
    if (!user) return;

    try {
      await addDoc(
        collection(
          db,
          "chats",
          selectedChat.id,
          "messages"
        ),
        {
          sender: user.email,
          message: replyMessage,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "chats", selectedChat.id),
        {
          lastMessage: replyMessage,
          lastSender: user.email,
          updatedAt: serverTimestamp(),
          [`readBy.${user.uid}`]: true,
        }
      );

      setReplyMessage("");
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  // ===========================
  // Helpers
  // ===========================

  const openChat = (chat: any) => {
    console.log("Opening Chat:", chat.id);

    setSelectedChat(chat);
    setShowMessages(true);
    setShowPopup(false);
  };

  const closeChat = () => {
    setShowMessages(false);
    setSelectedChat(null);
    setChatMessages([]);
  };

  return {
    chatRooms,
    unreadCount,

    selectedChat,
    setSelectedChat,

    chatMessages,

    replyMessage,
    setReplyMessage,

    popupChat,
    showPopup,
    setShowPopup,
    setPopupChat,

    showMessages,
    setShowMessages,

    handleSendMessage,

    openChat,
    closeChat,
  };
}