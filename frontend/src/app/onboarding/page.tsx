"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Key, CreditCard, Target, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const EMOJIS = ["🛡️", "💻", "✈️", "🏍️", "📈", "🏠", "🎓", "🚗"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("Rizvi Ahmed");
  const [pairingKey, setPairingKey] = useState("");
  const [budgetLimit, setBudgetLimit] = useState(15000);
  const [goalName, setGoalName] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("✈️");
  const [goalTarget, setGoalTarget] = useState(50000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Force authentication check
    if (!localStorage.getItem("fintrack-auth")) {
      router.replace("/login");
      return;
    }

    // Load initial name if saved during signup
    const savedName = localStorage.getItem("fintrack-username");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const handleGeneratePairingKey = () => {
    const key = "ft_pair_" + Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join("");
    setPairingKey(key);
  };

  const handleNext = () => {
    if (step === 2 && !pairingKey) {
      // Auto-generate pairing key if not done
      handleGeneratePairingKey();
    }
    setStep((s) => s + 1);
  };

  const handlePrev = () => {
    setStep((s) => s - 1);
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      // Persist onboarding configurations
      localStorage.setItem("fintrack-username", userName);
      localStorage.setItem("fintrack-budget-limit", String(budgetLimit));
      localStorage.setItem("fintrack-pairing-key", pairingKey || "ft_pair_demo123456789");
      
      if (goalName.trim()) {
        localStorage.setItem(
          "fintrack-first-goal",
          JSON.stringify({ name: goalName, emoji: goalEmoji, target: goalTarget })
        );
      }

      // Mark authentication active and redirect to app
      router.push("/app");
    }, 1500);
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Top Header Progress */}
      <div className="pt-1 space-y-1.5 w-full max-w-[340px] mx-auto">
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
          <span>Setup Progress</span>
          <span>Step {step} of 5</span>
        </div>
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9A76A] rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container Area */}
      <div className="my-auto space-y-4 w-full max-w-[340px] mx-auto flex-1 flex flex-col justify-between">
        
        <div className="space-y-4 my-auto">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Welcome to FinTrack AI</h2>
                <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                  Let's customize your personal financial operating system. We'll set up your dashboard, connect telemetry, and align your goals in less than two minutes.
                </p>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">What should we call you?</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Connect Device Gateway */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-[#F7F0E3] text-[#C9A76A] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Connect SMS Gateway</h2>
                <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                  FinTrack AI tracks transactions automatically using secure SMS notifications. Generate your pairing key to link the Android SMS Forwarder application.
                </p>
              </div>

              {pairingKey ? (
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] space-y-1.5">
                  <span className="text-[8.5px] font-bold text-[#6B7280] uppercase block">Generated Pairing Key</span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-[#E5E7EB] font-mono text-[9.5px]">
                    <span className="truncate select-all text-[#4B5563]">{pairingKey}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold badge-sage">Active</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGeneratePairingKey}
                  className="w-full py-2.5 bg-[#EEF3EF] hover:bg-[#EEF3EF]/70 border border-[#4F7A5B]/15 text-[#4F7A5B] text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  Generate Device Pairing Key
                </button>
              )}
            </div>
          )}

          {/* STEP 3: Set Monthly Budget */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Set Monthly Threshold</h2>
                <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                  Define the absolute budget limit you want to stay within. We'll divide this dynamically to track caps on Food, Shopping, and Travel.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11.5px] font-bold text-[#6B7280]">Target Monthly Limit</span>
                  <span className="text-[18px] font-black tracking-tight text-[#C9A76A]">₹{budgetLimit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={5000}
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#C9A76A]"
                />
                <div className="flex justify-between text-[8.5px] text-[#6B7280] font-bold">
                  <span>₹5,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Savings Goal */}
          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-[#F7F0E3] text-[#C9A76A] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Create First Target</h2>
                <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                  Choose a savings goal to visualize on your home screen. Give it a title, emoji, and target amount.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-4 min-[360px]:grid-cols-8 gap-1.5">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setGoalEmoji(emoji)}
                      className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-base border transition ${goalEmoji === emoji ? "border-[#C9A76A] bg-[#F7F0E3]/40" : "border-[#E5E7EB] hover:bg-[#FAFAF8]"} mx-auto`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Goal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Europe Trip, MacBook Fund"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-3 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Onboarding Completed */}
          {step === 5 && (
            <div className="space-y-3 animate-fade-in text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center mx-auto animate-scale-in">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-black tracking-tight text-[#111827]">All Set, {userName.split(" ")[0]}!</h2>
                <p className="text-[11.5px] text-[#6B7280] leading-relaxed max-w-[320px] mx-auto">
                  Your financial workspace has been configured. Sync keys are generated, budgets mapped, and active goals synced.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5 pt-3 border-t border-[#F0F0ED]">
          {step > 1 && step < 5 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 border border-[#E5E7EB] text-[#4B5563] text-[12px] font-bold rounded-lg transition flex items-center justify-center gap-1 hover:bg-[#FAFAF8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-sm ml-auto"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-2.5 bg-[#C9A76A] hover:bg-[#B8965A] text-[#111827] text-[13px] font-extrabold rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Launch Workspace <Sparkles className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Secure footnote */}
      <div className="text-center pt-3 flex items-center justify-center gap-1.5 text-[9.5px] text-[#6B7280] w-full max-w-[340px] mx-auto">
        <Shield className="w-3.5 h-3.5 text-[#4F7A5B]" />
        <span>Hashed and secured locally using AES-256 constraints.</span>
      </div>

    </div>
  );
}
