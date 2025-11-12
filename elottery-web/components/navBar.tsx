"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, User, X } from "lucide-react";
import { useUser } from "@/context/UserContext";

const NavBar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  // ป้องกัน body scroll ตอนเปิดเมนูมือถือ
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Buy Tickets", href: "/tickets" },
    { name: "My Wallet", href: "/wallet" },
    { name: "History", href: "/history" },
    { name: "Draw History", href: "/history/draws" },
  ];

  const linkClass = (href: string) =>
    `block rounded-md px-3 py-2 text-base font-medium transition ${
      pathname === href
        ? "text-amber-600 dark:text-amber-400"
        : "text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400"
    }`;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      window.location.href = "/auth/signin";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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

        {/* Right: desktop auth */}
        {user ? (
          <div className="hidden md:flex items-center gap-3">
            <User className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
            <button
              onClick={handleLogout}
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
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay + sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="md:hidden fixed top-16 inset-x-0 z-50">
            <div className="mx-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden animate-[fadeDown_120ms_ease-out]">
              {/* User section (mobile) */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/signin"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm font-semibold rounded-md bg-amber-500 text-white hover:bg-amber-600"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="px-2 py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={linkClass(link.href)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;