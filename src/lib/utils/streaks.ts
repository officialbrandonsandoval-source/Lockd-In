// =============================================================================
// Streak Utility Functions for Lockd In
// =============================================================================

import { differenceInCalendarDays, parseISO } from "date-fns";
import { STREAK_MILESTONES } from "./constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  streakBroken: boolean;
  totalCheckins: number;
}

// ---------------------------------------------------------------------------
// Core streak logic
// ---------------------------------------------------------------------------

/**
 * Calculate updated streak information given the last check-in date and
 * current streak/longest streak values.
 *
 * Rules:
 * - If the last check-in was today, streak stays the same (already counted).
 * - If the last check-in was yesterday, increment the streak by 1.
 * - If the last check-in was more than 1 day ago (or null), streak resets to 1.
 */
export function calculateStreak(
  lastCheckinDate: string | null,
  currentStreak: number,
  longestStreak: number,
  totalCheckins: number
): StreakInfo {
  const today = new Date();

  // First ever check-in
  if (!lastCheckinDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      streakBroken: false,
      totalCheckins: totalCheckins + 1,
    };
  }

  const lastDate = parseISO(lastCheckinDate);
  const daysDiff = differenceInCalendarDays(today, lastDate);

  // Already checked in today
  if (daysDiff === 0) {
    return {
      currentStreak,
      longestStreak,
      streakBroken: false,
      totalCheckins,
    };
  }

  // Checked in yesterday — streak continues
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      streakBroken: false,
      totalCheckins: totalCheckins + 1,
    };
  }

  // Missed more than one day — streak resets
  return {
    currentStreak: 1,
    longestStreak,
    streakBroken: true,
    totalCheckins: totalCheckins + 1,
  };
}

// ---------------------------------------------------------------------------
// Milestone helpers
// ---------------------------------------------------------------------------

/**
 * Check if a given streak count matches one of the milestone values
 * (7, 14, 21, 30, 60, 90).
 */
export function isStreakMilestone(streakCount: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(streakCount);
}

/**
 * Get the next milestone the user is working toward.
 * Returns null if the user has surpassed all milestones.
 */
export function getNextMilestone(streakCount: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streakCount < milestone) return milestone;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Streak messages
// ---------------------------------------------------------------------------

/**
 * Returns an encouraging message based on the current streak count.
 * Handles milestone celebrations, streak breaks, and general encouragement.
 */
export function getStreakMessage(
  streakCount: number,
  streakBroken: boolean = false
): string {
  // Streak was broken — be gracious and encouraging
  if (streakBroken) {
    return getStreakBrokenMessage();
  }

  // Milestone celebrations
  if (isStreakMilestone(streakCount)) {
    return getMilestoneMessage(streakCount);
  }

  // General streak encouragement
  return getGeneralStreakMessage(streakCount);
}

function getMilestoneMessage(streakCount: number): string {
  switch (streakCount) {
    case 7:
      return "One full week locked in! You are building something powerful. Keep pressing forward, King.";
    case 14:
      return "Two weeks strong! Consistency is the bridge between goals and achievement. You are walking it out.";
    case 21:
      return "21 days — they say it takes this long to form a habit. You are proving your commitment is real.";
    case 30:
      return "A full month locked in! You are not the same man you were 30 days ago. The transformation is real.";
    case 60:
      return "60 days of discipline! You are in rare company. Most men quit — you kept showing up. Respect.";
    case 90:
      return "90 days locked in! A full quarter of relentless growth. You have built something unshakeable. This is who you are now.";
    default:
      return `${streakCount} days locked in! Every day you show up, you are building the man you were created to be.`;
  }
}

function getStreakBrokenMessage(): string {
  const messages = [
    "Welcome back, King. A setback is a setup for a comeback. Today is day 1 of your next streak.",
    "You missed a day, but you did not miss your calling. The fact that you are here shows your heart. Let us go.",
    "Every champion has off days. What matters is you are back on the mat. Day 1 starts now.",
    "Grace is not the absence of failure — it is the presence of a new beginning. You are back. That is what counts.",
    "The enemy wanted you to stay down. But here you are, standing back up. That is the heart of a warrior.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getGeneralStreakMessage(streakCount: number): string {
  if (streakCount === 1) {
    return "Day 1 — every journey of a thousand miles starts with a single step. You just took yours. Let us go!";
  }
  if (streakCount <= 3) {
    return `${streakCount} days in! You are building momentum. Keep showing up — this is how champions are made.`;
  }
  if (streakCount <= 6) {
    return `${streakCount} days strong! Almost a full week. You are proving this is more than a moment — it is a movement.`;
  }
  if (streakCount <= 13) {
    return `${streakCount} days locked in! You are in the zone. Consistency is your superpower right now.`;
  }
  if (streakCount <= 20) {
    return `${streakCount} days of showing up! You are building discipline that most men only dream about.`;
  }
  if (streakCount <= 29) {
    return `${streakCount} days! Almost a full month. You are rewriting your story one day at a time.`;
  }
  if (streakCount <= 59) {
    return `${streakCount} days locked in! You are in elite territory now. Keep pushing, King.`;
  }
  if (streakCount <= 89) {
    return `${streakCount} days! You are approaching legendary status. The discipline you have built is extraordinary.`;
  }
  return `${streakCount} days locked in! You have gone beyond milestones. You are living this. This is who you are.`;
}

/**
 * Get the streak tier label based on the current streak count.
 */
export function getStreakTier(
  streakCount: number
): "bronze" | "silver" | "gold" | "platinum" | "diamond" {
  if (streakCount >= 90) return "diamond";
  if (streakCount >= 60) return "platinum";
  if (streakCount >= 30) return "gold";
  if (streakCount >= 14) return "silver";
  return "bronze";
}
