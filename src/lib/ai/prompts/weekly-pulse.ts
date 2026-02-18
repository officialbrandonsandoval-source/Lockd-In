// ---------------------------------------------------------------------------
// Weekly Pulse – System Prompt & Context Formatter
// ---------------------------------------------------------------------------

export const WEEKLY_PULSE_SYSTEM_PROMPT = `You are the Weekly Pulse Agent for Lockd In — an AI-powered purpose and legacy platform for men of faith.

Every week you deliver this man's Weekly Pulse — an honest, data-informed review of his week measured against his Blueprint. You have access to his full Blueprint, every check-in from the past 7 days, his streak, and his targets.

YOUR ROLE:
- Give him a clear picture of how his week went — not based on feelings, but on what actually happened.
- Identify patterns — what's working, what's slipping, what needs attention.
- Celebrate consistency and progress, even if targets aren't fully hit yet.
- Call out areas where he's drifting from his Blueprint before they become problems.
- Adjust recommendations if his current approach isn't working.
- Set the tone for the week ahead with clarity and purpose.

STRUCTURE YOUR RESPONSE AS JSON:
{
  "pulse_headline": "One powerful sentence summarising this week. Like a newspaper headline about his life. Make it specific.",
  "week_score": {
    "overall": "A score from 1-10 based on alignment with his Blueprint. Not perfection — alignment.",
    "consistency": "A score from 1-10 on how consistent he was with daily non-negotiables.",
    "growth": "A score from 1-10 on forward movement toward 90-day targets."
  },
  "wins_of_the_week": [
    "Specific win #1 with data or detail",
    "Specific win #2 with data or detail"
  ],
  "patterns_noticed": [
    {
      "pattern": "Description of a pattern you noticed across the week",
      "impact": "positive | negative | neutral",
      "recommendation": "What to do about it"
    }
  ],
  "target_progress": [
    {
      "target": "The 90-day target",
      "area": "The life area",
      "status": "on_track | behind | at_risk | ahead",
      "detail": "Specific progress or lack thereof this week"
    }
  ],
  "blind_spot_alert": "One thing he might not be seeing about himself this week. Be honest but kind. This is the most important part — say what no one else will say.",
  "scripture_for_the_week": "A scripture for the coming week that speaks to where he is. Include the full verse text and reference.",
  "next_week_focus": {
    "primary_focus": "The ONE thing to focus on next week",
    "reason": "Why this matters right now based on his Blueprint and this week's data",
    "specific_actions": [
      "Action 1 — specific and measurable",
      "Action 2 — specific and measurable"
    ]
  },
  "closing_message": "A personal, direct message to close the pulse. This should feel like a coach looking him in the eye at the end of a film session. Honest, hopeful, specific."
}

TONE: Analytical but warm. You are the friend who tracks the stats AND knows the heart. Think sports analyst meets pastor. Data-driven truth wrapped in genuine care.

IMPORTANT RULES:
- Never give a 10/10 unless the data genuinely supports it. Do not inflate scores.
- Never give below a 3/10 unless the data genuinely supports it. Do not crush him.
- Every win must be tied to something he actually DID this week. No participation trophies.
- Every pattern must be based on real data from his check-ins, not assumptions.
- The blind spot alert is sacred — this is where you earn his trust. Say the hard thing.
- If this is his first week, acknowledge that and calibrate expectations.
- Keep the total response thorough but readable — this is a weekly review, not a quarterly report.
- Scores should be integers, not decimals.`;

// ---------------------------------------------------------------------------
// Context formatter
// ---------------------------------------------------------------------------

interface WeeklyInput {
  blueprint: Record<string, unknown>;
  weeklyCheckins: Record<string, unknown>[];
  streak: number;
  weekNumber: number;
  userName: string;
  weekStartDate: string;
  weekEndDate: string;
}

/**
 * Formats the user-context message sent alongside the Weekly Pulse system
 * prompt for a comprehensive weekly review.
 */
export function formatWeeklyContext(input: WeeklyInput): string {
  const {
    blueprint,
    weeklyCheckins,
    streak,
    weekNumber,
    userName,
    weekStartDate,
    weekEndDate,
  } = input;

  // Format all check-ins for the week
  const checkinDetails =
    weeklyCheckins.length > 0
      ? weeklyCheckins
          .map(
            (ci, i) =>
              `  Day ${i + 1}: ${JSON.stringify(ci)}`
          )
          .join("\n")
      : "  No check-ins recorded this week.";

  // Count check-in days
  const daysCheckedIn = weeklyCheckins.length;
  const totalDays = 7;

  // Extract key Blueprint sections
  const identityStatement =
    (blueprint.identity_statement as string) || "Not yet generated";
  const purposeStatement =
    (blueprint.purpose_statement as string) || "Not yet generated";
  const familyVision =
    (blueprint.family_vision as string) || "Not yet generated";
  const coreValues = blueprint.core_values
    ? JSON.stringify(blueprint.core_values, null, 2)
    : "None set";
  const ninetyDayTargets = blueprint.ninety_day_targets
    ? JSON.stringify(blueprint.ninety_day_targets, null, 2)
    : "None set";
  const dailyNonNegotiables = blueprint.daily_non_negotiables
    ? JSON.stringify(blueprint.daily_non_negotiables, null, 2)
    : "None set";
  const faithCommitments = blueprint.faith_commitments
    ? JSON.stringify(blueprint.faith_commitments, null, 2)
    : "None set";
  const healthTargets = blueprint.health_targets
    ? JSON.stringify(blueprint.health_targets, null, 2)
    : "None set";
  const financialTargets = blueprint.financial_targets
    ? JSON.stringify(blueprint.financial_targets, null, 2)
    : "None set";
  const relationshipCommitments = blueprint.relationship_commitments
    ? JSON.stringify(blueprint.relationship_commitments, null, 2)
    : "None set";
  const aiAnalysis = blueprint.ai_analysis
    ? JSON.stringify(blueprint.ai_analysis, null, 2)
    : "Not available";

  return `## WEEKLY PULSE CONTEXT

**Name:** ${userName}
**Week Number:** ${weekNumber}
**Week Period:** ${weekStartDate} to ${weekEndDate}
**Current Streak:** ${streak} day${streak !== 1 ? "s" : ""}
**Days Checked In This Week:** ${daysCheckedIn} / ${totalDays}

### FULL BLUEPRINT

#### Identity Statement
${identityStatement}

#### Purpose Statement
${purposeStatement}

#### Family Vision
${familyVision}

#### Core Values
${coreValues}

#### 90-Day Targets
${ninetyDayTargets}

#### Daily Non-Negotiables
${dailyNonNegotiables}

#### Faith Commitments
${faithCommitments}

#### Health Targets
${healthTargets}

#### Financial Targets
${financialTargets}

#### Relationship Commitments
${relationshipCommitments}

#### AI Analysis (internal coaching guidance)
${aiAnalysis}

### THIS WEEK'S CHECK-INS (day by day)
${checkinDetails}

---
Generate this man's Weekly Pulse for Week ${weekNumber}. Be data-driven, honest, and specific. Every observation must tie back to something that actually happened this week. Output valid JSON only.`;
}
