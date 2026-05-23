"use client";

import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const router = useRouter();

  const menuRef =
    useRef<HTMLDivElement>(null);

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
          className="text-3xl font-bold text-white"
        >
          Pippinway
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-white font-medium">
          <Link href="/">Home</Link>
          <Link href="/listings">
            Listings
          </Link>
          <Link href="/add-listing">
            Add Listing
          </Link>
          <Link href="/login">
            Login
          </Link>
          <Link href="/register">
            Register
          </Link>
          <Link href="/profile">
            Profile
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() =>
            setMenuOpen(
              (prev) => !prev
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
          className="md:hidden bg-[#111827] border-t border-gray-800 flex flex-col p-4 gap-4 text-white"
        >
          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push("/");
            }}
          >
            Home
          </button>

          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push(
                "/listings"
              );
            }}
          >
            Listings
          </button>

          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push(
                "/add-listing"
              );
            }}
          >
            Add Listing
          </button>

          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push("/login");
            }}
          >
            Login
          </button>

          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push(
                "/register"
              );
            }}
          >
            Register
          </button>

          <button
            className="text-left"
            onClick={() => {
              setMenuOpen(false);
              router.push(
                "/profile"
              );
            }}
          >
            Profile
          </button>
        </div>
      )}
    </nav>
  );
}