import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

type MessagePopupProps = {
  popupChat: any;
  showPopup: boolean;
  user: any;
  onOpenChat: (chat: any) => void;
  onClose: () => void;
};

export default function MessagePopup({
  popupChat,
  showPopup,
  user,
  onOpenChat,
  onClose,
}: MessagePopupProps) {
  if (!popupChat || !showPopup) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[320px] bg-[#111827] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">

      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold">🔔 1 New Message</p>

          <p className="text-xs opacity-80">
            {popupChat.buyerEmail === user?.email
              ? popupChat.sellerEmail
              : popupChat.buyerEmail}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xl"
        >
          ×
        </button>
      </div>

      <div className="p-4">

        <p className="text-sm text-gray-300 mb-3">
          {popupChat.lastMessage}
        </p>

        <button
          onClick={async () => {
            await updateDoc(
              doc(db, "chats", popupChat.id),
              {
                [`readBy.${user.uid}`]: true,
              }
            );

            onOpenChat(popupChat);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-full font-semibold"
        >
          Open Chat
        </button>

      </div>
    </div>
  );
}