"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Shield, Bell, Target, TrendingUp, Activity, ChevronRight } from "lucide-react";
import FinTrackLogo from "./components/FinTrackLogo";

// Mini Goal progress ring for visual illustrations
function MiniProgressRing({ 
  progress, 
  size = 40, 
  strokeWidth = 3, 
  color = "#C9A76A" 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export default function MobileLaunchExperience() {
  const [screen, setScreen] = useState<"splash" | "intro1" | "intro2" | "intro3" | "welcome">("splash");

  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => {
        setScreen("intro1");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Background Decorative Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-[#C9A76A]/3 rounded-full blur-[70px] -z-10 animate-fade-in" />

      {/* ═══════════════ SCREEN 1 — SPLASH SCREEN ═══════════════ */}
      {screen === "splash" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fade-in">
          <FinTrackLogo variant="monogram" size={88} className="animate-scale-in shadow-sm" />
          <div className="text-center space-y-1">
            <h1 className="text-[23px] font-black tracking-tight text-[#111827]">FinTrack <span className="text-[#C9A76A]">AI</span></h1>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#6B7280]">Financial Operating System</p>
          </div>
          <div className="pt-8">
            <div className="w-5 h-5 border-2 border-[#C9A76A] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* ═══════════════ SCREENS 2-4: INTRO SLIDES ═══════════════ */}
      {screen !== "splash" && screen !== "welcome" && (
        <div className="flex-1 flex flex-col justify-between animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center pt-1.5">
            <div className="flex items-center gap-1.5">
              <FinTrackLogo variant="monogram" size={24} />
              <span className="text-[11.5px] font-extrabold tracking-tight text-[#111827]">FinTrack <span className="text-[#C9A76A]">AI</span></span>
            </div>
            <button onClick={() => setScreen("welcome")} className="text-[11px] font-bold text-[#6B7280] hover:text-[#111827] transition">Skip</button>
          </div>

          {/* Visual Illustrations & Descriptions */}
          <div className="my-auto space-y-6">
            
            {/* INTRO 1 Visual: Automatic bank SMS interceptor */}
            {screen === "intro1" && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3 w-full max-w-[290px] mx-auto animate-scale-in">
                  <div className="p-2 bg-[#FAFAF8] rounded-xl border border-dashed border-[#D1D5DB] space-y-1 text-left">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#6B7280]">Incoming SMS Intercepted</span>
                    <p className="text-[9.5px] font-mono text-[#4B5563] leading-relaxed">
                      "Alert: Rs 350 spent on Swiggy via HDFC UPI at 09:00 PM. Available Bal: Rs 24,217"
                    </p>
                  </div>
                  
                  <div className="flex justify-center my-0.5">
                    <div className="w-1.5 h-6 border-l-2 border-dashed border-[#C9A76A]/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A76A] -translate-x-[1px]" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-[#EEF3EF] border border-[#4F7A5B]/15 rounded-xl text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#4F7A5B] text-white flex items-center justify-center font-bold text-[11px]">S</div>
                      <div>
                        <span className="text-[11px] font-bold block text-[#111827]">Swiggy</span>
                        <span className="text-[8.5px] text-[#6B7280] block">Food & Dining • Just now</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-[#B85C4D] block">-₹350</span>
                      <span className="text-[8px] text-[#6B7280] block">HDFC UPI</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-center max-w-[280px] mx-auto">
                  <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Automated bank sync</h2>
                  <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                    No credit credentials required. FinTrack AI intercepts bank alerts locally and builds your private ledger in real-time.
                  </p>
                </div>
              </div>
            )}

            {/* INTRO 2 Visual: Conversational AI advisor */}
            {screen === "intro2" && (
              <div className="space-y-4">
                <div className="space-y-2.5 w-full max-w-[290px] mx-auto animate-scale-in text-[11px]">
                  <div className="p-3 bg-zinc-100 rounded-[18px] rounded-tl-sm text-[#4B5563] text-left max-w-[85%]">
                    Can I afford a new tablet this month?
                  </div>
                  
                  <div className="p-3 bg-[#F7F0E3]/80 border border-[#C9A76A]/10 rounded-[18px] rounded-tr-sm text-[#111827] text-left max-w-[90%] ml-auto space-y-1 shadow-sm">
                    <span className="text-[8.5px] font-bold text-[#C9A76A] uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Coach
                    </span>
                    <p className="leading-relaxed text-[11.5px]">
                      Yes! You saved ₹8,400 more than average this month. Purchasing it now keeps your emergency buffer at ₹24,000.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-center max-w-[280px] mx-auto">
                  <h2 className="text-[18px] font-black tracking-tight text-[#111827]">AI financial coach</h2>
                  <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                    Chat with your dynamic copilot. Get smart spend audits, savings projections, and answers to custom financial queries.
                  </p>
                </div>
              </div>
            )}

            {/* INTRO 3 Visual: Savings Goals and limits */}
            {screen === "intro3" && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3.5 w-full max-w-[290px] mx-auto animate-scale-in">
                  {/* Budget */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280] uppercase">
                      <span>Monthly Budget</span>
                      <span className="text-[#C9A76A]">₹6,750 / ₹15,000</span>
                    </div>
                    <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9A76A] rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>

                  {/* Goal list card */}
                  <div className="flex justify-between items-center p-2.5 bg-[#F9F9F7] rounded-xl text-left border border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                      <MiniProgressRing progress={65} color="#4F7A5B" />
                      <div>
                        <span className="text-[11px] font-bold block text-[#111827]">Europe Trip ✈️</span>
                        <span className="text-[8.5px] text-[#6B7280] block">Target: ₹1,00,000</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#4F7A5B] bg-[#EEF3EF] px-2 py-0.5 rounded-lg">65%</span>
                  </div>
                </div>

                <div className="space-y-2 text-center max-w-[280px] mx-auto">
                  <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Budgets & Target maps</h2>
                  <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                    Stay on target without effort. Automatically allocate savings categories and get early alerts before exceeding thresholds.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pb-3 border-t border-[#F0F0ED] pt-4">
            {/* Dots */}
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => {
                const current = (screen === "intro1" && num === 1) || (screen === "intro2" && num === 2) || (screen === "intro3" && num === 3);
                return (
                  <div
                    key={num}
                    className={`h-1.5 rounded-full transition-all duration-300 ${current ? "w-4 bg-[#C9A76A]" : "w-1.5 bg-[#E5E7EB]"}`}
                  />
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (screen === "intro1") setScreen("intro2");
                else if (screen === "intro2") setScreen("intro3");
                else setScreen("welcome");
              }}
              className="py-2 px-4 bg-[#111827] hover:bg-[#1f2937] text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ SCREEN 5 — WELCOME GATE SCREEN ═══════════════ */}
      {screen === "welcome" && (
        <div className="flex-1 flex flex-col justify-between animate-fade-in">
          
          <div className="pt-2 flex justify-center">
            <FinTrackLogo variant="monogram" size={56} className="shadow-sm" />
          </div>

          <div className="my-auto space-y-5 text-center max-w-[320px] mx-auto">
            <div className="space-y-1">
              <h1 className="text-[25px] font-black tracking-tight text-[#111827]">FinTrack <span className="text-[#C9A76A]">AI</span></h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7280]">Financial Operating System</p>
            </div>
            
            <p className="text-[12px] text-[#4B5563] leading-relaxed">
              Understand your savings progress, track transaction flows instantly, and chat with your AI copilot. Everything is secured right on your device.
            </p>

            <div className="py-2 max-w-[260px] mx-auto">
              <div className="p-3 bg-[#EEF3EF] border border-[#4F7A5B]/15 rounded-2xl flex items-center gap-3 text-left">
                <Shield className="w-5 h-5 text-[#4F7A5B] flex-shrink-0" />
                <span className="text-[9.5px] font-bold text-[#4F7A5B] leading-snug">
                  Zero bank account password requirements. Completely offline-first SMS pipeline.
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pb-3 pt-3 border-t border-[#F0F0ED]">
            <Link
              href="/signup"
              className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/login"
              className="w-full py-3 border border-[#E5E7EB] hover:bg-[#F5F5F2] text-[#4B5563] text-[12.5px] font-bold rounded-xl transition flex items-center justify-center"
            >
              Sign In to Account
            </Link>

            <div className="pt-2 text-center text-[9px] text-[#9CA3AF] flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Hashed and secured locally using AES-256 constraints.</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
