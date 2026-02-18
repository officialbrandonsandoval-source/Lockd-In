// =============================================================================
// Share Card Data Generators
// =============================================================================

import type { Blueprint, Streak, WeeklyPulse } from "@/lib/supabase/types";
import { APP_NAME } from "@/lib/utils/constants";
import { getStreakTier } from "@/lib/utils/streaks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlueprintCardData {
  identity: string;
  purpose: string;
  userName: string;
}

export interface StreakCardData {
  currentStreak: number;
  longestStreak: number;
  tier: string;
  milestoneText: string;
  userName: string;
}

export interface WeeklyWinCardData {
  winText: string;
  weekNumber: number;
  alignmentScore: number | null;
  userName: string;
}

export interface InviteCardData {
  referralCode: string;
  referralUrl: string;
  inviterName: string;
  personalMessage: string;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

/**
 * Extracts identity + purpose from a Blueprint for sharing.
 */
export function formatBlueprintCard(
  blueprint: Blueprint,
  userName: string
): BlueprintCardData {
  return {
    identity: blueprint.identity_statement || "Building my identity statement...",
    purpose: blueprint.purpose_statement || "Discovering my purpose...",
    userName,
  };
}

/**
 * Formats streak data for a share card.
 */
export function formatStreakCard(
  streak: Streak,
  userName: string
): StreakCardData {
  const tier = getStreakTier(streak.current_streak);

  let milestoneText: string;
  if (streak.current_streak >= 90) {
    milestoneText = "90+ days of relentless discipline";
  } else if (streak.current_streak >= 60) {
    milestoneText = "60+ days locked in — elite territory";
  } else if (streak.current_streak >= 30) {
    milestoneText = "30+ days — a full month of transformation";
  } else if (streak.current_streak >= 21) {
    milestoneText = "21+ days — the habit is forming";
  } else if (streak.current_streak >= 14) {
    milestoneText = "14+ days — two weeks strong";
  } else if (streak.current_streak >= 7) {
    milestoneText = "7+ days — first full week locked in";
  } else {
    milestoneText = "Building momentum every day";
  }

  return {
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    tier,
    milestoneText,
    userName,
  };
}

/**
 * Formats a weekly win for sharing.
 */
export function formatWeeklyWinCard(
  pulse: WeeklyPulse,
  userName: string,
  weekNumber: number
): WeeklyWinCardData {
  return {
    winText: pulse.wins_summary || "Showed up and did the work this week.",
    weekNumber,
    alignmentScore: pulse.alignment_score,
    userName,
  };
}

/**
 * Generates invite card data with a referral code.
 */
export function formatInviteCard(
  inviterName: string,
  referralCode: string
): InviteCardData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lockdin.app";

  return {
    referralCode,
    referralUrl: `${baseUrl}/invite/${referralCode}`,
    inviterName,
    personalMessage: `${inviterName} is building a legacy with ${APP_NAME}. Every morning, a blueprint. Every evening, a reflection. Every week, a pulse. This is not an app — it is a movement. Join in.`,
  };
}
