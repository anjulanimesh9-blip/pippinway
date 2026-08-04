"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
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
  const user = auth.currentUser;

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
    if (!user?.email) return;

    const q = query(
      collection(db, "chats"),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter(
            (chat: any) =>
              chat.sellerEmail === user.email ||
              chat.buyerEmail === user.email
          );

        console.log("Chat Rooms:", chats);

        setChatRooms(chats);

        const latestUnread = chats.find(
          (chat: any) =>
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

          setTimeout(() => {
            setShowPopup(false);
          }, 5000);
        }
      },
      (error) => {
        console.error("Chat Room Error:", error);
      }
    );

    return unsub;
  }, [user?.uid, lastMessageId]);

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