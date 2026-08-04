"use client";

import { useState } from "react";

interface ChatPanelProps {
  showMessages: boolean;
  chatRooms: any[];
  selectedChat: any;
  setSelectedChat: (chat: any) => void;
  chatMessages: any[];
  replyMessage: string;
  setReplyMessage: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
  currentUserEmail?: string | null;
}

export default function ChatPanel({
  showMessages,
  chatRooms,
  selectedChat,
  setSelectedChat,
  chatMessages,
  replyMessage,
  setReplyMessage,
  onClose,
  onSend,
  currentUserEmail,
}: ChatPanelProps) {
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  if (!showMessages) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020817] md:bg-black/60 md:flex">
      {/* Chat List */}
      <div
        className={`
          ${mobileChatOpen ? "hidden" : "block"}
          w-full md:block md:w-80
          bg-[#0B1220]
          border-r border-white/10
          overflow-y-auto
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">Messages</h2>

          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {chatRooms.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            No conversations yet.
          </div>
        )}

        {chatRooms.map((chat) => (
          <button
            key={chat.id}
            onClick={() => {
              setSelectedChat(chat);
              setMobileChatOpen(true);
            }}
            className={`w-full text-left p-4 border-b border-white/5 hover:bg-[#111827] ${
              selectedChat?.id === chat.id ? "bg-[#1f2937]" : ""
            }`}
          >
            <div className="font-semibold text-white">
              {chat.sellerEmail === currentUserEmail
                ? chat.buyerEmail
                : chat.sellerEmail}
            </div>

            <div className="text-sm text-gray-400 truncate">
              {chat.lastMessage}
            </div>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div
        className={`
          ${mobileChatOpen ? "flex" : "hidden"}
          md:flex
          flex-1
          flex-col
          bg-[#020817]
        `}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button
            className="md:hidden text-xl"
            onClick={() => setMobileChatOpen(false)}
          >
            ←
          </button>

          <h3 className="font-semibold text-white">
            {selectedChat
              ? selectedChat.sellerEmail === currentUserEmail
                ? selectedChat.buyerEmail
                : selectedChat.sellerEmail
              : "Select a conversation"}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-4 space-y-3">
          {selectedChat ? (
            chatMessages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === currentUserEmail
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    msg.sender === currentUserEmail
                      ? "bg-green-600"
                      : "bg-[#1f2937]"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a conversation
            </div>
          )}
        </div>

       {selectedChat && (
  <div
    className="
      fixed bottom-0 left-0 right-0
      md:static
      bg-[#020817]
      border-t border-white/10
      p-4
      flex gap-2
      z-50
    "
  >
    <input
      value={replyMessage}
      onChange={(e) => setReplyMessage(e.target.value)}
      placeholder="Type a message..."
      className="flex-1 rounded-xl bg-[#111827] px-4 py-3 outline-none text-white"
    />

    <button
      onClick={onSend}
      className="bg-green-600 hover:bg-green-700 px-6 rounded-xl text-white"
    >
      Send
    </button>
  </div>
)}
      </div>
    </div>
  );
}