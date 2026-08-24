"use client";

import { auth } from "../firebase";
import ProfileHeader from "./components/ProfileHeader";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import UpgradeCard from "./components/UpgradeCard";
import MessagePopup from "./components/MessagePopup";
import useProfile from "./hooks/useProfile";
import useChat from "./hooks/useChat";
import RewardsCard from "./components/RewardsCard";
import MobileHeader from "./components/MobileHeader";
import ChatPanel from "./components/ChatPanel";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MobileBottomNav from "../components/MobileBottomNav";
import ProfileQuickActions from "./components/ProfileQuickActions";
import Favorites from "./components/Favorites";

export default function ProfilePage() {
  const router = useRouter();
  const {
    loading,
    userDataLoading,
    user,
    userData,
    adsCount,
    favoritesLoading,
    favoriteAds,
    loadFavorites,
    removeFavorite,
    requestProSeller,
  } = useProfile();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const {
    chatRooms,
    unreadCount,
    selectedChat,
    setSelectedChat,
    chatMessages,
    replyMessage,
    setReplyMessage,
    popupChat,
    showPopup,
    setShowPopup,
    setPopupChat,
    showMessages,
    setShowMessages,
    handleSendMessage,
    openChat,
    closeChat,
  } = useChat();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-xl text-white">Please login first</div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "🌅 Good Morning"
      : hour < 17
        ? "☀️ Good Afternoon"
        : "🌙 Good Evening";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020817] via-[#07142c] to-[#020817] text-white lg:flex">
      <div className="hidden lg:block">
        <Sidebar
          menuOpen={true}
          unreadCount={unreadCount}
          userMembership={userData?.membership}
          onAddListing={() => router.push("/add-listing")}
          onMessages={() => {
            if (chatRooms.length > 0) {
              openChat(chatRooms[0]);
            } else {
              setShowMessages(true);
            }
          }}
          onFavorites={() => {
            setShowFavorites(true);
            void loadFavorites();
          }}
          onSettings={() => router.push("/profile/settings")}
          onLogout={handleLogout}
        />
      </div>

      <div className="lg:hidden">
        <Sidebar
          menuOpen={menuOpen}
          unreadCount={unreadCount}
          userMembership={userData?.membership}
          onAddListing={() => router.push("/add-listing")}
          onMessages={() => {
            if (chatRooms.length > 0) {
              openChat(chatRooms[0]);
            } else {
              setShowMessages(true);
            }
          }}
          onFavorites={() => {
            setShowFavorites(true);
            void loadFavorites();
          }}
          onSettings={() => router.push("/profile/settings")}
          onLogout={handleLogout}
          onClose={() => setMenuOpen(false)}
        />
      </div>

      <div className="flex-1 w-full overflow-y-auto pb-24 lg:pb-8">
        <MobileHeader
          unreadCount={unreadCount}
          onMenu={() => setMenuOpen(true)}
          onMessages={() => {
            if (chatRooms.length > 0) {
              openChat(chatRooms[0]);
            } else {
              setShowMessages(true);
            }
          }}
        />
        <div className="px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-[1700px] space-y-8">
            <ProfileHeroBanner country={userData?.country} />

            <ProfileHeader
              greeting={greeting}
              userName={user?.email?.split("@")[0] || "User"}
              country={userData?.country}
              membership={userData?.membership}
              proExpiryDate={userData?.proExpiryDate}
            />

            <MessagePopup
              popupChat={popupChat}
              showPopup={showPopup}
              user={user}
              onClose={() => {
                setPopupChat(null);
                setShowPopup(false);
              }}
              onOpenChat={openChat}
            />

            <StatsCards
              totalAds={adsCount}
              featuredUsed={0}
              featuredCredits={userData?.featuredCredits || 0}
              favorites={0}
              unreadMessages={unreadCount}
              countsReady={!userDataLoading}
            />

            <ProfileQuickActions
              onMessages={() => {
                if (chatRooms.length > 0) {
                  openChat(chatRooms[0]);
                  return;
                }
                setShowMessages(true);
              }}
            />

            <RewardsCard userData={userData} loading={userDataLoading} />

            {showFavorites && (
              <Favorites
                favoriteAds={favoriteAds}
                currencyMap={{}}
                loading={favoritesLoading}
                onRemove={removeFavorite}
              />
            )}

            <UpgradeCard
              membership={userData?.membership}
              proRequest={userData?.proRequest}
              onRequestPro={requestProSeller}
            />
          </div>
        </div>
      </div>

      <ChatPanel
        showMessages={showMessages}
        chatRooms={chatRooms}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chatMessages={chatMessages}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        currentUserEmail={user?.email}
        onClose={closeChat}
        onSend={handleSendMessage}
      />

      <MobileBottomNav unreadCount={unreadCount} />
    </div>
  );
}
