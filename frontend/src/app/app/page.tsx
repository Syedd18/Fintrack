"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  Activity,
  Bot,
  Target,
  User,
  Sparkles,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Copy,
  Check,
  Shield,
  TrendingUp,
  Smartphone,
  Laptop,
  Send,
  Plus,
  Star,
  Calendar,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  Wifi,
  Music,
  Globe,
  Lock,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  Tag,
  MessageSquare,
  Bookmark,
  ArrowUpRight,
  Key,
  Terminal,
  Database,
  Play,
  Coffee,
  Banknote,
  Heart,
  Palette,
  Trash2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const TRANSACTIONS = [
  { id: "1", merchant: "Swiggy", initials: "SW", category: "Food & Dining", amount: -350, time: "9:00 PM", date: "Today", balanceAfter: 24217, type: "expense", bgColor: "bg-orange-50 dark:bg-orange-500/10", iconColor: "text-orange-500" },
  { id: "2", merchant: "Uber", initials: "UB", category: "Transport", amount: -180, time: "6:15 PM", date: "Today", balanceAfter: 24567, type: "expense", bgColor: "bg-slate-100 dark:bg-slate-500/10", iconColor: "text-slate-600" },
  { id: "3", merchant: "Salary Credit", initials: "₹", category: "Income", amount: 45000, time: "12:00 PM", date: "Today", balanceAfter: 24747, type: "income", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600" },
  { id: "4", merchant: "Netflix", initials: "N", category: "Subscriptions", amount: -299, time: "10:00 PM", date: "Yesterday", balanceAfter: 25046, type: "subscription", bgColor: "bg-red-50 dark:bg-red-500/10", iconColor: "text-red-500" },
  { id: "5", merchant: "Starbucks", initials: "SB", category: "Food & Dining", amount: -450, time: "8:45 AM", date: "Yesterday", balanceAfter: 25345, type: "expense", bgColor: "bg-amber-50 dark:bg-amber-500/10", iconColor: "text-amber-600" },
  { id: "6", merchant: "Amazon", initials: "A", category: "Shopping", amount: -2199, time: "3:30 PM", date: "Yesterday", balanceAfter: 25795, type: "expense", bgColor: "bg-yellow-50 dark:bg-yellow-500/10", iconColor: "text-yellow-600" },
  { id: "7", merchant: "Freelance", initials: "₹", category: "Income", amount: 8500, time: "11:00 AM", date: "Jun 8", balanceAfter: 27994, type: "income", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600" },
  { id: "8", merchant: "Zomato", initials: "Z", category: "Food & Dining", amount: -780, time: "1:20 PM", date: "Jun 8", balanceAfter: 19494, type: "expense", bgColor: "bg-orange-50 dark:bg-orange-500/10", iconColor: "text-orange-500" },
  { id: "9", merchant: "Spotify", initials: "S", category: "Subscriptions", amount: -119, time: "12:00 AM", date: "Jun 7", balanceAfter: 20274, type: "subscription", bgColor: "bg-green-50 dark:bg-green-500/10", iconColor: "text-green-500" },
  { id: "10", merchant: "PhonePe Transfer", initials: "PP", category: "Transfer", amount: -5000, time: "4:00 PM", date: "Jun 7", balanceAfter: 20393, type: "transfer", bgColor: "bg-purple-50 dark:bg-purple-500/10", iconColor: "text-purple-500" },
];

const BUDGET_CATEGORIES_INIT = [
  { name: "Food", spent: 3200, limit: 6000, color: "#4F7A5B", status: "Safe" },
  { name: "Shopping", spent: 4800, limit: 5000, color: "#C9964B", status: "Watch" },
  { name: "Travel", spent: 2800, limit: 2500, color: "#B85C4D", status: "Over" },
  { name: "Entertainment", spent: 1200, limit: 3000, color: "#64748B", status: "Safe" },
];

const UPCOMING_PAYMENTS = [
  { name: "Netflix", amount: 299, date: "Jun 15", initials: "N", bgColor: "bg-red-50 dark:bg-red-500/10", textColor: "text-red-500" },
  { name: "Spotify", amount: 119, date: "Jun 18", initials: "S", bgColor: "bg-green-50 dark:bg-green-500/10", textColor: "text-green-500" },
  { name: "Internet Bill", amount: 999, date: "Jun 20", initials: "W", bgColor: "bg-blue-50 dark:bg-blue-500/10", textColor: "text-blue-500" },
];

const GOALS_INIT = [
  { id: "g1", name: "Emergency Fund", emoji: "🛡️", saved: 45000, target: 100000, color: "#4F7A5B", eta: "Mar 2026", tip: "Add ₹5,000/month to reach your goal on time." },
  { id: "g2", name: "MacBook Pro", emoji: "💻", saved: 82000, target: 120000, color: "#64748B", eta: "Aug 2025", tip: "You're 68% there! Just 4 more months." },
  { id: "g3", name: "Goa Vacation", emoji: "✈️", saved: 12000, target: 35000, color: "#C9A76A", eta: "Dec 2025", tip: "Set aside ₹3,800/month for your trip." },
  { id: "g4", name: "New Bike", emoji: "🏍️", saved: 28000, target: 85000, color: "#B85C4D", eta: "Jun 2026", tip: "Consider reducing dining out to accelerate." },
  { id: "g5", name: "Investment", emoji: "📈", saved: 150000, target: 200000, color: "#A8B5A2", eta: "Feb 2026", tip: "75% reached! You're almost there." },
];

const AI_MESSAGES: { role: "ai" | "user"; content: string; cards?: { label: string; value: string; trend?: string }[] }[] = [
  {
    role: "ai",
    content: "Good evening Rizvi! Here's your financial pulse for today. You're doing well — spending is 12% below your daily average.",
    cards: [
      { label: "Today's Spend", value: "₹530", trend: "-23%" },
      { label: "Weekly Avg", value: "₹680/day" },
      { label: "Month Savings", value: "₹12,300", trend: "+18%" },
    ],
  },
  { role: "user", content: "Where did most of my money go this month?" },
  {
    role: "ai",
    content: "Your top spending categories this month are:\n\n1. **Food & Dining** — ₹5,400 (32%)\n2. **Shopping** — ₹4,800 (28%)\n3. **Transport** — ₹2,800 (16%)\n\nFood spending has been consistent, but Shopping spiked due to a ₹2,199 Amazon purchase. Consider setting a stricter shopping budget next month.",
  },
  { role: "user", content: "Can I afford a MacBook this month?" },
  {
    role: "ai",
    content: "Based on your current savings rate of ₹12,300/month and your MacBook goal of ₹1,20,000 — you've already saved ₹82,000. You need ₹38,000 more.\n\nIf you maintain your current rate, you'll reach your goal by **August 2025**. I wouldn't recommend buying it this month as it would significantly impact your emergency fund.",
  },
];

const SUGGESTED_PROMPTS = [
  "Where did most money go?",
  "Can I afford a MacBook?",
  "How can I save more?",
  "Am I on budget this week?",
];

const DEVICES = [
  { id: "d1", name: "Rizvi's Pixel 8 Pro", type: "phone", status: "Active", lastSeen: "Just now", location: "Mumbai" },
  { id: "d2", name: "Rizvi's MacBook Pro", type: "laptop", status: "Active", lastSeen: "2m ago", location: "Mumbai" },
];

const API_KEYS_INIT = [
  { id: "k1", name: "Primary_Android_Relay", hash: "sha256:7483...912a", status: "Active", created: "Nov 14, 2024" },
  { id: "k2", name: "Sandbox_Testing", hash: "sha256:fe92...283c", status: "Active", created: "Nov 15, 2024" },
];

// ═══════════════════════════════════════════════════════════════
// PROGRESS RING COMPONENT
// ═══════════════════════════════════════════════════════════════

function ProgressRing({ progress, size = 64, strokeWidth = 4, color = "#C9A76A" }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference - (progress / 100) * circumference), 300);
    return () => clearTimeout(t);
  }, [progress, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} className="goal-ring-track" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} className="goal-ring-progress" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════

export default function FinTrackApp() {
  const router = useRouter();
  // Authentication & Dynamic Hydration States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("Rizvi Ahmed");
  const [budgetsList, setBudgetsList] = useState(BUDGET_CATEGORIES_INIT);
  const [goalsList, setGoalsList] = useState(GOALS_INIT);
  const [transactionsState, setTransactionsState] = useState(TRANSACTIONS);

  // Theme
  const [isDark, setIsDark] = useState(false);

  // Navigation
  const [activePage, setActivePage] = useState<"home" | "activity" | "copilot" | "goals" | "profile">("home");
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Activity
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);

  // Copilot
  const [chatMessages, setChatMessages] = useState(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Profile
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState(API_KEYS_INIT);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Simulated Webhook
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Hydration and authentication sync
  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem("fintrack-auth");
    if (!auth) {
      setIsAuthenticated(false);
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);

    // Theme persistence
    const savedTheme = localStorage.getItem("fintrack-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    // Onboarding Data Sync
    const savedName = localStorage.getItem("fintrack-username");
    if (savedName) {
      setUserName(savedName);
    }

    const savedBudgetLimit = localStorage.getItem("fintrack-budget-limit");
    if (savedBudgetLimit) {
      const budgetVal = parseInt(savedBudgetLimit, 10);
      if (!isNaN(budgetVal)) {
        setBudgetsList([
          { name: "Food", spent: 3200, limit: Math.round(budgetVal * 0.4), color: "#4F7A5B", status: "Safe" },
          { name: "Shopping", spent: 4800, limit: Math.round(budgetVal * 0.35), color: "#C9964B", status: "Watch" },
          { name: "Travel", spent: 2800, limit: Math.round(budgetVal * 0.15), color: "#B85C4D", status: "Over" },
          { name: "Entertainment", spent: 1200, limit: Math.round(budgetVal * 0.1), color: "#64748B", status: "Safe" },
        ]);
      }
    }

    const savedFirstGoal = localStorage.getItem("fintrack-first-goal");
    if (savedFirstGoal) {
      try {
        const goalObj = JSON.parse(savedFirstGoal);
        setGoalsList((prev) => {
          if (prev.some((g) => g.id === "g_custom")) return prev;
          return [
            {
              id: "g_custom",
              name: goalObj.name,
              emoji: goalObj.emoji || "🎯",
              saved: Math.round(goalObj.target * 0.1),
              target: goalObj.target,
              color: "#C9A76A",
              eta: "Dec 2026",
              tip: `Great start! Set aside ₹${Math.round(goalObj.target / 12).toLocaleString()}/month to finish setup on time.`,
            },
            ...prev,
          ];
        });
      } catch (e) {
        console.error("Failed to parse onboarding goal:", e);
      }
    }

    const savedPairingKey = localStorage.getItem("fintrack-pairing-key");
    if (savedPairingKey) {
      setApiKeys((prev) => {
        if (prev.some((k) => k.id === "k_onboarding")) return prev;
        return [
          {
            id: "k_onboarding",
            name: "Android_Relay_Onboarding",
            hash: savedPairingKey.slice(0, 11) + "...",
            status: "Active",
            created: "Just now",
          },
          ...prev,
        ];
      });
    }

    const fetchBackendData = async () => {
      const token = localStorage.getItem("fintrack-token");
      if (!token) return;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      try {
        // 1. Fetch user settings
        const settingsRes = await fetch("/api/v1/settings", { headers });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData) {
            if (settingsData.monthlyBudget) {
              setBudgetsList([
                { name: "Food", spent: 3200, limit: Math.round(settingsData.monthlyBudget * 0.4), color: "#4F7A5B", status: "Safe" },
                { name: "Shopping", spent: 4800, limit: Math.round(settingsData.monthlyBudget * 0.35), color: "#C9964B", status: "Watch" },
                { name: "Travel", spent: 2800, limit: Math.round(settingsData.monthlyBudget * 0.15), color: "#B85C4D", status: "Over" },
                { name: "Entertainment", spent: 1200, limit: Math.round(settingsData.monthlyBudget * 0.1), color: "#64748B", status: "Safe" },
              ]);
            }
          }
        }

        // 2. Fetch API keys
        const keysRes = await fetch("/api/v1/settings/api-keys", { headers });
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          const mappedKeys = keysData.map((k: any) => ({
            id: k.id,
            name: k.keyName,
            hash: `sha256:${k.id.slice(0, 4)}...${k.id.slice(-4)}`,
            status: k.status === 'ACTIVE' ? 'Active' : 'Revoked',
            created: new Date(k.createdAt).toLocaleDateString()
          }));
          setApiKeys(mappedKeys);
        }

        // 3. Fetch transactions
        const txRes = await fetch("/api/v1/transactions?page=0&size=20", { headers });
        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData && txData.content && txData.content.length > 0) {
            const mappedTx = txData.content.map((t: any) => {
              const isExpense = t.amount < 0 || t.notes?.toLowerCase().includes("debit") || t.notes?.toLowerCase().includes("spent") || t.source === "SMS";
              return {
                id: t.id,
                merchant: t.merchant || "Unknown",
                initials: t.merchant ? t.merchant.substring(0, 2).toUpperCase() : "TX",
                category: t.category || "General",
                amount: t.amount,
                time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(t.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                balanceAfter: t.balance || 0,
                type: isExpense ? "expense" : "income",
                bgColor: isExpense ? "bg-orange-50 dark:bg-orange-500/10" : "bg-emerald-50 dark:bg-emerald-500/10",
                iconColor: isExpense ? "text-orange-500" : "text-emerald-600"
              };
            });
            setTransactionsState(mappedTx);
          }
        }
      } catch (e) {
        console.warn("[Fallback] Failed to fetch live backend data, keeping simulated mocks:", e);
      }
    };

    fetchBackendData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fintrack-auth");
    router.push("/login");
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fintrack-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fintrack-theme", "light");
    }
  };

  // Scroll-based nav hide/show
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      setNavVisible(y <= lastScrollY.current || y < 80);
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activePage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setNavVisible(true);
    lastScrollY.current = 0;
  }, [activePage]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMessages((p) => [...p, { role: "user", content: chatInput.trim() }]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((p) => [
        ...p,
        {
          role: "ai",
          content: `Great question! Based on your financial data, your current savings rate is excellent at 38%, and you're on track to meet your financial goals. Would you like a detailed breakdown?`,
        },
      ]);
    }, 1800);
  }, [chatInput]);

  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    const token = localStorage.getItem("fintrack-token");
    if (!token) {
      const plain = "ft_live_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
      const hash = "sha256:" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setGeneratedKey(plain);
      setApiKeys((p) => [...p, { id: String(p.length + 1), name: newKeyName, hash, status: "Active", created: "Today" }]);
      setNewKeyName("");
      return;
    }

    try {
      const res = await fetch(`/api/v1/settings/api-keys?keyName=${encodeURIComponent(newKeyName)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.plainKey);
        setApiKeys((p) => [
          ...p,
          {
            id: data.id,
            name: data.keyName,
            hash: `sha256:${data.id.slice(0, 4)}...${data.id.slice(-4)}`,
            status: data.status === "ACTIVE" ? "Active" : "Revoked",
            created: new Date(data.createdAt).toLocaleDateString()
          }
        ]);
        setNewKeyName("");
      }
    } catch (e) {
      console.warn("[Fallback] API Key generation backend error:", e);
      const plain = "ft_live_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
      const hash = "sha256:" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setGeneratedKey(plain);
      setApiKeys((p) => [...p, { id: String(p.length + 1), name: newKeyName, hash, status: "Active", created: "Today" }]);
      setNewKeyName("");
    }
  };

  const handleRevokeKey = async (id: string) => {
    const token = localStorage.getItem("fintrack-token");
    if (!token) {
      setApiKeys((p) => p.filter((k) => k.id !== id));
      return;
    }

    try {
      const res = await fetch(`/api/v1/settings/api-keys/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setApiKeys((p) => p.filter((k) => k.id !== id));
      } else {
        setApiKeys((p) => p.filter((k) => k.id !== id));
      }
    } catch (e) {
      console.warn("[Fallback] Key revocation backend error:", e);
      setApiKeys((p) => p.filter((k) => k.id !== id));
    }
  };

  const handleCopyKey = (k: string) => {
    navigator.clipboard.writeText(k);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSimulateWebhook = () => {
    setWebhookStatus("Simulating webhook event...");
    setTimeout(() => {
      setWebhookStatus("Webhook delivered: HDFCBank transaction Rs.350 synced successfully!");
      setTimeout(() => setWebhookStatus(null), 3000);
    }, 1500);
  };

  // Filter transactions
  const filtered = transactionsState.filter((t) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Income") return t.type === "income";
    if (activeFilter === "Expenses") return t.type === "expense";
    if (activeFilter === "Transfers") return t.type === "transfer";
    if (activeFilter === "Subscriptions") return t.type === "subscription";
    return true;
  }).filter((t) => !searchQuery || t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const grouped = filtered.reduce<Record<string, typeof TRANSACTIONS>>((a, t) => {
    if (!a[t.date]) a[t.date] = [];
    a[t.date].push(t);
    return a;
  }, {});

  const NAV = [
    { id: "home" as const, icon: HomeIcon, label: "Home" },
    { id: "activity" as const, icon: Activity, label: "Activity" },
    { id: "copilot" as const, icon: Bot, label: "Copilot" },
    { id: "goals" as const, icon: Target, label: "Goals" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-gold)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-hidden transition-colors duration-300">
      <div ref={scrollRef} className="h-screen overflow-y-auto pb-36" style={{ scrollBehavior: "smooth" }}>
        
        {/* ═══════════════ PAGE 1 — HOME ═══════════════ */}
        {activePage === "home" && (
          <div className="page-active px-5 pt-14 pb-8 space-y-7">
            {/* Header */}
            <header className="flex justify-between items-start gap-3 animate-fade-in-up">
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight leading-tight truncate">{getGreeting()}, {userName.split(" ")[0]} 👋</h1>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 truncate">Your finances are looking healthy today</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="relative p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] flex-shrink-0">
                  <Bell className="w-[18px] h-[18px] text-[var(--text-muted)]" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#C9A76A] rounded-full" />
                </button>
                <button onClick={handleLogout} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[#B85C4D]/30 flex-shrink-0 transition">
                  <LogOut className="w-[18px] h-[18px] text-[var(--text-muted)]" />
                </button>
              </div>
            </header>

            {/* Financial Health Score */}
            <div className="fin-card p-4 min-[360px]:p-5 sm:p-6 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <div className="flex items-center gap-4 min-[360px]:gap-6">
                <div className="relative flex-shrink-0">
                  <ProgressRing progress={86} size={80} strokeWidth={4.5} color="#4F7A5B" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl min-[360px]:text-2xl font-extrabold leading-none">86</span>
                    <span className="text-[9px] min-[360px]:text-[10px] text-[var(--text-disabled)] font-medium">/100</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[10px] min-[360px]:text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Financial Health</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold badge-sage">Excellent</span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-[10px] min-[360px]:text-[11px] text-[var(--text-disabled)]">Projected Month-End</span>
                    <div className="flex flex-wrap items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl min-[360px]:text-2xl font-extrabold tracking-tight">₹31,200</span>
                      <span className="text-[10px] min-[360px]:text-[11px] font-bold text-[#4F7A5B] flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +18%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="fin-card p-4 min-[360px]:p-5 border-l-[3px] border-l-[#C9A76A] animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#C9A76A]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">AI Financial Summary</span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">
                You spent <span className="font-bold text-[#4F7A5B]">₹420 less</span> than usual today.
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] mt-1.5">
                Food spending dropped 12% this week. You are projected to save <span className="font-semibold text-[var(--text-primary)]">₹6,800</span> this month.
              </p>
              <button onClick={() => setActivePage("copilot")} className="mt-3 text-[12px] font-semibold text-[#C9A76A] flex items-center gap-1 hover:gap-2 transition-all">
                Ask a follow-up <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Budget Strip */}
            <div className="animate-fade-in-up stagger-3 overflow-hidden" style={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Budget Overview</span>
                <button onClick={() => setActivePage("goals")} className="text-[11px] font-semibold text-[#C9A76A] flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-5 px-5" style={{ scrollSnapType: "x mandatory" }}>
                {budgetsList.map((cat) => {
                  const pct = Math.min((cat.spent / cat.limit) * 100, 100);
                  return (
                    <div key={cat.name} className="fin-card p-4 min-w-[140px] xs:min-w-[148px] flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                      <span className="text-[13px] font-bold block mb-3 truncate">{cat.name}</span>
                      <div className="h-[5px] bg-[var(--bg-inset)] rounded-full overflow-hidden mb-2.5">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: cat.color }} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] text-[var(--text-disabled)] flex-shrink-0">₹{cat.spent.toLocaleString()}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full truncate" style={{ background: `${cat.color}12`, color: cat.color }}>
                          {cat.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Recent Activity</span>
                <button onClick={() => setActivePage("activity")} className="text-[11px] font-semibold text-[#C9A76A] flex items-center gap-0.5">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="fin-card overflow-hidden divide-y divide-[var(--border-subtle)]">
                {transactionsState.slice(0, 4).map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold ${txn.bgColor} ${txn.iconColor}`}>
                        {txn.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[14px] font-semibold block truncate">{txn.merchant}</span>
                        <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5 truncate">{txn.category} · {txn.time}</span>
                      </div>
                    </div>
                    <span className={`text-[14px] font-bold flex-shrink-0 ${txn.amount > 0 ? "text-[#4F7A5B]" : ""}`}>
                      {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Payments */}
            <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-3">Upcoming Payments</span>
              <div className="space-y-2.5">
                {UPCOMING_PAYMENTS.map((p) => (
                  <div key={p.name} className="fin-card px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold ${p.bgColor} ${p.textColor}`}>
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[14px] font-semibold block truncate">{p.name}</span>
                        <span className="text-[11px] text-[var(--text-disabled)] flex items-center gap-1 truncate"><Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-disabled)]" /> {p.date}</span>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold flex-shrink-0">₹{p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 2 — ACTIVITY ═══════════════ */}
        {activePage === "activity" && (
          <div className="page-active px-5 pt-14 pb-8 space-y-5">
            <header className="animate-fade-in-up">
              <h1 className="text-[22px] font-bold tracking-tight">Activity</h1>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Your complete transaction history</p>
            </header>

            {/* Search */}
            <div className="relative animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
              <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 text-[14px] fin-input" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-0.5 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              {["All", "Income", "Expenses", "Transfers", "Subscriptions"].map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} className={`filter-chip ${activeFilter === f ? "filter-chip-active" : "filter-chip-inactive"}`}>{f}</button>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-5 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
              {Object.entries(grouped).map(([date, txns]) => (
                <div key={date}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] block mb-2.5 px-1">{date}</span>
                  <div className="fin-card overflow-hidden divide-y divide-[var(--border-subtle)]">
                    {txns.map((txn) => {
                      const isExp = expandedTxn === txn.id;
                      return (
                        <div key={txn.id}>
                          <button onClick={() => setExpandedTxn(isExp ? null : txn.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold ${txn.bgColor} ${txn.iconColor}`}>
                                {txn.initials}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[14px] font-semibold block truncate">{txn.merchant}</span>
                                <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5 truncate">{txn.category} · {txn.time}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[14px] font-bold block ${txn.amount > 0 ? "text-[#4F7A5B]" : ""}`}>
                                {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[var(--text-disabled)] mt-0.5 block">Bal: ₹{txn.balanceAfter.toLocaleString()}</span>
                            </div>
                          </button>
                          {isExp && (
                            <div className="px-4 pb-3 pt-1 flex gap-2 animate-fade-in">
                              {[{ icon: Tag, label: "Categorize" }, { icon: MessageSquare, label: "Add Note" }, { icon: Bookmark, label: "Important" }].map((a) => {
                                const AIcon = a.icon;
                                return (
                                  <button key={a.label} className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-center gap-1.5 hover:text-[var(--text-primary)] transition">
                                    <AIcon className="w-3.5 h-3.5" /> {a.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-3 opacity-50" />
                  <p className="text-[14px] text-[var(--text-muted)]">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 3 — AI COPILOT ═══════════════ */}
        {activePage === "copilot" && (
          <div className="page-active flex flex-col h-screen">
            <header className="px-5 pt-14 pb-4 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-[#C9A76A] flex items-center justify-center">
                  <Sparkles className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">AI Copilot</h1>
                  <span className="text-[11px] text-[var(--text-muted)]">Your personal financial assistant</span>
                </div>
              </div>

              {/* Snapshot */}
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-0.5">
                {[
                  { label: "Spent", value: "₹18,400" },
                  { label: "Saved", value: "₹12,300", color: "#4F7A5B" },
                  { label: "Projected", value: "₹7,000", color: "#C9A76A" },
                ].map((s) => (
                  <div key={s.label} className="fin-card px-4 py-3 min-w-[112px] flex-shrink-0">
                    <span className="text-[9px] text-[var(--text-disabled)] font-semibold uppercase tracking-wider block">{s.label}</span>
                    <span className="text-[15px] font-extrabold mt-0.5 block" style={s.color ? { color: s.color } : {}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </header>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`max-w-[88%] animate-fade-in-up ${msg.role === "user" ? "ml-auto" : "mr-auto"}`} style={{ animationDelay: `${i * 0.04}s` }}>
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3 h-3 text-[#C9A76A]" />
                      <span className="text-[9px] font-bold text-[var(--text-disabled)] uppercase tracking-wider">FinTrack AI</span>
                    </div>
                  )}
                  <div className={msg.role === "ai" ? "chat-bubble-ai p-4" : "chat-bubble-user p-4"}>
                    <p className="text-[13px] leading-[1.7] whitespace-pre-line break-words overflow-wrap-break-word">
                      {msg.content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
                          : <span key={j} className={msg.role === "ai" ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}>{part}</span>
                      )}
                    </p>
                    {msg.cards && (
                      <div className="grid grid-cols-3 gap-1.5 min-[360px]:gap-2 mt-3">
                        {msg.cards.map((c) => (
                          <div key={c.label} className="bg-[var(--bg-inset)] rounded-xl p-1.5 min-[360px]:p-2.5 min-w-0">
                            <span className="text-[7.5px] min-[360px]:text-[9px] text-[var(--text-disabled)] font-bold uppercase block truncate">{c.label}</span>
                            <span className="text-[11px] min-[360px]:text-[13px] font-extrabold block mt-0.5 truncate">{c.value}</span>
                            {c.trend && <span className="text-[9px] min-[360px]:text-[10px] font-bold text-[#4F7A5B] block truncate">{c.trend}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="max-w-[88%] mr-auto animate-fade-in">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#C9A76A]" />
                    <span className="text-[9px] font-bold text-[var(--text-disabled)] uppercase tracking-wider">FinTrack AI</span>
                  </div>
                  <div className="chat-bubble-ai p-4 flex gap-1.5">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Prompts */}
            {chatMessages.length <= 6 && (
              <div className="pb-2 overflow-hidden">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button key={p} onClick={() => setChatInput(p)} className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[11px] font-semibold text-[var(--text-secondary)] whitespace-nowrap hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition flex-shrink-0">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-5 pb-28 pt-2">
              <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl px-4 py-1">
                <input type="text" placeholder="Ask FinTrack anything..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChat()} className="flex-1 bg-transparent text-[14px] py-3 outline-none placeholder:text-[var(--text-disabled)]" />
                <button onClick={handleSendChat} disabled={!chatInput.trim()} className="w-8 h-8 rounded-xl bg-[#C9A76A] flex items-center justify-center disabled:opacity-30 transition">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 4 — GOALS ═══════════════ */}
        {activePage === "goals" && (
          <div className="page-active px-5 pt-14 pb-8 space-y-6">
            <header className="animate-fade-in-up">
              <h1 className="text-[22px] font-bold tracking-tight">Goals</h1>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Track your financial dreams</p>
            </header>

            {/* Summary */}
            <div className="fin-card p-6 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[var(--text-disabled)] font-semibold uppercase tracking-wider block">Total Saved</span>
                  <span className="text-2xl font-extrabold mt-1 block tracking-tight">₹3,17,000</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[var(--text-disabled)] font-semibold uppercase tracking-wider block">Active Goals</span>
                  <span className="text-2xl font-extrabold mt-1 block">{goalsList.length}</span>
                </div>
              </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-2 gap-2.5 min-[360px]:gap-3 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              {goalsList.map((g) => {
                const pct = Math.round((g.saved / g.target) * 100);
                return (
                  <div key={g.id} className="fin-card fin-card-interactive p-3.5 min-[360px]:p-5 flex flex-col items-center text-center min-w-0">
                    <div className="relative mb-2">
                      <ProgressRing progress={pct} size={64} strokeWidth={4} color={g.color} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg">{g.emoji}</span>
                      </div>
                    </div>
                    <span className="text-[12px] min-[360px]:text-[13px] font-bold mt-1.5 truncate w-full">{g.name}</span>
                    <span className="text-[10px] min-[360px]:text-[11px] text-[var(--text-disabled)] mt-1 truncate w-full">₹{(g.saved / 1000).toFixed(0)}k / ₹{(g.target / 1000).toFixed(0)}k</span>
                    <span className="text-[9px] min-[360px]:text-[10px] font-bold mt-2 px-2.5 py-1 rounded-full truncate" style={{ background: `${g.color}12`, color: g.color }}>
                      {pct}% Complete
                    </span>
                    <span className="text-[9px] min-[360px]:text-[10px] text-[var(--text-disabled)] mt-1.5">ETA: {g.eta}</span>
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] w-full">
                      <p className="text-[9px] min-[360px]:text-[10px] text-[var(--text-muted)] leading-relaxed text-left line-clamp-2">
                        <Sparkles className="w-2.5 h-2.5 text-[#C9A76A] inline mr-1 flex-shrink-0" />{g.tip}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* New Goal */}
              <button className="rounded-[20px] border-2 border-dashed border-[var(--border-primary)] p-3.5 min-[360px]:p-5 flex flex-col items-center justify-center text-center hover:border-[#C9A76A] transition min-h-[200px] min-[360px]:min-h-[220px] group">
                <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3 group-hover:bg-[var(--accent-gold-light)] transition">
                  <Plus className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 text-[var(--text-disabled)] group-hover:text-[#C9A76A] transition" />
                </div>
                <span className="text-[12px] min-[360px]:text-[13px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition">Create New Goal</span>
                <span className="text-[9px] min-[360px]:text-[10px] text-[var(--text-disabled)] mt-1">Set a savings target</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 5 — PROFILE ═══════════════ */}
        {activePage === "profile" && (
          <div className="page-active px-5 pt-14 pb-8 space-y-6">
            {/* User Header */}
            <div className="flex items-center gap-4 animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] flex items-center justify-center bg-white flex-shrink-0">
                <img src="/logo_monogram.png" alt="Profile Avatar" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{userName}</h1>
                <span className="text-[12px] text-[var(--text-muted)] block">rizvi@fintrack.ai</span>
                <span className="text-[10px] font-bold badge-gold px-2.5 py-1 rounded-full mt-1.5 inline-block">Premium Member</span>
              </div>
            </div>

            {/* Account */}
            <div className="space-y-2 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] block px-1 mb-1">Account</span>
              {[
                { icon: User, label: "Personal Profile", sub: "Name, email, phone" },
                { icon: CreditCard, label: "Connected Banks", sub: "HDFC, SBI, ICICI" },
                { icon: Smartphone, label: "Connected Devices", sub: `${DEVICES.length} devices active` },
              ].map((item) => {
                const I = item.icon;
                return (
                  <button key={item.label} className="w-full fin-card px-4 py-3.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center"><I className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                      <div className="text-left min-w-0">
                        <span className="text-[14px] font-semibold block truncate">{item.label}</span>
                        <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5 truncate">{item.sub}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Preferences */}
            <div className="space-y-2 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] block px-1 mb-1">Preferences</span>
              {[
                { icon: Bell, label: "Notifications", sub: "Push, email, SMS alerts" },
                { icon: Lock, label: "Security", sub: "Biometrics, 2FA, PIN" },
                { icon: Star, label: "Subscription", sub: "Premium · Active" },
              ].map((item) => {
                const I = item.icon;
                return (
                  <button key={item.label} className="w-full fin-card px-4 py-3.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center"><I className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                      <div className="text-left min-w-0">
                        <span className="text-[14px] font-semibold block truncate">{item.label}</span>
                        <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5 truncate">{item.sub}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] flex-shrink-0" />
                  </button>
                );
              })}

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="w-full fin-card px-4 py-3.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center">
                    {isDark ? <Moon className="w-[18px] h-[18px] text-[var(--text-muted)]" /> : <Sun className="w-[18px] h-[18px] text-[var(--text-muted)]" />}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[14px] font-semibold block truncate">Appearance</span>
                    <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5 truncate">{isDark ? "Dark mode" : "Light mode"}</span>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-[#C9A76A]" : "bg-[var(--border-primary)]"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>
            </div>

            {/* Developer Tools */}
            <div className="space-y-2 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] block px-1 mb-1">Developer Tools</span>

              {/* SMS Gateway */}
              <div className="fin-card overflow-hidden">
                <button onClick={() => setExpandedSection(expandedSection === "gateway" ? null : "gateway")} className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center"><Database className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                    <div className="text-left">
                      <span className="text-[14px] font-semibold block">SMS Gateway</span>
                      <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5">Pipeline health & diagnostics</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-disabled)] accordion-chevron ${expandedSection === "gateway" ? "open" : ""}`} />
                </button>
                <div className={`accordion-content ${expandedSection === "gateway" ? "open" : ""}`}>
                  <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    {[{ l: "Status", v: "● Online", c: "text-[#4F7A5B]" }, { l: "Success", v: "99.8%" }, { l: "Messages", v: "123" }, { l: "Last Sync", v: "2m ago" }].map((s) => (
                      <div key={s.l} className="bg-[var(--bg-secondary)] rounded-2xl p-3">
                        <span className="text-[9px] text-[var(--text-disabled)] font-semibold uppercase block">{s.l}</span>
                        <span className={`text-[13px] font-bold mt-0.5 block ${s.c || ""}`}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className="fin-card overflow-hidden">
                <button onClick={() => setExpandedSection(expandedSection === "keys" ? null : "keys")} className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center"><Key className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                    <div className="text-left">
                      <span className="text-[14px] font-semibold block">API Keys</span>
                      <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5">{apiKeys.length} active keys</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-disabled)] accordion-chevron ${expandedSection === "keys" ? "open" : ""}`} />
                </button>
                <div className={`accordion-content ${expandedSection === "keys" ? "open" : ""}`}>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Key name..." value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] fin-input rounded-xl" />
                      <button onClick={handleGenerateKey} className="px-4 py-2.5 bg-[#C9A76A] hover:bg-[#B8965A] text-white text-[12px] font-bold rounded-xl transition">Generate</button>
                    </div>
                    {generatedKey && (
                      <div className="p-3 rounded-xl bg-[var(--accent-sage-light)] border border-[#4F7A5B]/15">
                        <span className="text-[9px] font-bold text-[#4F7A5B] uppercase block mb-1">New Key (Copy Now)</span>
                        <div className="flex items-center justify-between gap-2 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]">
                          <span className="text-[10px] font-mono text-[var(--text-secondary)] break-all select-all">{generatedKey}</span>
                          <button onClick={() => handleCopyKey(generatedKey)}>{copiedKey ? <Check className="w-3.5 h-3.5 text-[#4F7A5B]" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-disabled)]" />}</button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {apiKeys.map((k) => (
                        <div key={k.id} className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] rounded-xl p-3">
                          <div className="min-w-0">
                            <span className="text-[13px] font-semibold block truncate">{k.name}</span>
                            <span className="text-[10px] text-[var(--text-disabled)] font-mono block mt-0.5 truncate">{k.hash}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold badge-sage px-2 py-1 rounded-full flex-shrink-0">{k.status}</span>
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="p-1.5 hover:bg-[var(--accent-terracotta-light)] hover:text-[#B85C4D] rounded-lg text-[var(--text-disabled)] transition"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Simulator */}
              <div className="fin-card overflow-hidden">
                <button onClick={() => setExpandedSection(expandedSection === "webhook" ? null : "webhook")} className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center"><Terminal className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                    <div className="text-left">
                      <span className="text-[14px] font-semibold block">Webhook Simulator</span>
                      <span className="text-[11px] text-[var(--text-disabled)] block mt-0.5">Test SMS relay pipeline</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-disabled)] accordion-chevron ${expandedSection === "webhook" ? "open" : ""}`} />
                </button>
                <div className={`accordion-content ${expandedSection === "webhook" ? "open" : ""}`}>
                  <div className="px-4 pb-4 space-y-3">
                    {webhookStatus && (
                      <div className="p-3 text-[11px] bg-[var(--accent-sage-light)] text-[#4F7A5B] rounded-xl border border-[#4F7A5B]/20">
                        {webhookStatus}
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] text-[var(--text-disabled)] font-semibold uppercase block mb-1.5">SMS Sender</label>
                      <input type="text" defaultValue="HDFCBank" className="w-full px-3 py-2.5 text-[13px] fin-input rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--text-disabled)] font-semibold uppercase block mb-1.5">SMS Body</label>
                      <textarea defaultValue="Alert: You've made a txn of Rs. 350.00 at Swiggy using HDFC Bank Card. Avl Bal: Rs.24217." rows={3} className="w-full px-3 py-2.5 text-[13px] fin-input rounded-xl resize-none" />
                    </div>
                    <button onClick={handleSimulateWebhook} className="w-full py-2.5 bg-[#C9A76A] hover:bg-[#B8965A] text-white text-[13px] font-bold rounded-xl transition flex items-center justify-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" /> Simulate Webhook
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-2 animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] block px-1 mb-1">Support</span>
              <button className="w-full fin-card px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center"><HelpCircle className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                  <span className="text-[14px] font-semibold truncate">Help & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] flex-shrink-0" />
              </button>
              <button className="w-full fin-card px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center"><Globe className="w-[18px] h-[18px] text-[var(--text-muted)]" /></div>
                  <span className="text-[14px] font-semibold truncate">About FinTrack AI</span>
                </div>
                <span className="text-[11px] text-[var(--text-disabled)] flex-shrink-0">v2.0.0</span>
              </button>
            </div>

            {/* Sign Out */}
            <button onClick={handleLogout} className="w-full py-3.5 rounded-2xl border border-[#B85C4D]/20 text-[#B85C4D] text-[13px] font-semibold hover:bg-[var(--accent-terracotta-light)] transition animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
              <LogOut className="w-4 h-4 inline mr-1.5" /> Sign Out
            </button>

            <p className="text-center text-[10px] text-[var(--text-disabled)] pt-2">FinTrack AI · Made with ❤️ in India</p>
          </div>
        )}
      </div>

      {/* ═══════════════ FLOATING ASK BUTTON ═══════════════ */}
      {activePage !== "copilot" && (
        <div className={`fixed z-[100] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 flex justify-center pointer-events-none transition-all duration-300 ${navVisible ? "bottom-[92px]" : "bottom-6"}`}>
          <button onClick={() => setActivePage("copilot")} className="fab-ask px-5 py-2.5 flex items-center gap-2 pointer-events-auto">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-[12px] font-bold text-white">Ask FinTrack</span>
          </button>
        </div>
      )}

      {/* ═══════════════ FLOATING NAV ═══════════════ */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-[99] flex justify-center pointer-events-none">
        <div className={`w-full flex justify-center transition-all duration-300 ${navVisible ? "nav-visible" : "nav-hidden"}`}>
          <nav className="nav-pill px-3 py-2.5 flex items-center gap-1 pointer-events-auto">
            {NAV.map((item) => {
              const I = item.icon;
              const active = activePage === item.id;
              return (
                <button key={item.id} onClick={() => setActivePage(item.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition-all duration-300 ${active ? "bg-[var(--text-primary)] text-[var(--bg-card)]" : "text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"}`}>
                  <I className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 1.8} />
                  {active && <span className="text-[11px] font-bold animate-fade-in">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
