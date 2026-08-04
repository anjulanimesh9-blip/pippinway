"use client";

import { useEffect, useRef } from "react";

interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt?: any;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserEmail: string;
}

export default function ChatWindow({
  messages,
  currentUserEmail,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#111827]">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <h2 className="text-xl font-bold text-white">
          Conversation
        </h2>

        <p className="text-sm text-slate-400">
          Real-time chat
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">
              No messages yet.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.sender === currentUserEmail
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-slate-700 text-white"
              }`}
            >
              <p>{msg.text}</p>

              {msg.createdAt?.toDate && (
                <p className="text-[11px] opacity-70 mt-2">
                  {msg.createdAt
                    .toDate()
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              )}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}