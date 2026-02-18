// =============================================================================
// Cron: Evening Agent – Generate & send personalised evening reflection prompts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEveningMessage } from "@/lib/ai/claude";
import { sendSMS } from "@/lib/twilio/messages";
import { formatEveningReflection } from "@/lib/twilio/messages";

export const runtime = "nodejs";
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// GET /api/cron/evening-agent
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
      .select("id, full_name, phone, sms_evening_time, timezone, sms_opt_in")
      .eq("sms_opt_in", true)
      .not("phone", "is", null);

    if (usersError) {
      console.error("[evening-agent] Failed to fetch users:", usersError.message);
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
        const userTime = user.sms_evening_time || "21:00";
        const userTimezone = user.timezone || "America/New_York";

        if (!isCurrentHourMatch(userTime, userTimezone)) {
          results.push({ userId: user.id, status: "skipped_wrong_time" });
          continue;
        }

        const todayISO = getTodayInTimezone(userTimezone);

        // Check if evening message was already sent today
        const { data: existingCheckin } = await supabase
          .from("daily_checkins")
          .select("id, ai_evening_message, morning_priorities, morning_completed_at, evening_completed_at")
          .eq("user_id", user.id)
          .eq("checkin_date", todayISO)
          .maybeSingle();

        if (existingCheckin?.ai_evening_message) {
          results.push({ userId: user.id, status: "skipped_already_sent" });
          continue;
        }

        // If user already completed evening check-in, skip
        if (existingCheckin?.evening_completed_at) {
          results.push({ userId: user.id, status: "skipped_already_reflected" });
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
          .select("current_streak")
          .eq("user_id", user.id)
          .maybeSingle();

        const currentStreak = streak?.current_streak ?? 0;
        const userName = user.full_name?.split(" ")[0] || "King";

        // Get morning priorities for context
        const morningPriorities =
          existingCheckin?.morning_priorities as
            | { text: string; completed: boolean }[]
            | null;
        const prioritiesCount = morningPriorities?.length ?? 0;
        const morningCommitments =
          morningPriorities?.map((p) => p.text) ?? [];

        let messageBody: string;

        if (blueprint) {
          // Generate personalised AI evening message
          const aiResponse = await generateEveningMessage({
            blueprint: blueprint as unknown as Record<string, unknown>,
            morningCommitments,
            dailyActivity: (existingCheckin || {}) as unknown as Record<string, unknown>,
            streak: currentStreak,
            userName,
            todayDate: todayISO,
          });

          if (aiResponse.success && aiResponse.rawText) {
            messageBody = formatAiEveningForSMS(userName, aiResponse.rawText, prioritiesCount);
          } else {
            messageBody = formatEveningReflection(userName, prioritiesCount);
          }
        } else {
          messageBody = formatEveningReflection(userName, prioritiesCount);
        }

        // Send SMS
        const smsResult = await sendSMS(user.phone!, messageBody);

        // Log outbound message
        await supabase.from("sms_logs").insert({
          user_id: user.id,
          direction: "outbound",
          message_type: "evening_reflection",
          message_body: messageBody,
          twilio_sid: smsResult.messageSid || null,
          status: smsResult.success ? "sent" : "failed",
        });

        // Store AI evening message on check-in
        if (existingCheckin) {
          await supabase
            .from("daily_checkins")
            .update({ ai_evening_message: messageBody })
            .eq("id", existingCheckin.id);
        } else {
          await supabase.from("daily_checkins").insert({
            user_id: user.id,
            checkin_date: todayISO,
            ai_evening_message: messageBody,
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
        console.error(`[evening-agent] Error for user ${user.id}:`, errorMsg);
        results.push({ userId: user.id, status: "error", error: errorMsg });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const skipped = results.filter((r) => r.status.startsWith("skipped")).length;
    const failed = results.filter(
      (r) => r.status === "failed" || r.status === "error"
    ).length;

    return NextResponse.json({
      message: "Evening agent completed",
      processed: users.length,
      sent,
      skipped,
      failed,
      results,
    });
  } catch (error) {
    console.error("[evening-agent] Unhandled error:", error);
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

function formatAiEveningForSMS(
  userName: string,
  rawAiText: string,
  prioritiesCount: number
): string {
  try {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawAiText);
    } catch {
      const jsonMatch = rawAiText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        data = JSON.parse(jsonMatch[1].trim());
      } else {
        return rawAiText.slice(0, 1500);
      }
    }

    const greeting =
      (data.evening_greeting as string) || `Good evening, ${userName}.`;
    const wins = (data.wins as string) || "";
    const growthEdge = (data.growth_edge as string) || "";
    const scripture = (data.scripture_or_reflection as string) || "";
    const tomorrowSeed = (data.tomorrow_seed as string) || "";
    const closing = (data.closing_word as string) || "";

    const parts = [greeting];

    if (prioritiesCount > 0) {
      parts.push(
        `You set ${prioritiesCount} priorit${prioritiesCount === 1 ? "y" : "ies"} this morning.`
      );
    }

    if (wins) parts.push(wins);
    if (growthEdge) parts.push(growthEdge);
    if (scripture) parts.push(scripture);
    if (tomorrowSeed) parts.push(tomorrowSeed);
    if (closing) parts.push(closing);

    parts.push(
      "Reply with:\n- Wins\n- Struggles\n- Gratitude\n- Day rating (1-10)"
    );

    return parts.join("\n\n").slice(0, 1500);
  } catch {
    return formatEveningReflection(userName, prioritiesCount);
  }
}
