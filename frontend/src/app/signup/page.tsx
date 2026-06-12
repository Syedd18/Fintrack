"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, AlertCircle } from "lucide-react";
import FinTrackLogo from "../components/FinTrackLogo";

export default function MobileSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fintrack-auth")) {
      router.replace("/app");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    setError(null);
    setLoading(true);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const errText = await res.text();
        setError(errText || "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.warn("[Fallback] Registration backend offline, simulating success:", err);
      setTimeout(() => {
        localStorage.setItem("fintrack-username", name);
        localStorage.setItem("fintrack-useremail", email);
        router.push("/verify");
      }, 800);
    }
  };

  const handleSocialSignup = (platform: string) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("fintrack-username", "Rizvi Ahmed");
      localStorage.setItem("fintrack-useremail", `rizvi@${platform}.com`);
      router.push("/verify");
    }, 1000);
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="text-[12px] font-bold text-[#6B7280] hover:text-[#111827] transition">Back</Link>
        <span className="text-[12px] font-bold text-[#6B7280]">Register</span>
      </div>

      <div className="my-auto space-y-3.5 max-w-[340px] mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <FinTrackLogo variant="icon-light" size={52} className="mx-auto shadow-sm" />
          <h2 className="text-[19px] font-black tracking-tight text-[#111827] mt-1">Create Account</h2>
          <p className="text-[11.5px] text-[#6B7280]">Start taking control of your finances.</p>
        </div>

        {error && (
          <div className="p-2.5 bg-[#FBEEED] border border-[#B85C4D]/10 rounded-xl text-[#B85C4D] text-[11.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Full Name</label>
            <input
              type="text"
              placeholder="Rizvi Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Email Address</label>
            <input
              type="email"
              placeholder="rizvi@fintrack.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div className="flex items-start py-0.5">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-3.5 h-3.5 text-[#C9A76A] border-[#E5E7EB] rounded focus:ring-[#C9A76A]/20 cursor-pointer mt-0.5"
            />
            <label htmlFor="agree" className="text-[10.5px] text-[#4B5563] ml-2 cursor-pointer select-none leading-tight">
              I agree to the <a href="#" className="text-[#C9A76A] font-bold hover:underline">Terms</a> and <a href="#" className="text-[#C9A76A] font-bold hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2.5 text-[#6B7280] py-0.5">
          <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
          <span className="text-[8.5px] font-bold uppercase tracking-widest">or sign up with</span>
          <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSocialSignup("google")}
            disabled={loading}
            className="flex-1 py-2.5 border border-[#E5E7EB] hover:bg-[#F5F5F2] text-[12.5px] font-semibold rounded-xl transition flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>
          
          <button
            onClick={() => handleSocialSignup("apple")}
            disabled={loading}
            className="flex-1 py-2.5 border border-[#E5E7EB] hover:bg-[#F5F5F2] text-[12.5px] font-semibold rounded-xl transition flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
            </svg>
            <span>Apple</span>
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-[#F0F0ED] text-center w-full max-w-[340px] mx-auto">
        <span className="text-[12px] text-[#6B7280]">
          Already have an account? <Link href="/login" className="text-[#C9A76A] font-bold hover:underline">Log In</Link>
        </span>
      </div>

    </div>
  );
}
