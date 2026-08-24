"use client";

import { auth } from "../firebase";
import ProfileHeader from "./components/ProfileHeader";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import FeaturedAds from "./components/FeaturedAds";
import UpgradeCard from "./components/UpgradeCard";
import Favorites from "./components/Favorites";
import MyListings from "./components/MyListings";
import MessagePopup from "./components/MessagePopup";
import useProfile from "./hooks/useProfile";
import useChat from "./hooks/useChat";
import QuickActions from "./components/QuickActions";
import RewardsCard from "./components/RewardsCard";
import MobileHeader from "./components/MobileHeader";
import ChatPanel from "./components/ChatPanel";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import MobileBottomNav from "../components/MobileBottomNav";


export default function ProfilePage() {
  const router = useRouter();
  const {
  loading,
  user,
  userData,
  myAds,
  favoriteAds,
  removeFavorite,
  deleteListing,
  requestProSeller,
} = useProfile();

  const [menuOpen,
    setMenuOpen] =
    useState(false);
  const featuredAdsUsed =
    myAds.filter(
      (ad) =>
        ad.featured ===
        true
    ).length;
  

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

 
const favoritesRef = useRef<HTMLDivElement>(null);
const settingsRef = useRef<HTMLDivElement>(null);
  
  const featuredAdsRemaining =
    (userData?.featuredCredits ||
      0) -
    featuredAdsUsed;

   
  const handleLogout =
    async () => {
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
      <div className="p-10 text-center text-xl text-white">
        Please login first
      </div>
    );
  }
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

const userCurrency =
  currencyMap[userData?.country] || "";

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
    onDashboard={() => router.push("/profile")}
    onMyListings={() => router.push("/")}
    onAddListing={() => router.push("/add-listing")}
    onMessages={() => {
      if (chatRooms.length > 0) {
        openChat(chatRooms[0]);
      } else {
        setShowMessages(true);
      }
    }}
    onFavorites={() => {
      favoritesRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    onRewards={() => router.push("/rewards")}
    onSettings={() => router.push("/profile/settings")}
    onLogout={handleLogout}
  />

</div>

<div className="lg:hidden">
  <Sidebar
    menuOpen={menuOpen}
    unreadCount={unreadCount}
    userMembership={userData?.membership}
    onDashboard={() => router.push("/profile")}
    onMyListings={() => router.push("/")}
    onAddListing={() => router.push("/add-listing")}
    onMessages={() => {
      if (chatRooms.length > 0) {
        openChat(chatRooms[0]);
      } else {
        setShowMessages(true);
      }
    }}
    onFavorites={() => {
      favoritesRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    onRewards={() => router.push("/rewards")}
    onSettings={() => router.push("/profile/settings")}
    onLogout={handleLogout}
    onClose={() => setMenuOpen(false)}
  />
</div>


{/* Main */}
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

       <FeaturedAds
  myAds={myAds}
  featuredAdsUsed={featuredAdsUsed}
  featuredAdsRemaining={featuredAdsRemaining}
  featuredCredits={userData?.featuredCredits || 0}
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
  totalAds={myAds.length}
  featuredUsed={featuredAdsUsed}
  featuredCredits={userData?.featuredCredits || 0}
  favorites={favoriteAds.length}
  unreadMessages={unreadCount}
/>

<RewardsCard userId={user.uid} />
        
<QuickActions
  onAddListing={() => router.push("/add-listing")}
  onHome={() => router.push("/")}
/>
    
       
       <UpgradeCard
  membership={userData?.membership}
  proRequest={userData?.proRequest}
  onRequestPro={requestProSeller}
/>

  <div ref={favoritesRef}>
  <Favorites
    favoriteAds={favoriteAds}
    currencyMap={currencyMap}
    onRemove={removeFavorite}
  />
</div>


<MyListings
  myAds={myAds}
  userCurrency={userCurrency}
  onEdit={(id) => router.push(`/edit/${id}`)}
  onDelete={deleteListing}
/>

<div ref={settingsRef} className="mt-8">
  <div className="bg-[#111827] rounded-2xl p-6 border border-white/10">
    <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>

    <div className="space-y-3 text-gray-300">
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Country:</strong> {userData?.country || "-"}</p>
      <p><strong>Membership:</strong> {userData?.membership || "Free"}</p>
    </div>

    <button
      onClick={handleLogout}
      className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl"
    >
      Logout
    </button>
  </div>
</div>
   
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