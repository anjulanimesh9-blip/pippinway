"use client";

interface Conversation {
  id: string;
  buyerEmail: string;
  sellerEmail: string;
  listingId: string;
  lastMessage: string;

  sellerName?: string;
  listingTitle?: string;
  listingImage?: string;
}

interface Props {
  conversations: Conversation[];
  selectedChat: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedChat,
  onSelect,
}: Props) {
  return (
    <div className="w-full md:w-80 bg-[#0F172A] border-r border-slate-700 overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">
          Inbox
        </h2>
      </div>

      {/* Empty */}
      {conversations.length === 0 && (
        <p className="text-slate-400 p-5">
          No conversations yet.
        </p>
      )}

      {/* Conversation List */}
      {conversations.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat.id)}
          className={`w-full text-left p-4 border-b border-slate-800 transition hover:bg-slate-800 ${
            selectedChat === chat.id
              ? "bg-slate-800"
              : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Listing Image */}
            <img
              src={chat.listingImage || "/placeholder.png"}
              alt="Listing"
              className="w-14 h-14 rounded-lg object-cover bg-slate-700"
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {chat.sellerName || chat.sellerEmail}
              </h3>

              <p className="text-sm text-slate-300 truncate">
                {chat.listingTitle || "Listing"}
              </p>

              <p className="text-xs text-slate-400 truncate mt-1">
                {chat.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}