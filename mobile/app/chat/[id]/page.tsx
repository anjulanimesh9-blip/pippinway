"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../firebase";

import {
  useParams,
} from "next/navigation";

export default function ChatPage() {
  const params =
    useParams();

  const listingId =
    params?.id as string;

  const currentUser =
    auth.currentUser;

  const [message, setMessage] =
    useState("");

const [messages, setMessages] =
  useState<any[]>([]);
  
  const [chatId, setChatId] =
    useState("");

  // Setup private chat ID
  useEffect(() => {
    const setupChat =
      async () => {
        if (
          !listingId ||
          !currentUser?.email
        )
          return;

        const listingRef =
          doc(
            db,
            "listings",
            listingId
          );

        const listingSnap =
          await getDoc(
            listingRef
          );

        if (
          !listingSnap.exists()
        )
          return;

        const sellerEmail =
  listingSnap.data()
    .ownerEmail ||
  listingSnap.data()
    .email ||
  listingSnap.data()
    .userEmail ||
  listingSnap.data()
    .postedBy;

        const buyerEmail =
          currentUser.email;

        const id = [
          buyerEmail,
          sellerEmail,
          listingId,
        ]
          .sort()
          .join("_");

        setChatId(id);
      };

    setupChat();
  }, [
    listingId,
    currentUser,
  ]);

  // Listen messages realtime
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          setMessages(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    return () =>
      unsubscribe();
  }, [chatId]);

  const sendMessage =
    async () => {
      if (
        !message.trim() ||
        !chatId
      )
        return;

      const listingRef =
        doc(
          db,
          "listings",
          listingId
        );

      const listingSnap =
        await getDoc(
          listingRef
        );

      if (
        !listingSnap.exists()
      )
        return;

      const sellerEmail =
  listingSnap.data()
    .ownerEmail ||
  listingSnap.data()
    .email ||
  listingSnap.data()
    .userEmail ||
  listingSnap.data()
    .postedBy;

      const buyerEmail =
        currentUser?.email;

      // Create chat document
      await setDoc(
        doc(
          db,
          "chats",
          chatId
        ),
        {
          buyerEmail,
          sellerEmail,
          listingId,
          lastMessage:
            message,
          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );

      // Save message
      await addDoc(
        collection(
          db,
          "chats",
          chatId,
          "messages"
        ),
        {
          text: message,
          sender:
            buyerEmail,
          createdAt:
            serverTimestamp(),
        }
      );

      setMessage("");
    };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto bg-[#0f172a] rounded-[30px] border border-white/10 p-5">

        <h1 className="text-3xl font-bold mb-6">
          💬 Chat Seller
        </h1>

        <div className="h-[500px] overflow-y-auto bg-[#111827] rounded-[24px] p-4 space-y-3">

          {messages.map(
            (msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] p-4 rounded-[22px] ${
                  msg.sender ===
                  currentUser?.email
                    ? "bg-blue-600 ml-auto text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <p>
                  {msg.text}
                </p>

                <p className="text-[10px] text-gray-300 mt-2">
                  {
                    msg.sender
                  }
                </p>
              </div>
            )
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            placeholder="Type message..."
            className="flex-1 bg-[#111827] border border-white/10 rounded-[20px] px-5 py-4 text-white outline-none"
          />

          <button
            onClick={
              sendMessage
            }
            className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 rounded-[20px] font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}