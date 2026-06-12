"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";
import FinTrackLogo from "../components/FinTrackLogo";

export default function SuccessPage() {
  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] text-center relative overflow-x-hidden overflow-y-auto">
      
      {/* Brand Header */}
      <div className="flex justify-center pt-1.5">
        <FinTrackLogo variant="horizontal" size={36} />
      </div>

      {/* Success Content */}
      <div className="my-auto space-y-4 animate-scale-in w-full max-w-[340px] mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center mx-auto animate-scale-in">
          <CheckCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 px-4">
          <h2 className="text-[19px] font-black tracking-tight">You're All Set.</h2>
          <p className="text-[12px] text-[#6B7280] leading-relaxed max-w-[280px] mx-auto">
            FinTrack AI is ready to help you automatically track transactions and build healthier financial habits.
          </p>
        </div>
      </div>

      {/* Enter App CTA */}
      <div className="pt-3 border-t border-[#F0F0ED] w-full max-w-[340px] mx-auto">
        <Link
          href="/app"
          className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          Enter FinTrack AI
        </Link>
        <p className="text-[8.5px] text-[#6B7280] pt-2">Your configurations are securely synchronized</p>
      </div>

    </div>
  );
}
