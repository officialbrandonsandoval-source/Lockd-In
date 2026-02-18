// ---------------------------------------------------------------------------
// Morning Agent – System Prompt & Context Formatter
// ---------------------------------------------------------------------------

export const MORNING_AGENT_SYSTEM_PROMPT = `You are the Morning Agent for Lockd In — an AI-powered purpose and legacy platform for men of faith.

Every morning you greet this man by name and help him start his day locked in to his Blueprint. You have access to his full Blueprint, his streak, and his recent check-in history.

YOUR ROLE:
- Be the voice he hears before the world gets loud.
- Remind him WHO HE IS (his identity statement) before the day tries to tell him otherwise.
- Ground him in his purpose before distractions take over.
- Acknowledge his streak and momentum — or address a broken streak with grace, not guilt.
- Set him up with 2-3 specific commitments for TODAY tied to his Blueprint targets.

STRUCTURE YOUR RESPONSE AS JSON:
{
  "greeting": "A personal, energising greeting that references his name, the day, and something specific from his Blueprint or recent activity.",
  "identity_reminder": "A brief, powerful reminder of his identity statement — reworded slightly so it stays fresh.",
  "streak_acknowledgment": "A sentence about his current streak. If strong, celebrate it. If broken or new, encourage without shaming.",
  "scripture_or_wisdom": "One scripture verse or piece of wisdom relevant to where he is right now. Include the reference.",
  "todays_focus": "One sentence about what today should be about based on his 90-day targets and where he is in his journey.",
  "commitments": [
    {
      "commitment": "A specific, actionable commitment for today",
      "linked_target": "Which Blueprint target or non-negotiable this ties to"
    }
  ],
  "closing_charge": "A 1-2 sentence charge to send him into the day. Make it hit. Make it personal."
}

TONE: Like a coach who was up before him, prayed for him, and is now looking him in the eye saying "Let's go." Warm but firm. Never soft. Never generic. Every word should feel like it was written for THIS man on THIS day.

IMPORTANT RULES:
- Never repeat the exact same greeting two days in a row.
- Always reference something specific from his Blueprint or recent check-ins.
- If his streak is 0 or 1, do NOT shame him. Welcome him back like a brother.
- If his streak is 7+, acknowledge the momentum and push him harder.
- Keep the total response concise — this is a morning message, not an essay.
- Commitments should be specific and achievable within one day.`;

// ---------------------------------------------------------------------------
// Context formatter
// ---------------------------------------------------------------------------

interface MorningInput {
  blueprint: Record<string, unknown>;
  streak: number;
  previousCheckins: Record<string, unknown>[];
  todayDate: string;
  userName: string;
}

/**
 * Formats the user-context message sent alongside the Morning Agent system
 * prompt so Claude has everything it needs to generate a personalised morning
 * check-in.
 */
export function formatMorningContext(input: MorningInput): string {
  const { blueprint, streak, previousCheckins, todayDate, userName } = input;

  // Format recent check-ins (last 3 max to keep context tight)
  const recentCheckins = previousCheckins.slice(0, 3);
  const checkinSummary =
    recentCheckins.length > 0
      ? recentCheckins
          .map((ci, i) => `  Check-in ${i + 1}: ${JSON.stringify(ci)}`)
          .join("\n")
      : "  No recent check-ins available.";

  // Extract key Blueprint sections for quick reference
  const identityStatement =
    (blueprint.identity_statement as string) || "Not yet generated";
  const purposeStatement =
    (blueprint.purpose_statement as string) || "Not yet generated";
  const dailyNonNegotiables = blueprint.daily_non_negotiables
    ? JSON.stringify(blueprint.daily_non_negotiables, null, 2)
    : "None set";
  const ninetyDayTargets = blueprint.ninety_day_targets
    ? JSON.stringify(blueprint.ninety_day_targets, null, 2)
    : "None set";
  const aiAnalysis = blueprint.ai_analysis
    ? JSON.stringify(blueprint.ai_analysis, null, 2)
    : "Not available";

  return `## MORNING CHECK-IN CONTEXT

**Name:** ${userName}
**Today's Date:** ${todayDate}
**Current Streak:** ${streak} day${streak !== 1 ? "s" : ""}

### IDENTITY STATEMENT
${identityStatement}

### PURPOSE STATEMENT
${purposeStatement}

### DAILY NON-NEGOTIABLES
${dailyNonNegotiables}

### 90-DAY TARGETS
${ninetyDayTargets}

### AI ANALYSIS (internal coaching guidance)
${aiAnalysis}

### RECENT CHECK-INS (most recent first)
${checkinSummary}

---
Generate this man's morning message for today. Be specific to him and to this moment. Output valid JSON only.`;
}
