// =============================================================================
// Twilio SMS Messaging Functions (Server-only)
// =============================================================================

import twilioClient from "./client";
import { APP_NAME } from "@/lib/utils/constants";

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!twilioPhoneNumber) {
  throw new Error("Missing TWILIO_PHONE_NUMBER environment variable");
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export interface SendSMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Send an SMS message via Twilio.
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<SendSMSResult> {
  try {
    const message = await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber!,
      to,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error sending SMS";
    console.error(`[${APP_NAME}] SMS send failed:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ---------------------------------------------------------------------------
// Message formatters
// ---------------------------------------------------------------------------

/**
 * Format the morning check-in SMS.
 * Sent at the user's configured morning time to prompt daily priorities.
 */
export function formatMorningCheckin(name: string, streak: number): string {
  const greeting = getTimeGreeting();
  const streakLine =
    streak > 1 ? `\nStreak: ${streak} days locked in.` : "";

  return [
    `${greeting}, ${name}!`,
    ``,
    `Time to set your intentions for today.`,
    ``,
    `What are your top 3 priorities?`,
    `What scripture or truth are you standing on?`,
    `What is your intention for today?`,
    streakLine,
    ``,
    `Reply to check in, or tap the link to open ${APP_NAME}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Format the evening reflection SMS.
 * Sent at the user's configured evening time to prompt daily reflection.
 */
export function formatEveningReflection(
  name: string,
  prioritiesCount: number
): string {
  const priorityNote =
    prioritiesCount > 0
      ? `You set ${prioritiesCount} priorit${prioritiesCount === 1 ? "y" : "ies"} this morning.`
      : "Time to reflect on your day.";

  return [
    `Good evening, ${name}.`,
    ``,
    priorityNote,
    ``,
    `Before you rest, take a moment to reflect:`,
    `- What were your wins today?`,
    `- What did you struggle with?`,
    `- What are you grateful for?`,
    `- Rate your day (1-10)`,
    ``,
    `Reply to reflect, or tap the link to open ${APP_NAME}.`,
  ].join("\n");
}

/**
 * Format the weekly pulse SMS.
 * Sent at the end of the week to prompt weekly review.
 */
export function formatWeeklyPulse(
  name: string,
  weekNumber: number,
  checkinCount: number
): string {
  const consistency =
    checkinCount >= 6
      ? "Outstanding consistency this week!"
      : checkinCount >= 4
        ? "Solid week of showing up."
        : checkinCount >= 2
          ? "You showed up — every day counts."
          : "A new week is a new opportunity.";

  return [
    `Weekly Pulse - Week ${weekNumber}`,
    ``,
    `${name}, here is your week in review.`,
    ``,
    `Check-ins this week: ${checkinCount}/7`,
    consistency,
    ``,
    `Your Weekly Pulse report is ready. Tap the link to see your wins, growth areas, and focus for next week.`,
    ``,
    `- ${APP_NAME}`,
  ].join("\n");
}

/**
 * Format a nudge SMS for a missed check-in day.
 * Sent when the user misses their morning check-in.
 */
export function formatNudge(name: string, streak: number): string {
  const nudges = [
    `${name}, we noticed you have not checked in today. Your ${streak}-day streak is on the line. You have worked too hard to let it slip. Tap in whenever you are ready. - ${APP_NAME}`,
    `Hey ${name}, just a reminder — your blueprint is waiting. Even a quick check-in keeps the momentum going. You have got this. - ${APP_NAME}`,
    `${name}, showing up is half the battle. Your streak is at ${streak} days. Do not let today be the day it resets. We believe in you. - ${APP_NAME}`,
    `Kings do not take days off, ${name}. Your ${streak}-day streak is calling. A quick check-in is all it takes. Tap in. - ${APP_NAME}`,
  ];

  // Use streak as a simple seed so the same streak count gets the same nudge
  return nudges[streak % nudges.length];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
