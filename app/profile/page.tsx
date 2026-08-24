"use client";

import { useRouter } from "next/navigation";
import useProfile from "./hooks/useProfile";
import useChat from "./hooks/useChat";
import { computeSellerScore } from "./utils";
import ProfileShell from "./components/ProfileShell";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import ProfileHeader from "./components/ProfileHeader";
import StatsCards from "./components/StatsCards";
import RewardsCard from "./components/RewardsCard";
import ProfileQuickActions from "./components/ProfileQuickActions";
import ProfileRightPanel from "./components/ProfileRightPanel";
import { AboutPanel } from "./components/ProfileTabPanels";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfileNavKey } from "./components/Sidebar";

const Favorites = dynamic(() => import("./components/Favorites"));

export default function ProfilePage() {
  const router = useRouter();
  const {
    loading,
    userDataLoading,
    user,
    userData,
    adsCount,
    totalUsers,
    countsLoading,
    favoritesLoading,
    favoriteAds,
    loadFavorites,
    removeFavorite,
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

  const [aboutText, setAboutText] = useState<string | undefined>(undefined);
  const [showFavorites, setShowFavorites] = useState(false);

  const displayName =
    userData?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const about = aboutText ?? userData?.about ?? userData?.bio ?? "";

  const score = useMemo(
    () =>
      computeSellerScore({
        displayName: userData?.displayName,
        profileImage: userData?.profileImage,
        country: userData?.country,
        phone: userData?.phone,
        membership: userData?.membership,
        verifiedSeller: userData?.verifiedSeller,
        totalAds: adsCount,
        activeAds: 0,
        repliedChats: chatRooms.filter((chat: any) => chat.lastSender === user?.email)
          .length,
        totalChats: chatRooms.length,
      }),
    [userData, adsCount, chatRooms, user?.email]
  );

  const handleNavigate = (key: ProfileNavKey) => {
    if (key === "dashboard" || key === "profile") {
      router.push("/profile");
      return;
    }
    if (key === "listings") {
      router.push("/profile/listings");
      return;
    }
    if (key === "favorites") {
      setShowFavorites(true);
      void loadFavorites();
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
    <ProfileShell
      user={user}
      userData={userData}
      displayName={displayName}
      unreadCount={unreadCount}
      activeItem="profile"
      onNavigate={handleNavigate}
      onRequestPro={requestProSeller}
      chat={{
        chatRooms,
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
        handleSendMessage,
        openChat,
        closeChat,
      }}
    >
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
          totalAds={adsCount}
          activeAds={0}
          soldAds={null}
          favorites={null}
          messages={chatRooms.length}
          isAdmin={userData?.role === "admin"}
          totalUsers={totalUsers}
          listingsLoaded={false}
          countsReady={!countsLoading}
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
            loading={favoritesLoading}
            onRemove={removeFavorite}
          />
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
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
    </ProfileShell>
  );
}
