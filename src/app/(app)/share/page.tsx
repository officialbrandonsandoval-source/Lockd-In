"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBlueprint } from "@/hooks/useBlueprint";
import { createClient } from "@/lib/supabase/client";
import ShareCardPreview from "@/components/share/ShareCardPreview";
import ShareButton from "@/components/share/ShareButton";
import {
  formatBlueprintCard,
  formatStreakCard,
  formatWeeklyWinCard,
  formatInviteCard,
} from "@/lib/share/card-generator";
import type { Streak, WeeklyPulse, Blueprint } from "@/lib/supabase/types";
import { APP_NAME } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardType = "blueprint_summary" | "streak" | "weekly_win" | "invite";

interface TabConfig {
  type: CardType;
  label: string;
  icon: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Tab configurations
// ---------------------------------------------------------------------------

const TABS: TabConfig[] = [
  {
    type: "blueprint_summary",
    label: "Blueprint",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    type: "streak",
    label: "Streak",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    type: "weekly_win",
    label: "Weekly Win",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
  {
    type: "invite",
    label: "Invite",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function SharePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { blueprint } = useBlueprint();

  const [activeTab, setActiveTab] = useState<CardType>("blueprint_summary");
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<Streak | null>(null);
  const [pulseData, setPulseData] = useState<WeeklyPulse | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const userName = profile?.full_name?.split(" ")[0] || "King";

  // Fetch streak and pulse data when needed
  const loadData = useCallback(async () => {
    if (!user || dataLoaded) return;

    try {
      const [streakRes, pulseRes] = await Promise.all([
        supabase
          .from("streaks")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("weekly_pulses")
          .select("*")
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (streakRes.data) setStreakData(streakRes.data as Streak);
      if (pulseRes.data) setPulseData(pulseRes.data as WeeklyPulse);
      setDataLoaded(true);
    } catch (err) {
      console.error("[share] Failed to load data:", err);
    }
  }, [user, supabase, dataLoaded]);

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate card data based on active tab
  const cardData = useMemo((): Record<string, unknown> => {
    switch (activeTab) {
      case "blueprint_summary":
        if (blueprint) {
          const card = formatBlueprintCard(blueprint as Blueprint, userName);
          return card as unknown as Record<string, unknown>;
        }
        return {
          identity: "Building my identity statement...",
          purpose: "Discovering my purpose...",
          userName,
        };

      case "streak":
        if (streakData) {
          const card = formatStreakCard(streakData, userName);
          return card as unknown as Record<string, unknown>;
        }
        return {
          currentStreak: 0,
          longestStreak: 0,
          tier: "bronze",
          milestoneText: "Start your streak today",
          userName,
        };

      case "weekly_win":
        if (pulseData) {
          const card = formatWeeklyWinCard(pulseData, userName, 1);
          return card as unknown as Record<string, unknown>;
        }
        return {
          winText: "Building momentum every day.",
          weekNumber: 1,
          alignmentScore: null,
          userName,
        };

      case "invite":
        const referralCode = user?.id?.slice(0, 8) || "lockdin";
        const card = formatInviteCard(userName, referralCode);
        return card as unknown as Record<string, unknown>;

      default:
        return {};
    }
  }, [activeTab, blueprint, streakData, pulseData, userName, user]);

  // Generate share card
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setShareUrl(null);
    setGenerateError(null);

    try {
      const response = await fetch("/api/share/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardType: activeTab, cardData }),
      });

      const data = await response.json();

      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        setGenerateError(data.error || "Failed to generate share card.");
      }
    } catch {
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [activeTab, cardData]);

  const shareData = useMemo(() => {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.origin : "https://lockdin.app");
    const titles: Record<CardType, string> = {
      blueprint_summary: `${userName}'s Blueprint | ${APP_NAME}`,
      streak: `${userName} is on a streak | ${APP_NAME}`,
      weekly_win: `${userName}'s Weekly Win | ${APP_NAME}`,
      invite: `Join ${userName} on ${APP_NAME}`,
    };
    const texts: Record<CardType, string> = {
      blueprint_summary: "Check out my personal blueprint on Lockd In.",
      streak: `I am on a ${(cardData.currentStreak as number) || 0}-day streak on Lockd In!`,
      weekly_win: "Check out my weekly win on Lockd In.",
      invite: `${userName} invited you to join Lockd In — a faith-driven personal blueprint platform for men.`,
    };
    return { title: titles[activeTab], text: texts[activeTab], url };
  }, [activeTab, shareUrl, userName, cardData]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl text-[#F5F0E8]">Share</h1>
        <p className="text-sm text-[#8A8578] font-sans mt-1">
          Create and share your journey with the world.
        </p>
      </motion.div>

      {/* Tab buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <motion.button
              key={tab.type}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab.type);
                setShareUrl(null);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans
                whitespace-nowrap transition-colors duration-200
                ${
                  isActive
                    ? "bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30"
                    : "bg-[#1A1A1A] text-[#8A8578] border border-[#2A2A2A] hover:border-[#C9A84C]/20"
                }
              `}
            >
              <span className={isActive ? "text-[#C9A84C]" : "text-[#8A8578]"}>
                {tab.icon}
              </span>
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Card preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ShareCardPreview
              cardType={activeTab}
              cardData={cardData}
              aspectRatio="9:16"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Aspect ratio toggle (optional) */}
      <div className="flex justify-center gap-2 mb-6">
        <span className="text-[10px] text-[#8A8578] font-sans uppercase tracking-wider">
          Story Format (9:16)
        </span>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 max-w-sm mx-auto"
      >
        {/* Error message */}
        {generateError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
            <p className="text-sm text-red-400">{generateError}</p>
          </div>
        )}

        {/* Generate share link */}
        {!shareUrl && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={generating}
            className="
              w-full flex items-center justify-center gap-2
              bg-[#C9A84C] text-[#0A0A0A] font-sans font-semibold
              px-6 py-3.5 rounded-xl text-sm
              shadow-gold hover:bg-[#C9A84C]/90
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Generate Share Link
              </>
            )}
          </motion.button>
        )}

        {/* Share buttons (shown after generation) */}
        {shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShareButton shareData={shareData} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
