import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBlueprint, type BlueprintContext } from "@/lib/ai/claude";

// ---------------------------------------------------------------------------
// GET /api/blueprint/generate?id=...
// Fetch an existing blueprint (used by the reveal page)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const blueprintId = request.nextUrl.searchParams.get("id");

    let query = supabase
      .from("blueprints")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (blueprintId) {
      query = query.eq("id", blueprintId);
    }

    const { data: blueprint, error: fetchError } = await query
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ blueprint });
  } catch (err) {
    console.error("[blueprint/generate GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch blueprint." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/blueprint/generate
// Generate a new blueprint from assessment responses
// ---------------------------------------------------------------------------

export async function POST() {
  try {
    const supabase = createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Fetch assessment responses
    const { data: responses, error: fetchError } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError || !responses || responses.length === 0) {
      return NextResponse.json(
        { error: "No assessment responses found. Please complete the assessment first." },
        { status: 400 }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Build assessment data organized by section
    const assessmentBySection: Record<string, Record<string, unknown>> = {};
    for (const r of responses) {
      if (!assessmentBySection[r.section]) {
        assessmentBySection[r.section] = {};
      }
      assessmentBySection[r.section][r.question_text] = r.response_text;
    }

    // Extract name and age from responses
    const nameResponse = responses.find(
      (r) => r.question_key === "identity_name"
    );
    const ageResponse = responses.find(
      (r) => r.question_key === "identity_age"
    );

    const firstName = nameResponse?.response_text?.split(" ")[0] || profile?.full_name?.split(" ")[0] || "Brother";
    const age = ageResponse?.response_text
      ? parseInt(ageResponse.response_text, 10)
      : undefined;

    // Build context for Claude
    const context: BlueprintContext = {
      assessmentResponses: assessmentBySection,
      userProfile: {
        id: user.id,
        firstName,
        lastName: profile?.full_name?.split(" ").slice(1).join(" ") || undefined,
        email: user.email,
        age: age && !isNaN(age) ? age : undefined,
        location:
          profile?.city && profile?.state
            ? `${profile.city}, ${profile.state}`
            : profile?.city || profile?.state || undefined,
        joinedAt: profile?.created_at,
      },
    };

    // Call Claude to generate the blueprint
    const result = await generateBlueprint(context);

    if (!result.success || !result.data) {
      console.error("[blueprint/generate] Claude error:", result.error);
      return NextResponse.json(
        {
          error:
            result.error ||
            "Failed to generate Blueprint. Please try again.",
        },
        { status: 500 }
      );
    }

    const blueprintData = result.data as Record<string, unknown>;

    // Archive any existing active blueprints
    await supabase
      .from("blueprints")
      .update({ status: "archived" })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Insert the new blueprint
    const { data: newBlueprint, error: insertError } = await supabase
      .from("blueprints")
      .insert({
        user_id: user.id,
        version: 1,
        status: "active",
        identity_statement:
          (blueprintData.identity_statement as string) || null,
        purpose_statement:
          (blueprintData.purpose_statement as string) || null,
        family_vision:
          (blueprintData.family_vision as string) || null,
        core_values:
          (blueprintData.core_values as Record<string, unknown>[]) || null,
        ninety_day_targets:
          (blueprintData.ninety_day_targets as Record<string, unknown>[]) ||
          null,
        daily_non_negotiables:
          (blueprintData.daily_non_negotiables as Record<string, unknown>[]) ||
          null,
        faith_commitments: blueprintData.faith_commitments
          ? JSON.stringify(blueprintData.faith_commitments)
          : null,
        health_targets: blueprintData.health_targets
          ? JSON.stringify(blueprintData.health_targets)
          : null,
        financial_targets: blueprintData.financial_targets
          ? JSON.stringify(blueprintData.financial_targets)
          : null,
        relationship_commitments: blueprintData.relationship_commitments
          ? JSON.stringify(blueprintData.relationship_commitments)
          : null,
        full_blueprint_markdown:
          (blueprintData.full_blueprint_markdown as string) || null,
        ai_analysis:
          (blueprintData.ai_analysis as Record<string, unknown>) || null,
      })
      .select("id")
      .single();

    if (insertError || !newBlueprint) {
      console.error("[blueprint/generate] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save Blueprint." },
        { status: 500 }
      );
    }

    // Update profile: onboarding_completed = true
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    // Create initial streak record
    const { data: existingStreak } = await supabase
      .from("streaks")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!existingStreak) {
      await supabase.from("streaks").insert({
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        total_checkins: 0,
        last_checkin_date: null,
        streak_started_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      blueprintId: newBlueprint.id,
    });
  } catch (err) {
    console.error("[blueprint/generate] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred generating your Blueprint." },
      { status: 500 }
    );
  }
}
