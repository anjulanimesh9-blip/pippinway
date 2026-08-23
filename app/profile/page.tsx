"use client";

import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import useProfile from "./hooks/useProfile";
import useChat from "./hooks/useChat";
import { computeSellerScore, getListingStatus } from "./utils";

import Sidebar, { type ProfileNavKey } from "./components/Sidebar";
import ProfileTopBar from "./components/ProfileTopBar";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import ProfileHeader from "./components/ProfileHeader";
import StatsCards from "./components/StatsCards";
import RewardsCard from "./components/RewardsCard";
import ProfileTabs, { type ProfileTabKey } from "./components/ProfileTabs";
import MyListings from "./components/MyListings";
import Favorites from "./components/Favorites";
import ProfileRightPanel from "./components/ProfileRightPanel";
import ProfileFooter from "./components/ProfileFooter";
import MessagePopup from "./components/MessagePopup";
import ChatPanel from "./components/ChatPanel";
import MobileBottomNav from "../components/MobileBottomNav";
import {
  AboutPanel,
  ActivityPanel,
  ReviewsPanel,
  SavedSearchesPanel,
} from "./components/ProfileTabPanels";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;

  const {
    loading,
    userData,
    myAds,
    favoriteAds,
    totalUsers,
    removeFavorite,
    addFavorite,
    deleteListing,
    requestProSeller,
  } = useProfile();

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProfileNavKey>("listings");
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("listings");
  const [aboutText, setAboutText] = useState<string | undefined>(undefined);

  const displayName =
    userData?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const about = aboutText ?? userData?.about ?? userData?.bio ?? "";

  const activeAds = myAds.filter((ad) => getListingStatus(ad) === "active").length;
  const soldAds = myAds.filter((ad) => getListingStatus(ad) === "sold").length;
  const favoriteIds = favoriteAds.map((ad) => ad.id);

  const score = useMemo(
    () =>
      computeSellerScore({
        displayName: userData?.displayName,
        profileImage: userData?.profileImage,
        country: userData?.country,
        phone: userData?.phone,
        membership: userData?.membership,
        verifiedSeller: userData?.verifiedSeller,
        totalAds: myAds.length,
        activeAds,
        repliedChats: chatRooms.filter((chat: any) => chat.lastSender === user?.email)
          .length,
        totalChats: chatRooms.length,
      }),
    [userData, myAds.length, activeAds, chatRooms, user?.email]
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleNavigate = (key: ProfileNavKey) => {
    setActiveItem(key);

    if (key === "dashboard" || key === "profile") {
      setActiveTab("listings");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (key === "listings") {
      setActiveTab("listings");
      document.getElementById("my-listings")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (key === "favorites") {
      setActiveTab("favorites");
      return;
    }

    if (key === "messages") {
      if (chatRooms.length > 0) {
        openChat(chatRooms[0]);
      } else {
        setShowMessages(true);
      }
      return;
    }

    if (key === "credits") {
      router.push("/featured-ads");
      return;
    }

    if (key === "payments" || key === "transactions" || key === "packages") {
      router.push("/featured-packages");
      return;
    }

    if (key === "settings") {
      router.push("/profile/settings");
      return;
    }

    if (key === "help") {
      window.open(
        "https://www.facebook.com/profile.php?id=61589186823471",
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] p-10 text-center text-xl text-white">
        Please login first
      </div>
    );
  }

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
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRequestPro={requestProSeller}
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
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRequestPro={requestProSeller}
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
          <div className="mx-auto w-full max-w-[1600px] space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 lg:px-6">
            <ProfileHeroBanner country={userData?.country} />

            <ProfileHeader
              userName={displayName}
              email={user.email}
              country={userData?.country}
              membership={userData?.membership}
              verifiedSeller={userData?.verifiedSeller}
              profileImage={userData?.profileImage}
              featuredCredits={userData?.featuredCredits || 0}
              memberSince={userData?.membershipStart || userData?.createdAt}
              accountCreatedAt={user.metadata?.creationTime}
            />

            <StatsCards
              totalAds={myAds.length}
              activeAds={activeAds}
              soldAds={soldAds}
              favorites={favoriteAds.length}
              messages={chatRooms.length}
              isAdmin={userData?.role === "admin"}
              totalUsers={totalUsers}
            />

            <RewardsCard userId={user.uid} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <ProfileTabs
                  activeTab={activeTab}
                  onChange={(tab) => {
                    setActiveTab(tab);
                    setActiveItem(tab === "listings" ? "listings" : "profile");
                  }}
                />

                {activeTab === "listings" && (
                  <MyListings
                    myAds={myAds}
                    favoriteIds={favoriteIds}
                    onEdit={(id) => router.push(`/edit/${id}`)}
                    onDelete={deleteListing}
                    onToggleFavorite={(id) => {
                      if (favoriteIds.includes(id)) {
                        removeFavorite(id);
                        return;
                      }
                      const ad = myAds.find((item) => item.id === id);
                      if (ad) addFavorite(ad);
                    }}
                  />
                )}

                {activeTab === "favorites" && (
                  <Favorites
                    favoriteAds={favoriteAds}
                    onRemove={removeFavorite}
                  />
                )}

                {activeTab === "about" && (
                  <AboutPanel
                    about={about}
                    country={userData?.country}
                    displayName={displayName}
                    onEdit={() =>
                      document
                        .getElementById("profile-about")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  />
                )}

                {activeTab === "reviews" && <ReviewsPanel />}

                {activeTab === "saved" && <SavedSearchesPanel />}

                {activeTab === "activity" && <ActivityPanel ads={myAds} />}
              </div>

              <div className="xl:sticky xl:top-20 xl:self-start">
                <ProfileRightPanel
                  userId={user.uid}
                  about={about}
                  score={score}
                  onAboutSaved={setAboutText}
                />
              </div>
            </div>
          </div>

          <ProfileFooter />
        </div>
      </div>

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

      <ChatPanel
        showMessages={showMessages}
        chatRooms={chatRooms}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chatMessages={chatMessages}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        currentUserEmail={user.email}
        onClose={closeChat}
        onSend={handleSendMessage}
      />

      <MobileBottomNav unreadCount={unreadCount} />
    </div>
  );
}
