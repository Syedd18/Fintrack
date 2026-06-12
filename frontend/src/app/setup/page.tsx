"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, CreditCard, Target, Database, Bell, ArrowRight, ArrowLeft } from "lucide-react";

const GOAL_OPTIONS = [
  { name: "Emergency Fund", emoji: "🛡️", target: 100000, desc: "Liquid cash for unexpected expenses" },
  { name: "Travel & Vacation", emoji: "✈️", target: 35000, desc: "Savings for your next escape" },
  { name: "New Laptop Fund", emoji: "💻", target: 120000, desc: "Upgrade your workstation gears" },
  { name: "Investment Fund", emoji: "📈", target: 200000, desc: "Grow wealth in SIPs and assets" },
];

export default function MobileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [budgetLimit, setBudgetLimit] = useState(15000);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Emergency Fund"]);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Force authentication check
    if (!localStorage.getItem("fintrack-auth")) {
      router.replace("/login");
    }
  }, []);

  const toggleGoal = (name: string) => {
    setSelectedGoals((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    // Save locally
    localStorage.setItem("fintrack-budget-limit", String(budgetLimit));
    const firstGoal = GOAL_OPTIONS.find((g) => selectedGoals.includes(g.name)) || GOAL_OPTIONS[0];
    localStorage.setItem(
      "fintrack-first-goal",
      JSON.stringify({ name: firstGoal.name, emoji: firstGoal.emoji, target: firstGoal.target })
    );

    const pairKey = "ft_pair_" + Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join("");
    localStorage.setItem("fintrack-pairing-key", pairKey);

    const token = localStorage.getItem("fintrack-token");
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          monthlyBudget: budgetLimit,
          alertsEnabled: notificationsEnabled,
          dailySummaryEnabled: trackingEnabled,
          currency: "INR"
        })
      });
      if (res.ok) {
        console.log("Onboarding settings saved successfully");
      }
    } catch (err) {
      console.warn("[Fallback] Onboarding settings PUT failed, using local storage fallback:", err);
    }

    setTimeout(() => {
      router.push("/success");
    }, 800);
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Top Header Progress */}
      <div className="pt-1 space-y-1.5 w-full max-w-[340px] mx-auto">
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
          <span>Quick Setup</span>
          <span>Step {step} of 4</span>
        </div>
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9A76A] rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Area */}
      <div className="my-auto space-y-4 w-full max-w-[340px] mx-auto">
        
        {/* STEP 1: Budget limit */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center shadow-sm">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[18px] font-black tracking-tight text-[#111827]">What is your monthly budget?</h2>
              <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                Set a monthly spending threshold. FinTrack AI automatically splits this limits to guide your daily spend cards.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#6B7280]">Target Monthly Limit</span>
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

        {/* STEP 2: Goals */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-[#F7F0E3] text-[#C9A76A] flex items-center justify-center shadow-sm">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Select financial goals</h2>
              <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                Choose the metrics you want to visualize. We'll populate these goals inside your planning tab.
              </p>
            </div>

            <div className="space-y-2 pt-1.5 max-h-[190px] overflow-y-auto pr-1 hide-scrollbar">
              {GOAL_OPTIONS.map((g) => {
                const active = selectedGoals.includes(g.name);
                return (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => toggleGoal(g.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${active ? "border-[#C9A76A] bg-[#F7F0E3]/20" : "border-[#E5E7EB] bg-white"}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{g.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-[11.5px] font-bold block text-[#111827] truncate">{g.name}</span>
                        <span className="text-[8.5px] text-[#6B7280] block truncate">{g.desc}</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#6B7280] flex-shrink-0">₹{Math.round(g.target / 1000)}k</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Transaction sync permission */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3EF] text-[#4F7A5B] flex items-center justify-center shadow-sm">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Enable SMS Relays</h2>
              <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                FinTrack AI works dynamically by reading incoming transaction alerts from HDFC, SBI, ICICI bank accounts.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold block text-[#111827]">Automatic Ledger Sync</span>
                <span className="text-[8.5px] text-[#6B7280] block mt-0.5 leading-normal">Auto-parse amount, merchant, and UPI IDs.</span>
              </div>
              <button
                type="button"
                onClick={() => setTrackingEnabled(!trackingEnabled)}
                className={`w-9 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors duration-300 ${trackingEnabled ? "bg-[#4F7A5B]" : "bg-[#E5E7EB]"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${trackingEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="p-2.5 text-[9.5px] bg-[#FAFAF8] text-[#6B7280] rounded-lg border border-[#E5E7EB] leading-relaxed">
              🔑 Encryption: We never store your login details or share personal telemetry values.
            </div>
          </div>
        )}

        {/* STEP 4: Notifications permission */}
        {step === 4 && (
          <div className="space-y-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-[#F7F0E3] text-[#C9A76A] flex items-center justify-center shadow-sm">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[18px] font-black tracking-tight text-[#111827]">Stay On Track</h2>
              <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
                Enable smart notifications. Get instant warning tags before you exceed budgets, and daily AI summaries.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold block text-[#111827]">Push Spends Alerts</span>
                <span className="text-[8.5px] text-[#6B7280] block mt-0.5 leading-normal">Get notifications when transactions sync.</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-9 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors duration-300 ${notificationsEnabled ? "bg-[#C9A76A]" : "bg-[#E5E7EB]"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${notificationsEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Action Navigation Controls */}
      <div className="pt-3 border-t border-[#F0F0ED] flex gap-2.5 w-full max-w-[340px] mx-auto">
        {step > 1 && (
          <button
            onClick={handlePrev}
            disabled={loading}
            className="px-4 py-2.5 border border-[#E5E7EB] text-[#4B5563] text-[12px] font-bold rounded-lg transition flex items-center justify-center gap-1 hover:bg-[#F5F5F2]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-[12px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm ml-auto"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : step === 4 ? (
            <>Complete Setup <Sparkles className="w-3.5 h-3.5 text-[#C9A76A]" /></>
          ) : (
            <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

    </div>
  );
}
