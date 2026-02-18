import Anthropic from "@anthropic-ai/sdk";
import { BLUEPRINT_SYSTEM_PROMPT, formatBlueprintUserMessage } from "./prompts/blueprint-generator";
import { MORNING_AGENT_SYSTEM_PROMPT, formatMorningContext } from "./prompts/morning-agent";
import { EVENING_AGENT_SYSTEM_PROMPT, formatEveningContext } from "./prompts/evening-agent";
import { WEEKLY_PULSE_SYSTEM_PROMPT, formatWeeklyContext } from "./prompts/weekly-pulse";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlueprintContext {
  assessmentResponses: Record<string, unknown>;
  userProfile: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    age?: number;
    location?: string;
    joinedAt?: string;
  };
}

export interface MorningContext {
  blueprint: Record<string, unknown>;
  streak: number;
  previousCheckins: Record<string, unknown>[];
  todayDate: string;
  userName: string;
}

export interface EveningContext {
  blueprint: Record<string, unknown>;
  morningCommitments: string[];
  dailyActivity: Record<string, unknown>;
  streak: number;
  userName: string;
  todayDate: string;
}

export interface WeeklyContext {
  blueprint: Record<string, unknown>;
  weeklyCheckins: Record<string, unknown>[];
  streak: number;
  weekNumber: number;
  userName: string;
  weekStartDate: string;
  weekEndDate: string;
}

export interface ClaudeResponse<T = unknown> {
  success: boolean;
  data: T | null;
  rawText: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ---------------------------------------------------------------------------
// Client initialization
// ---------------------------------------------------------------------------

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS_BLUEPRINT = 8192;
const MAX_TOKENS_MESSAGE = 2048;
const MAX_TOKENS_WEEKLY = 4096;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment variables."
    );
  }
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// Core helper – call Claude with structured error handling
// ---------------------------------------------------------------------------

export async function callClaude<T = unknown>({
  systemPrompt,
  userMessage,
  maxTokens = MAX_TOKENS_MESSAGE,
  parseJson = true,
}: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  parseJson?: boolean;
}): Promise<ClaudeResponse<T>> {
  try {
    const client = getClient();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const rawText = textBlock ? textBlock.text : "";

    let data: T | null = null;

    if (parseJson && rawText) {
      try {
        // Try parsing the entire response as JSON first
        data = JSON.parse(rawText) as T;
      } catch {
        // If that fails, try extracting JSON from markdown code fences
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            data = JSON.parse(jsonMatch[1].trim()) as T;
          } catch {
            // JSON extraction failed – leave data as null
          }
        }
      }
    }

    return {
      success: true,
      data,
      rawText,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    const message =
      error instanceof Anthropic.APIError
        ? `Claude API error (${error.status}): ${error.message}`
        : error instanceof Error
          ? error.message
          : "Unknown error calling Claude API";

    console.error("[claude] callClaude failed:", message);

    return {
      success: false,
      data: null,
      rawText: "",
      error: message,
    };
  }
}

// ---------------------------------------------------------------------------
// Domain-specific functions
// ---------------------------------------------------------------------------

/**
 * Generate a full Blueprint from a user's assessment responses.
 */
export async function generateBlueprint(
  context: BlueprintContext
): Promise<ClaudeResponse> {
  const userMessage = formatBlueprintUserMessage(
    context.assessmentResponses,
    context.userProfile
  );

  return callClaude({
    systemPrompt: BLUEPRINT_SYSTEM_PROMPT,
    userMessage,
    maxTokens: MAX_TOKENS_BLUEPRINT,
    parseJson: true,
  });
}

/**
 * Generate a personalised morning check-in message.
 */
export async function generateMorningMessage(
  context: MorningContext
): Promise<ClaudeResponse> {
  const userMessage = formatMorningContext({
    blueprint: context.blueprint,
    streak: context.streak,
    previousCheckins: context.previousCheckins,
    todayDate: context.todayDate,
    userName: context.userName,
  });

  return callClaude({
    systemPrompt: MORNING_AGENT_SYSTEM_PROMPT,
    userMessage,
    maxTokens: MAX_TOKENS_MESSAGE,
    parseJson: true,
  });
}

/**
 * Generate a personalised evening reflection message.
 */
export async function generateEveningMessage(
  context: EveningContext
): Promise<ClaudeResponse> {
  const userMessage = formatEveningContext({
    blueprint: context.blueprint,
    morningCommitments: context.morningCommitments,
    dailyActivity: context.dailyActivity,
    streak: context.streak,
    userName: context.userName,
    todayDate: context.todayDate,
  });

  return callClaude({
    systemPrompt: EVENING_AGENT_SYSTEM_PROMPT,
    userMessage,
    maxTokens: MAX_TOKENS_MESSAGE,
    parseJson: true,
  });
}

/**
 * Generate a weekly pulse / review summary.
 */
export async function generateWeeklyPulse(
  context: WeeklyContext
): Promise<ClaudeResponse> {
  const userMessage = formatWeeklyContext({
    blueprint: context.blueprint,
    weeklyCheckins: context.weeklyCheckins,
    streak: context.streak,
    weekNumber: context.weekNumber,
    userName: context.userName,
    weekStartDate: context.weekStartDate,
    weekEndDate: context.weekEndDate,
  });

  return callClaude({
    systemPrompt: WEEKLY_PULSE_SYSTEM_PROMPT,
    userMessage,
    maxTokens: MAX_TOKENS_WEEKLY,
    parseJson: true,
  });
}
