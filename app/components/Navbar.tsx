"use client";

import Link from "next/link";
import Image from "next/image";
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

  const router =
    useRouter();

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

  {user ? (
    <>
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

    {user ? (
      <>
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