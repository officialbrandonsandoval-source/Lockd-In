// =============================================================================
// Share Card Generation – Create shareable cards with unique codes
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const VALID_CARD_TYPES = [
  "blueprint_summary",
  "streak",
  "weekly_win",
  "invite",
] as const;

type CardType = (typeof VALID_CARD_TYPES)[number];

// ---------------------------------------------------------------------------
// POST /api/share/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
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

    // ── Parse request body ────────────────────────────────────────
    const { cardType, cardData } = await request.json();

    if (!cardType || !VALID_CARD_TYPES.includes(cardType as CardType)) {
      return NextResponse.json(
        {
          error: `Invalid card type. Must be one of: ${VALID_CARD_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!cardData || typeof cardData !== "object") {
      return NextResponse.json(
        { error: "cardData must be a non-null object" },
        { status: 400 }
      );
    }

    // ── Generate unique share code ────────────────────────────────
    const shareCode = generateShareCode();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lockdin.app";
    const shareUrl = `${baseUrl}/s/${shareCode}`;

    // ── Store in share_cards table ────────────────────────────────
    const { data: shareCard, error: insertError } = await supabase
      .from("share_cards")
      .insert({
        user_id: user.id,
        card_type: cardType,
        card_data: cardData,
        share_code: shareCode,
        share_url: shareUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[share/generate] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to create share card" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shareCode,
      shareUrl,
      cardId: shareCard.id,
    });
  } catch (error) {
    console.error("[share/generate] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateShareCode(): string {
  // Generate a short, URL-friendly code
  const uuid = uuidv4().replace(/-/g, "");
  return uuid.slice(0, 12);
}
