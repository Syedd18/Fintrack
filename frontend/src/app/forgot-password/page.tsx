"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Shield, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/login" className="text-[12px] font-bold text-[#6B7280] hover:text-[#111827] transition flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</Link>
        <span className="text-[12px] font-bold text-[#6B7280]">Reset Password</span>
      </div>

      <div className="my-auto space-y-4 max-w-[340px] mx-auto w-full">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-[#C9A76A] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-[19px] font-black tracking-tight text-[#111827] mt-2">Reset Password</h2>
          <p className="text-[11.5px] text-[#6B7280] leading-relaxed max-w-[260px] mx-auto">
            Enter your email address below, and we'll send you recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-[#FBEEED] border border-[#B85C4D]/10 rounded-xl text-[#B85C4D] text-[11.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#EEF3EF] border border-[#4F7A5B]/15 rounded-xl text-center space-y-1.5">
              <div className="w-7 h-7 rounded-full bg-[#4F7A5B] text-white flex items-center justify-center mx-auto">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-[13px] text-[#111827]">Instructions Sent</h4>
              <p className="text-[11px] text-[#6B7280] leading-normal">
                Check your inbox for password recovery links.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="rizvi@fintrack.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "Send Reset Instructions"}
            </button>
          </form>
        )}
      </div>

      <div className="pt-3 border-t border-[#F0F0ED] text-center flex items-center justify-center gap-1.5 text-[9.5px] text-[#6B7280] w-full max-w-[340px] mx-auto">
        <Shield className="w-3.5 h-3.5 text-[#4F7A5B]" />
        <span>Protected by enterprise-grade encryption.</span>
      </div>

    </div>
  );
}
