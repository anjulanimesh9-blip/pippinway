"use client";

import { auth } from "@/app/firebase";

import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";

import { useChat } from "./hooks/useChat";

export default function ChatPage() {
  const {
    loading,
    conversations,
    selectedChat,
    setSelectedChat,
    messages,
    sendMessage,
  } = useChat();

  const currentUserEmail = auth.currentUser?.email ?? "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020817] flex">
      {/* Left Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedChat={selectedChat}
        onSelect={setSelectedChat}
      />

      {/* Right Side */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatWindow
              messages={messages}
              currentUserEmail={currentUserEmail}
            />

            <MessageInput
              onSend={sendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}