import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentResponseInsert, ProfileUpdate } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AssessmentResponsePayload {
  section: string;
  questionKey: string;
  questionText: string;
  response: string;
}

interface SubmitBody {
  responses: AssessmentResponsePayload[];
}

// ---------------------------------------------------------------------------
// POST /api/assessment/submit
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
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

    // Parse body
    const body: SubmitBody = await request.json();

    if (!body.responses || !Array.isArray(body.responses) || body.responses.length === 0) {
      return NextResponse.json(
        { error: "No assessment responses provided." },
        { status: 400 }
      );
    }

    // Build rows for assessment_responses table
    const rows: AssessmentResponseInsert[] = body.responses.map((r) => ({
      user_id: user.id,
      section: r.section,
      question_key: r.questionKey,
      question_text: r.questionText,
      response_text: r.response,
      response_metadata: null,
    }));

    // Delete any previous assessment responses for this user (allow re-takes)
    await supabase
      .from("assessment_responses")
      .delete()
      .eq("user_id", user.id);

    // Insert all responses
    const { error: insertError } = await supabase
      .from("assessment_responses")
      .insert(rows as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (insertError) {
      console.error("[assessment/submit] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save assessment responses." },
        { status: 500 }
      );
    }

    // Extract profile-relevant data from responses
    const responseMap = new Map<string, string>();
    for (const r of body.responses) {
      responseMap.set(r.questionKey, r.response);
    }

    const nameResponse = responseMap.get("identity_name") || "";
    const ageResponse = responseMap.get("identity_age") || "";
    const maritalStatus = responseMap.get("family_relationship_status") || null;
    const childrenResponse = responseMap.get("family_children") || "";

    // Determine if they have children based on their response
    const hasChildren =
      childrenResponse.trim() !== "" &&
      !childrenResponse.toLowerCase().includes("no") &&
      !childrenResponse.toLowerCase().includes("not yet") &&
      !childrenResponse.toLowerCase().includes("none") &&
      childrenResponse.toLowerCase() !== "n/a";

    // Build profile update
    const profileUpdate: ProfileUpdate = {};

    if (nameResponse) {
      profileUpdate.full_name = nameResponse;
    }
    if (ageResponse) {
      const age = parseInt(ageResponse, 10);
      if (!isNaN(age) && age > 0) {
        // Calculate approximate date of birth
        const now = new Date();
        const birthYear = now.getFullYear() - age;
        profileUpdate.date_of_birth = `${birthYear}-01-01`;
      }
    }
    if (maritalStatus) {
      profileUpdate.marital_status = maritalStatus;
    }
    profileUpdate.has_children = hasChildren;

    // Update profile
    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .eq("id", user.id);

      if (profileError) {
        console.error("[assessment/submit] Profile update error:", profileError);
        // Non-fatal — continue
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[assessment/submit] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
