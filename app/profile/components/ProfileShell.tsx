"use client";

import { ReactNode, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import Sidebar, { type ProfileNavKey } from "./Sidebar";
import ProfileTopBar from "./ProfileTopBar";
import ProfileFooter from "./ProfileFooter";
import MessagePopup from "./MessagePopup";
import ChatPanel from "./ChatPanel";
import MobileBottomNav from "../../components/MobileBottomNav";

type ProfileShellProps = {
  user: { uid: string; email: string | null };
  userData: any;
  displayName: string;
  unreadCount: number;
  activeItem: ProfileNavKey;
  onNavigate: (key: ProfileNavKey) => void;
  onRequestPro: () => void;
  children: ReactNode;
  chat: {
    chatRooms: any[];
    selectedChat: any;
    setSelectedChat: (chat: any) => void;
    chatMessages: any[];
    replyMessage: string;
    setReplyMessage: (value: string) => void;
    popupChat: any;
    showPopup: boolean;
    setShowPopup: (value: boolean) => void;
    setPopupChat: (chat: any) => void;
    showMessages: boolean;
    handleSendMessage: () => void;
    openChat: (chat: any) => void;
    closeChat: () => void;
  };
};

export default function ProfileShell({
  user,
  userData,
  displayName,
  unreadCount,
  activeItem,
  onNavigate,
  onRequestPro,
  children,
  chat,
}: ProfileShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden h-screen shrink-0 lg:block">
        <Sidebar
          menuOpen
          unreadCount={unreadCount}
          activeItem={activeItem}
          userMembership={userData?.membership}
          isAdmin={userData?.role === "admin"}
          proRequest={userData?.proRequest}
          onNavigate={onNavigate}
          onLogout={handleLogout}
          onRequestPro={onRequestPro}
        />
      </div>

      <div className="lg:hidden">
        <Sidebar
          menuOpen={menuOpen}
          unreadCount={unreadCount}
          activeItem={activeItem}
          userMembership={userData?.membership}
          isAdmin={userData?.role === "admin"}
          proRequest={userData?.proRequest}
          onNavigate={onNavigate}
          onLogout={handleLogout}
          onRequestPro={onRequestPro}
          onClose={() => setMenuOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <ProfileTopBar
          userName={displayName}
          profileImage={userData?.profileImage}
          onMenu={() => setMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
          <ProfileFooter />
        </div>
      </div>

      <MessagePopup
        popupChat={chat.popupChat}
        showPopup={chat.showPopup}
        user={user}
        onClose={() => {
          chat.setPopupChat(null);
          chat.setShowPopup(false);
        }}
        onOpenChat={chat.openChat}
      />

      <ChatPanel
        showMessages={chat.showMessages}
        chatRooms={chat.chatRooms}
        selectedChat={chat.selectedChat}
        setSelectedChat={chat.setSelectedChat}
        chatMessages={chat.chatMessages}
        replyMessage={chat.replyMessage}
        setReplyMessage={chat.setReplyMessage}
        currentUserEmail={user.email}
        onClose={chat.closeChat}
        onSend={chat.handleSendMessage}
      />

      <MobileBottomNav unreadCount={unreadCount} />
    </div>
  );
}
