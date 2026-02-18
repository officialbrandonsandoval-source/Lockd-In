// =============================================================================
// SMS Send – Outbound SMS via Twilio
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSMS } from "@/lib/twilio/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/sms/send
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
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

    // ── Parse request body ────────────────────────────────────────
    const { userId, messageType, messageBody } = await request.json();

    if (!userId || !messageType || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields: userId, messageType, messageBody" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // ── Look up user's phone number ──────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone, full_name, sms_opt_in")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!profile.phone) {
      return NextResponse.json(
        { error: "User has no phone number on file" },
        { status: 400 }
      );
    }

    if (!profile.sms_opt_in) {
      return NextResponse.json(
        { error: "User has not opted in to SMS" },
        { status: 400 }
      );
    }

    // ── Send SMS via Twilio ──────────────────────────────────────
    const result = await sendSMS(profile.phone, messageBody);

    // ── Log in sms_logs table ────────────────────────────────────
    await supabase.from("sms_logs").insert({
      user_id: userId,
      direction: "outbound",
      message_type: messageType,
      message_body: messageBody,
      twilio_sid: result.messageSid || null,
      status: result.success ? "sent" : "failed",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `SMS send failed: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageSid: result.messageSid,
    });
  } catch (error) {
    console.error("[sms/send] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
