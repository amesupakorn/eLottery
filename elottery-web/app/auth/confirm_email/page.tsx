"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || ""; 

  const [form, setForm] = useState({
    email: emailFromUrl,
    code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/confirm", form);
      setMessage({ type: "success", text: "Email confirmed successfully!" });

      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Invalid confirmation code.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      {/* Message Box */}
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 shadow-lg rounded-lg p-4 px-6 text-center ${
            message.type === "error"
              ? "bg-white text-red-500 border border-red-200"
              : "bg-white text-green-600 border border-green-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2 font-medium text-sm">
            {message.type === "error" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-md">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Confirmation Code</h2>
          <p className="text-gray-600 text-sm text-center mb-6">
            Thank you for signing up. Enter the confirmation code sent to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <input
              type="hidden"
              name="username"
              value={form.email}
              onChange={handleChange}
            />

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 h-4 w-4" />
              <input
                type="text"
                name="code"
                placeholder="Confirmation Code"
                value={form.code}
                onChange={handleChange}
                required
                className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition duration-300 ${
                isLoading
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-zinc-900 hover:bg-zinc-800"
              }`}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/>  : "Confirm Email"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4">
            Have an account?{" "}
            <a href="/auth/signin" className="text-amber-500 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}