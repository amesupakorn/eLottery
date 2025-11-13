"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react"
import { useAlert } from "@/context/AlertContext";
import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const { setError, setSuccess } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill out all fields.");
      setIsLoading(false);
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }
    if (form.name.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/signup", form);
      setSuccess("Signup successful! Please check your email to confirm.");
      const email = res.data?.email;
      setTimeout(() => {
        if (email) {
          router.push(`/auth/confirm_email?email=${encodeURIComponent(email)}`);
        }
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm p-6 md:p-8">
          <header className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Create your account ✨
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign up to continue
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Username
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

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
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPwd2 ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd2((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPwd2 ? "Hide confirm password" : "Show confirm password"}
                >
                  {showPwd2 ? "Hide" : "Show"}
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
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-amber-600 hover:text-amber-700 font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          By creating an account you agree to our Terms & Privacy.
        </p>
      </div>
    </main>
  );
}