"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useProfile from "../hooks/useProfile";
import useChat from "../hooks/useChat";
import { getListingStatus } from "../utils";
import ProfileShell from "../components/ProfileShell";
import ProfileHeroBanner from "../components/ProfileHeroBanner";
import ProfileHeader from "../components/ProfileHeader";
import StatsCards from "../components/StatsCards";
import MyListings from "../components/MyListings";
import type { ProfileNavKey } from "../components/Sidebar";

export default function ProfileListingsPage() {
  const router = useRouter();
  const {
    loading,
    listingsLoading,
    listingsLoaded,
    user,
    userData,
    myAds,
    favoriteIds,
    adsCount,
    totalUsers,
    countsLoading,
    loadMyListings,
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

  useEffect(() => {
    void loadMyListings();
  }, [loadMyListings]);

  const displayName =
    userData?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const activeAds = myAds.filter((ad) => getListingStatus(ad) === "active").length;
  const soldAds = myAds.filter((ad) => getListingStatus(ad) === "sold").length;

  const handleNavigate = (key: ProfileNavKey) => {
    if (key === "dashboard" || key === "profile") {
      router.push("/profile");
      return;
    }
    if (key === "listings") {
      return;
    }
    if (key === "favorites") {
      router.push("/profile");
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
      activeItem="listings"
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
          activeAds={activeAds}
          soldAds={soldAds}
          favorites={favoriteIds.length}
          messages={chatRooms.length}
          isAdmin={userData?.role === "admin"}
          totalUsers={totalUsers}
          listingsLoaded={listingsLoaded}
          countsReady={!countsLoading || listingsLoaded}
        />

        <MyListings
          myAds={myAds}
          favoriteIds={favoriteIds}
          loading={listingsLoading}
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
      </div>
    </ProfileShell>
  );
}
