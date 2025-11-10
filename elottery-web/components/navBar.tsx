"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import { useUser } from "@/context/UserContext";

const NavBar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Buy Tickets", href: "/tickets" },
    { name: "My Wallet", href: "/wallet" },
    { name: "History", href: "/history" },
    { name: "Draw History", href: "/history/draws" },

  ];

  return (
    <nav className="bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-amber-600 dark:text-amber-400 hover:opacity-90 transition"
        >
          eLottery
        </Link>

        {/* Center: nav links (desktop) */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium text-sm transition mt-1 ${
                pathname === link.href
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>

              <button
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/auth/signin"; // redirect ไปหน้า login
                  } catch (err) {
                    console.error("Logout error:", err);
                  }
                }}
                className="ml-2 px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                  pathname === link.href
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 space-y-1">
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;