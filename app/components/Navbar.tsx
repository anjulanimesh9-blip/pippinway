"use client";

import Link from "next/link";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import {
  Home,
  Info,
  LogOut,
  Mail,
  Plus,
  Shield,
  User,
  X,
} from "lucide-react";
import useNotifications from "../hooks/useNotifications";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { GuestAuthLink, useGuestAuthPrompt } from "./GuestAuthPrompt";
import useCountryNavigation from "../hooks/useCountryNavigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61589186823471";

const NAV_LINK =
  "rounded-lg px-2.5 py-1.5 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]";

const DRAWER_ROW =
  "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/5 active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { requireAuth } = useGuestAuthPrompt();
  const { marketplaceHome, addListingHref } = useCountryNavigation();
  const { t } = useI18n();
  const { notifications, unreadCount } = useNotifications();
  const notifyRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        return;
      }

      try {
        await currentUser.reload();
      } catch {
        // Keep the signed-in session if reload fails in the WebView.
      }

      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.getElementById("pw-language-sheet")) return;
      closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        notifyRef.current &&
        !notifyRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string, authRequired = false) => {
    closeMenu();
    if (authRequired) {
      requireAuth(href);
      return;
    }
    router.push(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020817]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-2.5 md:h-[72px] md:px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
        >
          <Image
            src="/images/logo.png"
            alt="Pippinway"
            width={90}
            height={90}
            className="h-8 w-auto shrink-0 object-contain md:h-10"
            priority
          />
          <span className="hidden truncate text-sm font-medium tracking-tight text-white lg:inline">
            pippinway.com
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          <Link href={marketplaceHome} className={NAV_LINK}>
            {t("nav.home")}
          </Link>
          <Link href="/about" className={NAV_LINK}>
            {t("nav.about")}
          </Link>
          <Link href="/safety" className={NAV_LINK}>
            {t("nav.safety")}
          </Link>
          <Link href="/contact" className={NAV_LINK}>
            {t("nav.contact")}
          </Link>

          <GuestAuthLink
            href={addListingHref}
            className="rounded-lg bg-[#FBB03B]/10 px-2.5 py-1.5 text-sm font-medium text-[#FBB03B] transition hover:bg-[#FBB03B]/16 hover:text-[#FBB03B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
          >
            {t("nav.addListing")}
          </GuestAuthLink>

          <div className="mx-1.5 h-4 w-px bg-white/10" />

          <LanguageSwitcher quiet />

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${NAV_LINK} inline-flex items-center gap-1.5`}
          >
            <span aria-hidden>📘</span>
            {t("nav.facebook")}
          </a>

          {user ? (
            <>
              <div className="relative" ref={notifyRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((value) => !value)}
                  className="relative rounded-full p-2 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                  aria-label={t("notifications.title")}
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="flex-1 p-3 text-sm text-gray-300 hover:bg-white/5"
                      >
                        {t("common.close")}
                      </button>
                      <button
                        type="button"
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

              <GuestAuthLink href="/profile" className={NAV_LINK}>
                {t("nav.profile")}
              </GuestAuthLink>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="rounded-lg px-2.5 py-1.5 text-sm text-gray-300 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={NAV_LINK}>
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm font-medium text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5 lg:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
            aria-label={t("auth.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <span className="text-xl leading-none" aria-hidden>
              ☰
            </span>
          </button>
        </div>
      </div>

      {mounted &&
        menuOpen &&
        createPortal(
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/65"
            aria-label={t("common.close")}
            onClick={closeMenu}
          />
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t("auth.openMenu")}
            className="fixed inset-y-0 right-0 z-[80] flex w-[86vw] max-w-[340px] flex-col border-l border-white/10 bg-[#0B1220] pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-2.5">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
              >
                <Image
                  src="/images/logo.png"
                  alt="Pippinway"
                  width={72}
                  height={72}
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-2">
              <div className="space-y-0.5">
                <button type="button" className={DRAWER_ROW} onClick={() => go(marketplaceHome)}>
                  <Home className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                  {t("nav.home")}
                </button>
                <button type="button" className={DRAWER_ROW} onClick={() => go("/about")}>
                  <Info className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                  {t("nav.about")}
                </button>
                <button type="button" className={DRAWER_ROW} onClick={() => go("/safety")}>
                  <Shield className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                  {t("nav.safety")}
                </button>
                <button type="button" className={DRAWER_ROW} onClick={() => go("/contact")}>
                  <Mail className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                  {t("nav.contact")}
                </button>
                <button
                  type="button"
                  className={`${DRAWER_ROW} font-semibold text-[#FBB03B]`}
                  onClick={() => go(addListingHref, true)}
                >
                  <Plus className="h-[18px] w-[18px] shrink-0" />
                  {t("nav.addListing")}
                </button>
              </div>

              <div className="my-2 h-px bg-white/10" />

              <LanguageSwitcher variant="row" />

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={DRAWER_ROW}
              >
                <span aria-hidden className="w-[18px] text-center">
                  📘
                </span>
                {t("nav.facebook")}
              </a>

              <div className="my-2 h-px bg-white/10" />

              {user ? (
                <div className="space-y-0.5">
                  <button
                    type="button"
                    className={DRAWER_ROW}
                    onClick={() => go("/notifications")}
                  >
                    <span aria-hidden className="w-[18px] text-center">
                      🔔
                    </span>
                    <span className="flex-1">{t("notifications.title")}</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={DRAWER_ROW}
                    onClick={() => go("/profile", true)}
                  >
                    <User className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                    {t("nav.profile")}
                  </button>
                  <button
                    type="button"
                    className={`${DRAWER_ROW} text-red-400 hover:bg-red-500/10`}
                    onClick={async () => {
                      await signOut(auth);
                      closeMenu();
                    }}
                  >
                    <LogOut className="h-[18px] w-[18px] shrink-0" />
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <button
                    type="button"
                    className={DRAWER_ROW}
                    onClick={() => go("/login")}
                  >
                    <User className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                    {t("nav.login")}
                  </button>
                  <button
                    type="button"
                    className={`${DRAWER_ROW} font-medium`}
                    onClick={() => go("/register")}
                  >
                    <Plus className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                    {t("nav.register")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </nav>
  );
}
