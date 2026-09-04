"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "../firebase";
import { subscribeUserChats, type ChatDoc } from "@/lib/subscribeUserChats";
import { useI18n } from "@/lib/i18n";

export default function MessagesPage() {
  const { t } = useI18n();
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser?.email) return;

    const unsubscribe = subscribeUserChats(
      currentUser.email,
      setChats,
      (err) => console.error("Chat Room Error:", err)
    );

    return unsubscribe;
  }, [currentUser?.email]);

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">💬 {t("chat.messages")}</h1>

        {chats.length === 0 ? (
          <p className="text-gray-400">{t("chat.noMessagesYet")}</p>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.listingId}`}
                className="block bg-[#111827] border border-white/10 rounded-[24px] p-5 hover:border-purple-500 transition"
              >
                <p className="text-sm text-gray-400">{t("chat.listing")}</p>
                <p className="font-bold text-lg">{chat.listingId}</p>
                <p className="text-gray-300 mt-2">{chat.lastMessage}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
