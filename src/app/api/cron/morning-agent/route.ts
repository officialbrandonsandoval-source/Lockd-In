// =============================================================================
// Cron: Morning Agent – Generate & send personalised morning messages
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateMorningMessage } from "@/lib/ai/claude";
import { sendSMS } from "@/lib/twilio/messages";
import { formatMorningCheckin } from "@/lib/twilio/messages";
import { format, subDays } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// GET /api/cron/morning-agent
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // ── Verify CRON_SECRET ────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // ── Fetch all opted-in users ──────────────────────────────────
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, sms_morning_time, timezone, sms_opt_in")
      .eq("sms_opt_in", true)
      .not("phone", "is", null);

    if (usersError) {
      console.error("[morning-agent] Failed to fetch users:", usersError.message);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No opted-in users", processed: 0 });
    }

    const results: { userId: string; status: string; error?: string }[] = [];

    // ── Process each user ─────────────────────────────────────────
    for (const user of users) {
      try {
        // Check if it's the right time for this user
        const userTime = user.sms_morning_time || "06:00";
        const userTimezone = user.timezone || "America/New_York";

        if (!isCurrentHourMatch(userTime, userTimezone)) {
          results.push({ userId: user.id, status: "skipped_wrong_time" });
          continue;
        }

        // Check if morning message was already sent today
        const todayISO = getTodayInTimezone(userTimezone);
        const { data: existingCheckin } = await supabase
          .from("daily_checkins")
          .select("id, ai_morning_message")
          .eq("user_id", user.id)
          .eq("checkin_date", todayISO)
          .maybeSingle();

        if (existingCheckin?.ai_morning_message) {
          results.push({ userId: user.id, status: "skipped_already_sent" });
          continue;
        }

        // Fetch user's blueprint
        const { data: blueprint } = await supabase
          .from("blueprints")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch user's streak
        const { data: streak } = await supabase
          .from("streaks")
          .select("current_streak, longest_streak, total_checkins")
          .eq("user_id", user.id)
          .maybeSingle();

        const currentStreak = streak?.current_streak ?? 0;

        // Fetch recent check-ins (last 3 days)
        const threeDaysAgo = format(subDays(new Date(), 3), "yyyy-MM-dd");
        const { data: recentCheckins } = await supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", user.id)
          .gte("checkin_date", threeDaysAgo)
          .order("checkin_date", { ascending: false })
          .limit(3);

        const userName = user.full_name?.split(" ")[0] || "King";
        let messageBody: string;

        if (blueprint) {
          // Generate personalised AI morning message
          const aiResponse = await generateMorningMessage({
            blueprint: blueprint as unknown as Record<string, unknown>,
            streak: currentStreak,
            previousCheckins: (recentCheckins || []) as unknown as Record<string, unknown>[],
            todayDate: todayISO,
            userName,
          });

          if (aiResponse.success && aiResponse.rawText) {
            // Extract a concise SMS from the AI response
            messageBody = formatAiMorningForSMS(userName, aiResponse.rawText, currentStreak);
          } else {
            // Fall back to template message
            messageBody = formatMorningCheckin(userName, currentStreak);
          }
        } else {
          // No blueprint yet – use template
          messageBody = formatMorningCheckin(userName, currentStreak);
        }

        // Send SMS
        const smsResult = await sendSMS(user.phone!, messageBody);

        // Log outbound message
        await supabase.from("sms_logs").insert({
          user_id: user.id,
          direction: "outbound",
          message_type: "morning_checkin",
          message_body: messageBody,
          twilio_sid: smsResult.messageSid || null,
          status: smsResult.success ? "sent" : "failed",
        });

        // Create or update daily checkin with AI message
        if (existingCheckin) {
          await supabase
            .from("daily_checkins")
            .update({ ai_morning_message: messageBody })
            .eq("id", existingCheckin.id);
        } else {
          await supabase.from("daily_checkins").insert({
            user_id: user.id,
            checkin_date: todayISO,
            ai_morning_message: messageBody,
          });
        }

        results.push({
          userId: user.id,
          status: smsResult.success ? "sent" : "failed",
          error: smsResult.error,
        });
      } catch (userError) {
        const errorMsg =
          userError instanceof Error ? userError.message : "Unknown error";
        console.error(`[morning-agent] Error for user ${user.id}:`, errorMsg);
        results.push({ userId: user.id, status: "error", error: errorMsg });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const skipped = results.filter((r) => r.status.startsWith("skipped")).length;
    const failed = results.filter(
      (r) => r.status === "failed" || r.status === "error"
    ).length;

    return NextResponse.json({
      message: "Morning agent completed",
      processed: users.length,
      sent,
      skipped,
      failed,
      results,
    });
  } catch (error) {
    console.error("[morning-agent] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isCurrentHourMatch(userTime: string, timezone: string): boolean {
  try {
    const [targetHour] = userTime.split(":").map(Number);
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(now), 10);
    return currentHour === targetHour;
  } catch {
    return false;
  }
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
    return new Date().toISOString().split("T")[0];
  }
}

function formatAiMorningForSMS(
  userName: string,
  rawAiText: string,
  streak: number
): string {
  try {
    // Try to parse the AI JSON response
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawAiText);
    } catch {
      const jsonMatch = rawAiText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        data = JSON.parse(jsonMatch[1].trim());
      } else {
        // Use raw text if not parseable
        return rawAiText.slice(0, 1500);
      }
    }

    const greeting = (data.greeting as string) || `Good morning, ${userName}!`;
    const identity = (data.identity_reminder as string) || "";
    const scripture = (data.scripture_or_wisdom as string) || "";
    const focus = (data.todays_focus as string) || "";
    const closing = (data.closing_charge as string) || "";
    const streakAck = (data.streak_acknowledgment as string) || "";

    // Build a concise SMS (Twilio segment-friendly)
    const parts = [greeting];

    if (identity) parts.push(identity);
    if (streakAck) parts.push(streakAck);
    if (scripture) parts.push(scripture);
    if (focus) parts.push(focus);

    // Add commitments
    const commitments = data.commitments as
      | { commitment: string }[]
      | undefined;
    if (commitments && commitments.length > 0) {
      parts.push("Today's focus:");
      commitments.forEach((c, i) => {
        parts.push(`${i + 1}. ${c.commitment}`);
      });
    }

    if (closing) parts.push(closing);
    parts.push("Reply with your top 3 priorities to check in.");

    return parts.join("\n\n").slice(0, 1500);
  } catch {
    const streakLine = streak > 1 ? ` Streak: ${streak} days.` : "";
    return `Good morning, ${userName}!${streakLine} What are your top 3 priorities today? Reply to check in.`;
  }
}
