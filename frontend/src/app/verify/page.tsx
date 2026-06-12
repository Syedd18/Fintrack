"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, AlertCircle } from "lucide-react";
import FinTrackLogo from "../components/FinTrackLogo";

export default function MobileVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Check if we came from signup (name saved) or default it
    const name = localStorage.getItem("fintrack-username");
    if (!name) {
      localStorage.setItem("fintrack-username", "Rizvi Ahmed");
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (val: string, index: number) => {
    if (val && isNaN(Number(val))) return;
    
    const newCode = [...code];
    newCode[index] = val.slice(-1);
    setCode(newCode);

    if (val) {
      // Focus next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // If deleted, move focus back (safeguard for Android keyboards)
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
      setCode(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Simulate verification success and authenticate
      const name = localStorage.getItem("fintrack-username") || "Rizvi Ahmed";
      const email = localStorage.getItem("fintrack-useremail") || "rizvi@fintrack.ai";
      localStorage.setItem("fintrack-auth", JSON.stringify({ email, name }));

      // Redirect to onboarding quick setup
      router.push("/setup");
    }, 1200);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setCode(Array(6).fill(""));
    setResendTimer(30);
    inputRefs.current[0]?.focus();
    setError(null);
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Header back */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/signup" className="text-[12px] font-bold text-[#6B7280] hover:text-[#111827] transition">Back</Link>
        <span className="text-[12px] font-bold text-[#6B7280]">Verification</span>
      </div>

      <div className="my-auto space-y-4 max-w-[340px] mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <FinTrackLogo variant="icon-light" size={56} className="mx-auto shadow-sm" />
          <h2 className="text-[19px] font-black tracking-tight text-[#111827] mt-2">Verify Your Account</h2>
          <p className="text-[11.5px] text-[#6B7280] leading-relaxed max-w-[260px] mx-auto">
            We sent a verification code to your registered email. Enter it below to continue.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-[#FBEEED] border border-[#B85C4D]/10 rounded-xl text-[#B85C4D] text-[11.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-1">
            {code.map((char, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={char}
                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-9 h-11 text-center text-[16px] font-extrabold fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] focus:border-[#C9A76A] focus:bg-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Verify & Continue"}
          </button>
        </form>

        {/* Resend timer */}
        <div className="text-center text-[11.5px] text-[#6B7280]">
          {resendTimer > 0 ? (
            <span>Resend code in <strong className="text-[#111827]">{resendTimer}s</strong></span>
          ) : (
            <button onClick={handleResend} className="text-[#C9A76A] font-bold hover:underline">Resend code</button>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-3 border-t border-[#F0F0ED] text-center flex items-center justify-center gap-1.5 text-[9.5px] text-[#6B7280] w-full max-w-[340px] mx-auto">
        <Shield className="w-3.5 h-3.5 text-[#4F7A5B]" />
        <span>Hashed and secured locally using AES-256 constraints.</span>
      </div>

    </div>
  );
}
