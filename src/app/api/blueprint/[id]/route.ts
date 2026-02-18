// =============================================================================
// Blueprint API – GET / PUT by ID
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BlueprintUpdate } from "@/lib/supabase/types";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// GET /api/blueprint/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // ── Verify authentication ─────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const blueprintId = params.id;

    // ── Fetch blueprint ───────────────────────────────────────────
    const { data: blueprint, error: fetchError } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", blueprintId)
      .single();

    if (fetchError || !blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    // ── Authorization check: ensure user owns the blueprint ──────
    if (blueprint.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("[blueprint/GET] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/blueprint/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // ── Verify authentication ─────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const blueprintId = params.id;

    // ── Check blueprint ownership ─────────────────────────────────
    const { data: existing, error: checkError } = await supabase
      .from("blueprints")
      .select("id, user_id")
      .eq("id", blueprintId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ── Parse and validate update body ────────────────────────────
    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields: (keyof BlueprintUpdate)[] = [
      "identity_statement",
      "purpose_statement",
      "family_vision",
      "core_values",
      "ninety_day_targets",
      "daily_non_negotiables",
      "faith_commitments",
      "health_targets",
      "financial_targets",
      "relationship_commitments",
      "full_blueprint_markdown",
      "ai_analysis",
      "status",
    ];

    const updates: Partial<BlueprintUpdate> = {};

    for (const field of allowedFields) {
      if (field in body) {
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Always set updated_at
    (updates as Record<string, unknown>).updated_at = new Date().toISOString();

    // ── Perform update ────────────────────────────────────────────
    const { data: updated, error: updateError } = await supabase
      .from("blueprints")
      .update(updates)
      .eq("id", blueprintId)
      .select()
      .single();

    if (updateError) {
      console.error("[blueprint/PUT] Update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update blueprint" },
        { status: 500 }
      );
    }

    return NextResponse.json({ blueprint: updated });
  } catch (error) {
    console.error("[blueprint/PUT] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
