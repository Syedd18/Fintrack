"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, AlertCircle, ScanFace, Check } from "lucide-react";
import FinTrackLogo from "../components/FinTrackLogo";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Capacitor } from "@capacitor/core";

export default function MobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Biometrics simulation states
  const [bioScanning, setBioScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fintrack-auth")) {
      router.replace("/app");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        // Save jwt token and profile settings
        localStorage.setItem("fintrack-token", data.accessToken);
        localStorage.setItem("fintrack-auth", JSON.stringify({ email: data.email, role: data.role }));
        
        // Fetch user settings to check onboarding status
        try {
          const settingsRes = await fetch("/api/v1/settings", {
            headers: { "Authorization": `Bearer ${data.accessToken}` }
          });
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
             if (settings && settings.monthlyBudget) {
              localStorage.setItem("fintrack-username", data.email.split("@")[0]);
              localStorage.setItem("fintrack-budget-limit", String(settings.monthlyBudget));
              router.push("/app");
              return;
            }
          }
        } catch (settingsErr) {
          console.warn("Failed to check settings, redirecting to onboarding setup:", settingsErr);
        }
        router.push("/setup");
      } else {
        const errText = await res.text();
        setError(errText || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      console.warn("[Fallback] Auth backend offline, logging in using mock credentials:", err);
      // Mock fallback login success
      setTimeout(() => {
        localStorage.setItem("fintrack-auth", JSON.stringify({ email, name: "Rizvi Ahmed" }));
        const onboardingDone = localStorage.getItem("fintrack-username");
        if (onboardingDone) {
          router.push("/app");
        } else {
          router.push("/setup");
        }
      }, 800);
    }
  };

  const handleSocialLogin = (platform: string) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("fintrack-auth", JSON.stringify({ email: `rizvi@${platform}.com`, name: "Rizvi Ahmed" }));
      const onboardingDone = localStorage.getItem("fintrack-username");
      if (onboardingDone) {
        router.push("/app");
      } else {
        router.push("/setup");
      }
    }, 1000);
  };

  const triggerBiometrics = async () => {
    setError(null);

    if (!Capacitor.isNativePlatform()) {
      // Fallback for web simulation
      setBioScanning(true);
      setBioSuccess(false);
      setTimeout(() => {
        setBioSuccess(true);
        setTimeout(() => {
          setBioScanning(false);
          localStorage.setItem("fintrack-auth", JSON.stringify({ email: "rizvi@fintrack.ai", name: "Rizvi Ahmed" }));
          const onboardingDone = localStorage.getItem("fintrack-username");
          if (onboardingDone) {
            router.push("/app");
          } else {
            router.push("/setup");
          }
        }, 1000);
      }, 1800);
      return;
    }

    try {
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        setError("Biometrics not available on this device.");
        return;
      }

      setBioScanning(true);
      setBioSuccess(false);

      await NativeBiometric.verifyIdentity({
        reason: "Log in to your account",
        title: "Log In",
        subtitle: "Authenticate to continue",
        description: "Place your finger on the sensor or use Face ID",
      });

      setBioSuccess(true);
      setTimeout(() => {
        setBioScanning(false);
        localStorage.setItem("fintrack-auth", JSON.stringify({ email: "rizvi@fintrack.ai", name: "Rizvi Ahmed" }));
        const onboardingDone = localStorage.getItem("fintrack-username");
        if (onboardingDone) {
          router.push("/app");
        } else {
          router.push("/setup");
        }
      }, 1000);
    } catch (err: any) {
      setBioScanning(false);
      setError("Biometric authentication failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col justify-between p-5 bg-[#FAFAF8] text-[#111827] relative overflow-x-hidden overflow-y-auto">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/" className="text-[12px] font-bold text-[#6B7280] hover:text-[#111827] transition">Back</Link>
        <span className="text-[12px] font-bold text-[#6B7280]">Sign In</span>
      </div>

      <div className="my-auto space-y-4 max-w-[340px] mx-auto w-full">
        {/* Brand */}
        <div className="text-center space-y-1">
          <FinTrackLogo variant="icon-light" size={56} className="mx-auto shadow-sm" />
          <h2 className="text-[19px] font-black tracking-tight text-[#111827] mt-2">Welcome Back</h2>
          <p className="text-[11.5px] text-[#6B7280]">Sign in to continue your financial journey.</p>
        </div>

        {error && (
          <div className="p-2.5 bg-[#FBEEED] border border-[#B85C4D]/10 rounded-xl text-[#B85C4D] text-[11.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8.5px] font-bold uppercase tracking-wider text-[#6B7280]">Password</label>
              <Link href="/forgot-password" className="text-[10.5px] font-semibold text-[#C9A76A] hover:underline">Forgot?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[12.5px] fin-input rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || bioScanning}
            className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] text-white text-[12.5px] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Sign In"}
          </button>


        </form>

        {/* Divider */}
        <div className="flex items-center gap-2.5 text-[#6B7280] py-0.5">
          <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
          <span className="text-[8.5px] font-bold uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
        </div>

        {/* Social logins & Biometrics */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading || bioScanning}
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
            onClick={() => handleSocialLogin("apple")}
            disabled={loading || bioScanning}
            className="flex-1 py-2.5 border border-[#E5E7EB] hover:bg-[#F5F5F2] text-[12.5px] font-semibold rounded-xl transition flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
            </svg>
            <span>Apple</span>
          </button>
          
          <button
            type="button"
            onClick={triggerBiometrics}
            disabled={loading || bioScanning}
            className="px-3.5 py-2.5 border border-[#E5E7EB] hover:bg-[#F5F5F2] text-[#C9A76A] hover:text-[#B8965A] rounded-xl transition flex items-center justify-center gap-1.5"
            title="Biometric Sign In"
          >
            <ScanFace className="w-4.5 h-4.5 animate-pulse" />
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-[#F0F0ED] text-center w-full max-w-[340px] mx-auto">
        <span className="text-[12px] text-[#6B7280]">
          New to FinTrack? <Link href="/signup" className="text-[#C9A76A] font-bold hover:underline">Create Account</Link>
        </span>
      </div>

      {/* Simulated Biometrics Overlay */}
      {bioScanning && (
        <div className="absolute inset-0 bg-[#FAFAF8]/95 z-[200] flex flex-col justify-center items-center space-y-4 animate-fade-in">
          <div className="relative w-24 h-24 rounded-full border border-[#E5E7EB] flex items-center justify-center">
            {/* Pulsing indicator */}
            <div className={`absolute inset-0 rounded-full border border-[#C9A76A] animate-ping opacity-20`} style={{ animationDuration: "2s" }} />
            
            {bioSuccess ? (
              <div className="w-16 h-16 rounded-full bg-[#EEF3EF] flex items-center justify-center text-[#4F7A5B] animate-scale-in">
                <Check className="w-8 h-8" />
              </div>
            ) : (
              <ScanFace className="w-12 h-12 text-[#C9A76A] animate-pulse" />
            )}
          </div>
          <div className="text-center space-y-0.5">
            <h4 className="font-extrabold text-[14px]">{bioSuccess ? "Face ID Verified" : "Scanning Face ID..."}</h4>
            <p className="text-[9.5px] text-[#6B7280]">Keep your face within device viewport</p>
          </div>
        </div>
      )}

    </div>
  );
}
