"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  auth,
  db,
} from "../firebase";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function MessagesPage() {
  const [chats, setChats] =
    useState<any[]>([]);

  const currentUser =
    auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(
        db,
        "chats"
      ),
      orderBy(
        "updatedAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const chatData =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(
                (chat: any) =>
                  chat.buyerEmail ===
                    currentUser?.email ||
                  chat.sellerEmail ===
                    currentUser?.email
              );

          setChats(
            chatData
          );
        }
      );

    return () =>
      unsubscribe();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          💬 Messages
        </h1>

        {chats.length ===
        0 ? (
          <p className="text-gray-400">
            No messages yet
          </p>
        ) : (
          <div className="space-y-4">
            {chats.map(
              (chat) => (
                <Link
                  key={
                    chat.id
                  }
                  href={`/chat/${chat.listingId}`}
                  className="block bg-[#111827] border border-white/10 rounded-[24px] p-5 hover:border-purple-500 transition"
                >
                  <p className="text-sm text-gray-400">
                    Listing
                  </p>

                  <p className="font-bold text-lg">
                    {
                      chat.listingId
                    }
                  </p>

                  <p className="text-gray-300 mt-2">
                    {
                      chat.lastMessage
                    }
                  </p>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}