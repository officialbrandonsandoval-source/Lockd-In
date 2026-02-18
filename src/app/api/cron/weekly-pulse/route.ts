// =============================================================================
// Cron: Weekly Pulse – Generate & send weekly summary (runs Sunday evenings)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateWeeklyPulse } from "@/lib/ai/claude";
import { sendSMS } from "@/lib/twilio/messages";
import { formatWeeklyPulse } from "@/lib/twilio/messages";
import { format, subDays, startOfWeek, endOfWeek, getISOWeek } from "date-fns";

export const runtime = "nodejs";
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// GET /api/cron/weekly-pulse
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
      .select("id, full_name, phone, timezone, sms_opt_in")
      .eq("sms_opt_in", true)
      .not("phone", "is", null);

    if (usersError) {
      console.error("[weekly-pulse] Failed to fetch users:", usersError.message);
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
        const userTimezone = user.timezone || "America/New_York";
        const now = new Date();

        // Calculate week range (Monday–Sunday)
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const weekStartISO = format(weekStart, "yyyy-MM-dd");
        const weekEndISO = format(weekEnd, "yyyy-MM-dd");
        const weekNumber = getISOWeek(now);

        // Check if pulse was already generated for this week
        const { data: existingPulse } = await supabase
          .from("weekly_pulses")
          .select("id")
          .eq("user_id", user.id)
          .eq("week_start", weekStartISO)
          .maybeSingle();

        if (existingPulse) {
          results.push({ userId: user.id, status: "skipped_already_generated" });
          continue;
        }

        // Fetch this week's check-ins
        const { data: weeklyCheckins } = await supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", user.id)
          .gte("checkin_date", weekStartISO)
          .lte("checkin_date", weekEndISO)
          .order("checkin_date", { ascending: true });

        const checkinCount = weeklyCheckins?.length ?? 0;

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

        let messageBody: string;
        let fullPulseMarkdown: string | null = null;
        let pulseData: Record<string, unknown> = {};

        if (blueprint && checkinCount > 0) {
          // Generate AI weekly pulse
          const aiResponse = await generateWeeklyPulse({
            blueprint: blueprint as unknown as Record<string, unknown>,
            weeklyCheckins: (weeklyCheckins || []) as unknown as Record<string, unknown>[],
            streak: currentStreak,
            weekNumber,
            userName,
            weekStartDate: weekStartISO,
            weekEndDate: weekEndISO,
          });

          if (aiResponse.success && aiResponse.rawText) {
            fullPulseMarkdown = aiResponse.rawText;
            pulseData = (aiResponse.data || {}) as Record<string, unknown>;
            messageBody = formatAiPulseForSMS(userName, aiResponse.rawText, weekNumber, checkinCount);
          } else {
            messageBody = formatWeeklyPulse(userName, weekNumber, checkinCount);
          }
        } else {
          messageBody = formatWeeklyPulse(userName, weekNumber, checkinCount);
        }

        // Store the full pulse in weekly_pulses
        const alignmentScore =
          typeof pulseData.week_score === "object" && pulseData.week_score
            ? parseInt(
                String(
                  (pulseData.week_score as Record<string, unknown>).overall ?? "0"
                ),
                10
              ) || null
            : null;

        const winsArr = pulseData.wins_of_the_week as string[] | undefined;
        const winsSummary = winsArr ? winsArr.join("; ") : null;

        const patterns = pulseData.patterns_noticed as
          | { pattern: string; impact: string; recommendation: string }[]
          | undefined;
        const patternInsights = patterns
          ? patterns.map((p) => `${p.pattern} (${p.impact}): ${p.recommendation}`).join("; ")
          : null;

        const nextWeek = pulseData.next_week_focus as
          | { primary_focus: string; reason: string }
          | undefined;
        const nextWeekFocus = nextWeek
          ? `${nextWeek.primary_focus}: ${nextWeek.reason}`
          : null;

        const scriptureForWeek =
          (pulseData.scripture_for_the_week as string) || null;
        const blindSpot =
          (pulseData.blind_spot_alert as string) || null;

        await supabase.from("weekly_pulses").insert({
          user_id: user.id,
          week_start: weekStartISO,
          week_end: weekEndISO,
          alignment_score: alignmentScore,
          wins_summary: winsSummary,
          growth_areas: blindSpot,
          pattern_insights: patternInsights,
          next_week_focus: nextWeekFocus,
          scripture_encouragement: scriptureForWeek,
          full_pulse_markdown: fullPulseMarkdown,
        });

        // Send SMS
        const smsResult = await sendSMS(user.phone!, messageBody);

        // Log outbound message
        await supabase.from("sms_logs").insert({
          user_id: user.id,
          direction: "outbound",
          message_type: "weekly_pulse",
          message_body: messageBody,
          twilio_sid: smsResult.messageSid || null,
          status: smsResult.success ? "sent" : "failed",
        });

        results.push({
          userId: user.id,
          status: smsResult.success ? "sent" : "failed",
          error: smsResult.error,
        });
      } catch (userError) {
        const errorMsg =
          userError instanceof Error ? userError.message : "Unknown error";
        console.error(`[weekly-pulse] Error for user ${user.id}:`, errorMsg);
        results.push({ userId: user.id, status: "error", error: errorMsg });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const skipped = results.filter((r) => r.status.startsWith("skipped")).length;
    const failed = results.filter(
      (r) => r.status === "failed" || r.status === "error"
    ).length;

    return NextResponse.json({
      message: "Weekly pulse completed",
      processed: users.length,
      sent,
      skipped,
      failed,
      results,
    });
  } catch (error) {
    console.error("[weekly-pulse] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAiPulseForSMS(
  userName: string,
  rawAiText: string,
  weekNumber: number,
  checkinCount: number
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
        return formatWeeklyPulse(userName, weekNumber, checkinCount);
      }
    }

    const headline = (data.pulse_headline as string) || "";
    const weekScore = data.week_score as
      | { overall: string | number }
      | undefined;
    const overallScore = weekScore?.overall ?? "N/A";
    const wins = data.wins_of_the_week as string[] | undefined;
    const closingMessage = (data.closing_message as string) || "";
    const nextWeek = data.next_week_focus as
      | { primary_focus: string }
      | undefined;

    const parts = [
      `Weekly Pulse - Week ${weekNumber}`,
      "",
      `${userName}, ${headline}`,
      "",
      `Alignment Score: ${overallScore}/10`,
      `Check-ins: ${checkinCount}/7`,
    ];

    if (wins && wins.length > 0) {
      parts.push("");
      parts.push("Wins:");
      wins.slice(0, 2).forEach((w) => parts.push(`- ${w}`));
    }

    if (nextWeek?.primary_focus) {
      parts.push("");
      parts.push(`Next week's focus: ${nextWeek.primary_focus}`);
    }

    if (closingMessage) {
      parts.push("");
      parts.push(closingMessage);
    }

    parts.push("");
    parts.push("Full report ready in your Lockd In app.");

    return parts.join("\n").slice(0, 1500);
  } catch {
    return formatWeeklyPulse(userName, weekNumber, checkinCount);
  }
}
