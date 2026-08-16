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

export default function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);
    const [user, setUser] =
  useState<any>(null);

const [showNotifications, setShowNotifications] = useState(false);

// Temporary demo count

  const router =
    useRouter();

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

        await currentUser.reload();

        if (
          !currentUser.emailVerified
        ) {
          await signOut(
            auth
          );

          setUser(
            null
          );

          return;
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
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

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
    className="object-contain shrink-0"
  />

 <div className="flex flex-col leading-tight min-w-0">
  <span className="text-xl md:text-2xl font-bold text-white">
    pippinway.com
  </span>
</div>
  </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-white font-medium items-center">
  <Link href="/">
    Home
  </Link>

  <Link href="/add-listing">
    Add Listing
  </Link>
  <a
  href="https://www.facebook.com/profile.php?id=61589186823471"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 hover:text-blue-400 transition"
>
  📘 Facebook
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
        Notifications
      </div>

     <div className="divide-y divide-white/5">

  {notifications.length === 0 ? (
    <div className="p-6 text-center text-sm text-gray-400">
      No notifications
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
    Close
  </button>

  <button
    onClick={() => {
      setShowNotifications(false);
      router.push("/notifications");
    }}
    className="flex-1 border-l border-white/10 p-3 text-sm text-cyan-400 hover:bg-white/5"
  >
    View All
  </button>

</div>

    </div>
  )}

</div>

      <Link href="/profile">
        Profile
      </Link>

      <button
        onClick={() =>
          signOut(auth)
        }
        className="hover:text-red-400 transition"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link href="/login">
        Login
      </Link>

      <Link href="/register">
        Register
      </Link>
    </>
  )}
</div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-3xl"
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
        router.push("/");
      }}
    >
      Home
    </button>

    <button
      className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
      onClick={() => {
        setMenuOpen(false);
        router.push("/add-listing");
      }}
    >
      Add Listing
    </button>
  <a
  href="https://www.facebook.com/profile.php?id=61589186823471"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 hover:text-blue-400 transition"
>
  📘 Facebook
</a>

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
    🔔 Notifications
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
            router.push("/profile");
          }}
        >
          Profile
        </button>

        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-red-500/10 text-red-400 transition"
          onClick={async () => {
            await signOut(auth);
            setMenuOpen(false);
          }}
        >
          Logout
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
          Login
        </button>

        <button
          className="text-left py-2 px-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition"
          onClick={() => {
            setMenuOpen(false);
            router.push("/register");
          }}
        >
          Register
        </button>
        
      </>
    )}
  </div>
)} 
    </nav>
  );
}