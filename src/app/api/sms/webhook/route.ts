// =============================================================================
// SMS Webhook – Twilio Inbound SMS Handler
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PriorityItem } from "@/lib/supabase/types";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST /api/sms/webhook
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get("From") as string | null;
    const body = (formData.get("Body") as string | null)?.trim() ?? "";

    if (!from || !body) {
      return twimlResponse(
        "We could not process your message. Please try again."
      );
    }

    // Normalize phone number (strip leading +1 variations for lookup)
    const normalizedPhone = normalizePhone(from);

    const supabase = createAdminClient();

    // ── Look up user by phone number ──────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, sms_opt_in, timezone")
      .or(`phone.eq.${from},phone.eq.${normalizedPhone}`)
      .limit(1)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("[sms/webhook] Profile lookup failed:", profileError?.message);
      return twimlResponse(
        "We could not find an account linked to this number. Sign up at lockdin.app to get started."
      );
    }

    if (!profile.sms_opt_in) {
      return twimlResponse(
        "SMS is not enabled on your account. Update your settings at lockdin.app to opt in."
      );
    }

    const userId = profile.id;
    const userName = profile.full_name?.split(" ")[0] || "King";
    const todayISO = getTodayInTimezone(profile.timezone || "America/New_York");

    // ── Log inbound message ───────────────────────────────────────
    await supabase.from("sms_logs").insert({
      user_id: userId,
      direction: "inbound",
      message_type: "reply",
      message_body: body,
      twilio_sid: (formData.get("MessageSid") as string) || null,
      status: "received",
    });

    // ── Determine context: morning or evening? ────────────────────
    const { data: existingCheckin } = await supabase
      .from("daily_checkins")
      .select("id, morning_completed_at, evening_completed_at, morning_priorities")
      .eq("user_id", userId)
      .eq("checkin_date", todayISO)
      .maybeSingle();

    let replyText: string;

    if (!existingCheckin || !existingCheckin.morning_completed_at) {
      // ── MORNING CONTEXT: Parse priorities ─────────────────────
      replyText = await handleMorningReply(
        supabase,
        userId,
        userName,
        todayISO,
        body,
        existingCheckin?.id ?? null
      );
    } else if (!existingCheckin.evening_completed_at) {
      // ── EVENING CONTEXT: Parse reflection ─────────────────────
      replyText = await handleEveningReply(
        supabase,
        userId,
        userName,
        todayISO,
        body,
        existingCheckin.id,
        existingCheckin.morning_priorities as PriorityItem[] | null
      );
    } else {
      // Both already completed
      replyText = `${userName}, you have already completed both check-ins for today. Great work! See you tomorrow morning.`;
    }

    return twimlResponse(replyText);
  } catch (error) {
    console.error("[sms/webhook] Unhandled error:", error);
    return twimlResponse(
      "Something went wrong processing your message. Please try again later."
    );
  }
}

// ---------------------------------------------------------------------------
// Morning reply handler
// ---------------------------------------------------------------------------

async function handleMorningReply(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  userName: string,
  todayISO: string,
  body: string,
  existingCheckinId: string | null
): Promise<string> {
  // Parse priorities from the message body
  const priorities = parsePriorities(body);

  // Parse optional scripture / intention (lines that don't look like numbered items)
  const nonPriorityLines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !isNumberedItem(l));

  const scripture = nonPriorityLines.find(
    (l) =>
      l.toLowerCase().includes("scripture") ||
      l.toLowerCase().includes("verse") ||
      l.toLowerCase().includes("proverbs") ||
      l.toLowerCase().includes("psalm") ||
      l.toLowerCase().includes("matthew") ||
      l.toLowerCase().includes("john") ||
      l.toLowerCase().includes("romans") ||
      l.toLowerCase().includes("philippians") ||
      l.match(/^\d+\s*\w+\s+\d+/)
  ) || null;

  const intention = nonPriorityLines.find(
    (l) => l !== scripture && l.length > 10
  ) || null;

  const checkinData = {
    morning_priorities: priorities,
    morning_scripture: scripture,
    morning_intention: intention,
    morning_completed_at: new Date().toISOString(),
  };

  if (existingCheckinId) {
    const { error } = await supabase
      .from("daily_checkins")
      .update(checkinData)
      .eq("id", existingCheckinId);
    if (error) console.error("[sms/webhook] Failed to update morning check-in:", error.message);
  } else {
    const { error } = await supabase.from("daily_checkins").insert({
      user_id: userId,
      checkin_date: todayISO,
      ...checkinData,
    });
    if (error) console.error("[sms/webhook] Failed to insert morning check-in:", error.message);
  }

  // Update streak
  await updateStreak(supabase, userId, todayISO);

  const priorityCount = priorities.length;
  if (priorityCount === 0) {
    return `Hey ${userName}, I didn't catch any priorities. Reply with your top 3 things to focus on today (numbered 1-3).`;
  }
  return `Locked in, ${userName}! ${priorityCount} priorit${priorityCount === 1 ? "y" : "ies"} set for today. Go make it count. You will hear from me tonight to reflect.`;
}

// ---------------------------------------------------------------------------
// Evening reply handler
// ---------------------------------------------------------------------------

async function handleEveningReply(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  userName: string,
  todayISO: string,
  body: string,
  checkinId: string,
  morningPriorities: PriorityItem[] | null
): Promise<string> {
  // Parse evening responses
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const wins: string[] = [];
  const struggles: string[] = [];
  const gratitude: string[] = [];
  let dayRating: number | null = null;

  // Simple heuristic parsing – look for keywords or numbered sections
  let currentSection: "wins" | "struggles" | "gratitude" | "general" = "general";

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check for section headers
    if (lower.includes("win") || lower.includes("went well")) {
      currentSection = "wins";
      continue;
    }
    if (lower.includes("struggle") || lower.includes("challenge") || lower.includes("hard")) {
      currentSection = "struggles";
      continue;
    }
    if (lower.includes("grateful") || lower.includes("gratitude") || lower.includes("thankful")) {
      currentSection = "gratitude";
      continue;
    }

    // Check for day rating
    const ratingMatch = line.match(/(?:rating|rate|score)?\s*[:=]?\s*(\d{1,2})(?:\s*\/\s*10)?/i);
    if (ratingMatch) {
      const parsed = parseInt(ratingMatch[1], 10);
      if (parsed >= 1 && parsed <= 10) {
        dayRating = parsed;
        continue;
      }
    }

    // Strip leading bullet / number
    const cleaned = line.replace(/^[-*\d.)\]]+\s*/, "").trim();
    if (!cleaned) continue;

    switch (currentSection) {
      case "wins":
        wins.push(cleaned);
        break;
      case "struggles":
        struggles.push(cleaned);
        break;
      case "gratitude":
        gratitude.push(cleaned);
        break;
      default:
        // Default to wins for unstructured replies
        wins.push(cleaned);
        break;
    }
  }

  // Calculate priorities completed (if morning priorities exist)
  const prioritiesCompleted = morningPriorities
    ? morningPriorities.filter((p) => p.completed).length
    : null;

  const { error } = await supabase
    .from("daily_checkins")
    .update({
      evening_wins: wins.length > 0 ? wins.slice(0, 3) : null,
      evening_struggles: struggles.length > 0 ? struggles.slice(0, 3) : null,
      evening_gratitude: gratitude.length > 0 ? gratitude.slice(0, 3) : null,
      day_rating: dayRating,
      priorities_completed: prioritiesCompleted,
      evening_completed_at: new Date().toISOString(),
    })
    .eq("id", checkinId);
  if (error) console.error("[sms/webhook] Failed to update evening check-in:", error.message);

  return `Reflection logged, ${userName}. ${wins.length > 0 ? `${wins.length} win${wins.length === 1 ? "" : "s"} celebrated. ` : ""}Rest well tonight, King. Tomorrow is another opportunity to build your legacy.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePriorities(body: string): PriorityItem[] {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const priorities: PriorityItem[] = [];

  for (const line of lines) {
    // Match numbered items: "1. Do something" or "1) Do something" or "- Do something"
    if (isNumberedItem(line)) {
      const text = line.replace(/^[-*\d.)\]]+\s*/, "").trim();
      if (text.length > 0) {
        priorities.push({ text, completed: false });
      }
    }
  }

  // If no numbered items found, treat the entire message as priorities
  // (split by commas or take the whole thing)
  if (priorities.length === 0) {
    const parts = body.includes(",") ? body.split(",") : [body];
    for (const part of parts.slice(0, 3)) {
      const text = part.trim();
      if (text.length > 0) {
        priorities.push({ text, completed: false });
      }
    }
  }

  return priorities.slice(0, 3);
}

function isNumberedItem(line: string): boolean {
  return /^(\d+[.)]\s*|-\s*|\*\s*)/.test(line);
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // 11 digits starting with 1 → E.164 format +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  // 10 digits → add +1 prefix for US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  // Already has + prefix or other format — return as-is
  if (phone.startsWith("+")) {
    return phone;
  }
  return `+${digits}`;
}

function getTodayInTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    // Fallback to UTC
    return new Date().toISOString().split("T")[0];
  }
}

async function updateStreak(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  todayISO: string
) {
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!streak) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      total_checkins: 1,
      last_checkin_date: todayISO,
      streak_started_at: new Date().toISOString(),
    });
    return;
  }

  // If already checked in today, skip
  if (streak.last_checkin_date === todayISO) return;

  const lastDate = new Date(streak.last_checkin_date || "2000-01-01");
  const today = new Date(todayISO);
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = 1;
  if (diffDays === 1) {
    newStreak = streak.current_streak + 1;
  }

  await supabase
    .from("streaks")
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(streak.longest_streak, newStreak),
      total_checkins: streak.total_checkins + 1,
      last_checkin_date: todayISO,
      streak_started_at:
        newStreak === 1
          ? new Date().toISOString()
          : streak.streak_started_at,
    })
    .eq("id", streak.id);
}

function twimlResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
