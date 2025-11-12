"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react"
import { useAlert } from "@/context/AlertContext";
import api from "@/lib/axios";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const { setError, setSuccess } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/signin", form);
      setSuccess("Login successful! Redirecting to home...");
      setTimeout(() => {
        window.location.href = `/?notify_opt=${res.data.user.notify_opt}`;
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-12">
          <header className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome back 👋
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please login to continue
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full inline-flex items-center justify-center rounded-xl font-medium transition
                ${isLoading ? "bg-amber-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"}
                text-white py-2`}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-amber-600 hover:text-amber-700 font-medium underline-offset-4 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer (optional) */}
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing you agree to our Terms & Privacy.
        </p>
      </div>
    </main>
  );
}