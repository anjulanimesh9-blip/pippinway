"use client";

import Link from "next/link";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import useNotifications from "../hooks/useNotifications";
import {
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { GuestAuthLink, useGuestAuthPrompt } from "./GuestAuthPrompt";
import useCountryNavigation from "../hooks/useCountryNavigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);
    const [user, setUser] =
  useState<any>(null);

const [showNotifications, setShowNotifications] = useState(false);

  const router =
    useRouter();
  const { requireAuth } = useGuestAuthPrompt();
  const { marketplaceHome, addListingHref } = useCountryNavigation();
  const { t } = useI18n();

    const {
  notifications,
  unreadCount,
} = useNotifications();

  const menuRef =
    useRef<HTMLDivElement>(
      null
    );

useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (
        currentUser
      ) => {
        if (
          !currentUser
        ) {
          setUser(null);
          return;
        }

        try {
          await currentUser.reload();
        } catch {
          // Keep the signed-in session if reload fails in the WebView.
        }

        setUser(
          currentUser
        );
      }
    );

  return () =>
    unsubscribe();
}, []);
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020817]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:py-4">

        {/* Logo */}
       <Link

  href="/"
  className="flex items-center gap-2"
>
  <Image
    src="/images/logo.png"
    alt="Pippinway Logo"
    width={90}
    height={90}
    className="h-10 w-auto shrink-0 object-contain md:h-[90px]"
    priority
  />

 <div className="hidden min-w-0 flex-col leading-tight md:flex">
  <span className="text-xl md:text-2xl font-bold text-white">
    pippinway.com
  </span>
</div>
  </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-white font-medium items-center">
  <Link href={marketplaceHome}>
    {t("nav.home")}
  </Link>
  <Link href="/about">
    {t("nav.about")}
  </Link>
  <Link href="/safety">
    {t("nav.safety")}
  </Link>
  <Link href="/contact">
    {t("nav.contact")}
  </Link>

  <GuestAuthLink href={addListingHref}>
    {t("nav.addListing")}
  </GuestAuthLink>
  <LanguageSwitcher compact />
  <a
  href="https://www.facebook.com/profile.php?id=61589186823471"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 hover:text-blue-400 transition"
>
  📘 {t("nav.facebook")}
</a>
  {user ? (
    <>
    <div className="relative">

  <button
    onClick={() =>
      setShowNotifications((v) => !v)
    }
    className="relative rounded-full p-2 transition hover:bg-white/10"
  >
    <FaBell className="text-xl text-white" />

    {unreadCount > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
        {unreadCount}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl">

      <div className="border-b border-white/10 p-4 font-bold">
        {t("notifications.title")}
      </div>

     <div className="divide-y divide-white/5">

  {notifications.length === 0 ? (
    <div className="p-6 text-center text-sm text-gray-400">
      {t("notifications.none")}
    </div>
  ) : (
    notifications.slice(0, 5).map((item) => (
      <div
        key={item.id}
        className="cursor-pointer p-4 transition hover:bg-white/5"
      >
        <p className="font-semibold text-white">
          {item.title}
        </p>

        <p className="mt-1 text-sm text-gray-400">
          {item.message}
        </p>
      </div>
    ))
  )}

</div>

     <div className="flex border-t border-white/10">

  <button
    onClick={() => setShowNotifications(false)}
    className="flex-1 p-3 text-sm text-gray-300 hover:bg-white/5"
  >
    {t("common.close")}
  </button>

  <button
    onClick={() => {
      setShowNotifications(false);
      router.push("/notifications");
    }}
    className="flex-1 border-l border-white/10 p-3 text-sm text-cyan-400 hover:bg-white/5"
  >
    {t("notifications.viewAll")}
  </button>

</div>

    </div>
  )}

</div>

      <GuestAuthLink href="/profile">
        {t("nav.profile")}
      </GuestAuthLink>

      <button
        onClick={() =>
          signOut(auth)
        }
        className="hover:text-red-400 transition"
      >
        {t("nav.logout")}
      </button>
    </>
  ) : (
    <>
      <Link href="/login">
        {t("nav.login")}
      </Link>

      <Link href="/register">
        {t("nav.register")}
      </Link>
    </>
  )}
</div>

        {/* Mobile Menu Button */}
        <button
          className="text-2xl leading-none text-white md:hidden"
          aria-label={t("auth.openMenu")}
          onClick={() =>
            setMenuOpen(
              (prev) =>
                !prev
            )
          }
        >
          ☰
        </button>
      </div>

     {/* Mobile Dropdown */}
{menuOpen && (
  <div
    ref={menuRef}
    className="md:hidden bg-[#0b1120]/95 backdrop-blur-xl border-t border-blue-900/30 flex flex-col p-4 gap-4 text-white animate-in slide-in-from-top duration-300"
  >
    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        router.push(marketplaceHome);
      }}
    >
      {t("nav.home")}
    </button>
    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        router.push("/about");
      }}
    >
      {t("nav.about")}
    </button>
    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        router.push("/safety");
      }}
    >
      {t("nav.safety")}
    </button>
    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        router.push("/contact");
      }}
    >
      {t("nav.contact")}
    </button>

    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        requireAuth(addListingHref);
      }}
    >
      {t("nav.addListing")}
    </button>
  <a
  href="https://www.facebook.com/profile.php?id=61589186823471"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 hover:text-blue-400 transition"
>
  📘 {t("nav.facebook")}
</a>
    <LanguageSwitcher />

    {user ? (
      
      <>
      
      <button
  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-blue-500/10"
  onClick={() => {
    setMenuOpen(false);
    router.push("/notifications");
  }}
>
  <span>
    🔔 {t("notifications.title")}
    </span>

  {unreadCount > 0 && (
    <span className="rounded-full bg-red-500 px-2 py-1 text-xs">
      {unreadCount}
    </span>
  )}
</button>

        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
          onClick={() => {
            setMenuOpen(false);
            requireAuth("/profile");
          }}
        >
          {t("nav.profile")}
        </button>

        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-red-500/10 text-red-400 transition"
          onClick={async () => {
            await signOut(auth);
            setMenuOpen(false);
          }}
        >
          {t("nav.logout")}
        </button>
      </>
    ) : (
      <>
        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
          onClick={() => {
            setMenuOpen(false);
            router.push("/login");
          }}
        >
          {t("nav.login")}
        </button>

        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
          onClick={() => {
            setMenuOpen(false);
            router.push("/register");
          }}
        >
          {t("nav.register")}
        </button>
        
      </>
    )}
  </div>
)} 
    </nav>
  );
}