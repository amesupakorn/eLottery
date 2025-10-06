"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading/loadOne";
import Link from "next/link";
import { useAlert } from "@/context/AlertContext";
import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const { setError, setSuccess } = useAlert();   
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (form.name.length < 3){
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
      setError("Passwords do not match");
      setIsLoading(false);

      return;
    }


    try {
      
      await api.post("/auth/signup", form);
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/signin");
        setIsLoading(false);

      }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }

  };

  return (
    <div className="flex justify-center items-center md:min-h-[100vh] min-h-[90vh]">
        <div className="flex flex-col md:flex-row items-center rounded-lg md:shadow-lg md:bg-white p-6 space-y-6 md:space-y-2 md:space-x-6">

        <div className="hidden md:block ">
            <img
                src="/image/login.jpg"
                className="w-[510px] h-[500px]"
                alt="login"
            />
        </div>
        {/* Form Section */}
        <div className="w-full md:w-full md:max-w-[400px] space-y-4">
        <h1 className="text-2xl font-bold md:text-gray-800 text-white mb-6">Hello! Register to get Started</h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Username"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              <div className="absolute inset-y-0 left-4 flex items-center">
                <svg
                  className="h-6 w-6 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
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
                  className="h-6 w-6  text-gray-900"
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
                  className="h-6 w-6  text-gray-900"
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

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <div className="absolute inset-y-0 left-4 flex items-center">
                <svg
                  className="h-6 w-6  text-gray-900"
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

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl font-medium transition flex items-center justify-center ${
                  isLoading ? "bg-gray-600 py-1 cursor-not-allowed" : "bg-amber-500  py-3 text-white hover:bg-amber-600"
              }`}>
              {isLoading ? (  <Loading /> ) : ( "Sign Up" )}
            </button>
          </form>

          <p className="md:text-gray-500 text-gray-200 text-center mt-4">
            Already have an account?{" "}
            <Link href="login" className="text-amber-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
