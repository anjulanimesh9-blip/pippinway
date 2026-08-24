"use client";

import { auth } from "../../firebase";
import ProfileHeader from "../components/ProfileHeader";
import ProfileHeroBanner from "../components/ProfileHeroBanner";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import MyListings from "../components/MyListings";
import MessagePopup from "../components/MessagePopup";
import useProfile from "../hooks/useProfile";
import useChat from "../hooks/useChat";
import MobileHeader from "../components/MobileHeader";
import ChatPanel from "../components/ChatPanel";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileBottomNav from "../../components/MobileBottomNav";

const currencyMap: Record<string, string> = {
  "Sri Lanka": "LKR",
  Zimbabwe: "USD",
  USA: "USD",
  Canada: "CAD",
  "United Kingdom": "GBP",
  India: "INR",
  Thailand: "THB",
  Singapore: "SGD",
  Maldives: "MVR",
  "South Africa": "ZAR",
};

export default function ProfileListingsPage() {
  const router = useRouter();
  const {
    loading,
    listingsLoading,
    user,
    userData,
    myAds,
    adsCount,
    loadMyListings,
    deleteListing,
  } = useProfile();

  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    void loadMyListings();
  }, [loadMyListings]);

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

  const userCurrency = currencyMap[userData?.country] || "";
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
          onFavorites={() => router.push("/profile")}
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
          onFavorites={() => router.push("/profile")}
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
              featuredUsed={myAds.filter((ad) => ad.featured === true).length}
              featuredCredits={userData?.featuredCredits || 0}
              favorites={0}
              unreadMessages={unreadCount}
              countsReady={!userDataLoading}
            />

            <MyListings
              myAds={myAds}
              userCurrency={userCurrency}
              loading={listingsLoading}
              onEdit={(id) => router.push(`/edit/${id}`)}
              onDelete={deleteListing}
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
