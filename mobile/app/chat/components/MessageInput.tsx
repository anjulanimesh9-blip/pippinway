"use client";

import { useState, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => Promise<void> | void;
}

export default function MessageInput({
  onSend,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const send = async () => {
    const text = message.trim();

    if (!text) return;

    await onSend(text);

    setMessage("");
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t border-slate-700 bg-[#0F172A] p-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-[#111827] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <button
          onClick={send}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}