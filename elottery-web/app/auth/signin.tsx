"use client";

import { useState } from "react";
import Link from "next/link";
import Loading from "@/components/ui/loading/loadOne";
import { useAlert } from "@/context/AlertContext";
import api from "@/lib/axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { setError, setSuccess } = useAlert();   
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    setIsLoading(true);

    // ตรวจสอบข้อมูลที่กรอก
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
        const response = await api.post("/auth/login", form);
        
        setSuccess("Login successful! Redirecting to home...");

        setTimeout(() => {
          window.location.href = '/';
          setIsLoading(false);

        }, 1000);
        
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during login.");
      setIsLoading(false);
    } 
  };

  return (
      <div className="flex justify-center items-center md:min-h-[100vh] min-h-[90vh]">
        <div className="flex flex-col md:flex-row items-center rounded-lg md:shadow-lg md:bg-white p-6 space-y-6 md:space-y-2 md:space-x-6">
            <div className="hidden md:block">
                <img src="/image/login.jpg" className="w-[600px] h-[500px]" alt="login" />
            </div>

            <div className="w-full md:w-full md:max-w-[400px] space-y-2">
                <h1 className="md:text-2xl text-3xl md:text-black text-white font-bold  mb-2">Lets Start Booking 🎬</h1>
                <p className="md:text-gray-700 text-gray-200 mb-6 ">Please login or sign up to continue</p>

                <form className="space-y-6 md:space-y-4" onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div className="relative mt-6">
                      <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                      <div className="absolute inset-y-0 left-4 flex items-center">
                      <svg
                          className="h-6 w-6 text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                      >
                          <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                      </svg>
                      </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <div className="absolute inset-y-0 left-4 flex items-center">
                      <svg
                        className="h-6 w-6 text-gray-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mb-2 rounded rounded-xl flex justify-center items-center font-medium transition ${
                    isLoading ? "bg-amber-600 py-1 cursor-not-allowed" : "bg-amber-500 py-3 text-white hover:bg-amber-600"
                    }`}>
                    {isLoading ? <Loading /> : "Log In"}
                  </button>
                </form>

                <p className="md:text-gray-700 text-gray-200 text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="signup/" className="text-amber-500 hover:underline">
                      Sign Up
                  </Link>
                </p>
            </div>
        </div>
      </div>
  );
}