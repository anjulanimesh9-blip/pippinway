"use client";

type Message = {
  id: string;
  text: string;
  sender: string;
};

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
  messages: Message[];
  currentUserEmail?: string | null;
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
};

export default function ChatModal({
  open,
  onClose,
  messages,
  currentUserEmail,
  message,
  setMessage,
  onSend,
}: ChatModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end justify-end p-5">
      <div className="w-[380px] h-[550px] bg-[#0f172a] border border-white/10 rounded-[30px] shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111827]">
          <h2 className="text-lg font-bold text-white">
            💬 Chat Seller
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b1120]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] p-3 rounded-[20px] ${
                msg.sender === currentUserEmail
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-[#111827] flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
            className="flex-1 bg-[#0f172a] border border-white/10 rounded-[18px] px-4 py-3 text-white outline-none"
          />

          <button
            onClick={onSend}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 rounded-[18px] font-semibold"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}