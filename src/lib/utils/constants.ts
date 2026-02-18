// =============================================================================
// App-wide Constants for Lockd In
// =============================================================================

export const APP_NAME = "Lockd In" as const;
export const APP_DESCRIPTION =
  "A faith-driven personal blueprint and accountability platform for men." as const;

// ---------------------------------------------------------------------------
// Assessment Sections
// ---------------------------------------------------------------------------

export const ASSESSMENT_SECTIONS = [
  "identity",
  "faith",
  "family",
  "fitness",
  "finances",
  "focus",
  "future",
] as const;

export type AssessmentSection = (typeof ASSESSMENT_SECTIONS)[number];

export const ASSESSMENT_SECTION_LABELS: Record<AssessmentSection, string> = {
  identity: "Identity & Purpose",
  faith: "Faith & Spirituality",
  family: "Family & Relationships",
  fitness: "Fitness & Health",
  finances: "Finances & Career",
  focus: "Focus & Discipline",
  future: "Future & Vision",
};

// ---------------------------------------------------------------------------
// Assessment Questions
// ---------------------------------------------------------------------------

export interface AssessmentQuestion {
  key: string;
  section: AssessmentSection;
  text: string;
  type: "text" | "scale" | "select" | "multiline";
  options?: string[];
  placeholder?: string;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // --- Identity & Purpose (6 questions) ---
  { key: "identity_1", section: "identity", text: "How would you describe who you are at your core — beyond your job title or roles?", type: "multiline", placeholder: "Describe your core identity..." },
  { key: "identity_2", section: "identity", text: "What is the legacy you want to leave behind?", type: "multiline", placeholder: "Describe the legacy you envision..." },
  { key: "identity_3", section: "identity", text: "What are three words your closest friends would use to describe you?", type: "text", placeholder: "e.g. loyal, driven, compassionate" },
  { key: "identity_4", section: "identity", text: "What does being a man of integrity mean to you?", type: "multiline", placeholder: "Share your thoughts..." },
  { key: "identity_5", section: "identity", text: "On a scale of 1-10, how aligned do you feel your daily actions are with your deepest values?", type: "scale" },
  { key: "identity_6", section: "identity", text: "What is one area of your identity you feel needs the most growth right now?", type: "multiline", placeholder: "Share an area of growth..." },

  // --- Faith & Spirituality (6 questions) ---
  { key: "faith_1", section: "faith", text: "How would you describe your current relationship with God or your spiritual life?", type: "multiline", placeholder: "Describe your spiritual life..." },
  { key: "faith_2", section: "faith", text: "How often do you engage in prayer, scripture reading, or spiritual practices?", type: "select", options: ["Daily", "Several times a week", "Weekly", "Occasionally", "Rarely"] },
  { key: "faith_3", section: "faith", text: "What scripture or spiritual truth has been most impactful in your life?", type: "multiline", placeholder: "Share a verse or truth..." },
  { key: "faith_4", section: "faith", text: "Are you part of a church or faith community? How connected do you feel there?", type: "multiline", placeholder: "Describe your community involvement..." },
  { key: "faith_5", section: "faith", text: "On a scale of 1-10, how strong is your spiritual foundation right now?", type: "scale" },
  { key: "faith_6", section: "faith", text: "What does spiritual leadership in your home look like to you?", type: "multiline", placeholder: "Share your vision..." },

  // --- Family & Relationships (6 questions) ---
  { key: "family_1", section: "family", text: "What does your ideal family life look like?", type: "multiline", placeholder: "Describe your vision for family..." },
  { key: "family_2", section: "family", text: "How would you rate the current quality of your most important relationship?", type: "scale" },
  { key: "family_3", section: "family", text: "What is one thing you wish you did more of with your family or partner?", type: "multiline", placeholder: "Share something you'd like to do more..." },
  { key: "family_4", section: "family", text: "Do you have a trusted circle of men who hold you accountable?", type: "select", options: ["Yes, very strong", "Yes, but could be stronger", "Somewhat", "Not really", "No"] },
  { key: "family_5", section: "family", text: "How do you handle conflict in your closest relationships?", type: "multiline", placeholder: "Describe your approach to conflict..." },
  { key: "family_6", section: "family", text: "What legacy do you want to build for your children or the next generation?", type: "multiline", placeholder: "Describe the legacy..." },

  // --- Fitness & Health (5 questions) ---
  { key: "fitness_1", section: "fitness", text: "How would you describe your current physical health and fitness level?", type: "multiline", placeholder: "Describe your current fitness..." },
  { key: "fitness_2", section: "fitness", text: "How many days per week do you exercise or move intentionally?", type: "select", options: ["6-7 days", "4-5 days", "2-3 days", "1 day", "Rarely"] },
  { key: "fitness_3", section: "fitness", text: "How would you rate your sleep quality on most nights?", type: "scale" },
  { key: "fitness_4", section: "fitness", text: "What is your biggest health goal for the next 90 days?", type: "multiline", placeholder: "Describe your health goal..." },
  { key: "fitness_5", section: "fitness", text: "How do you manage stress and mental health?", type: "multiline", placeholder: "Describe your stress management..." },

  // --- Finances & Career (5 questions) ---
  { key: "finances_1", section: "finances", text: "How would you describe your current financial situation?", type: "multiline", placeholder: "Describe your finances..." },
  { key: "finances_2", section: "finances", text: "Do you have a clear financial plan or budget?", type: "select", options: ["Yes, detailed plan", "Basic budget", "Somewhat", "Not really", "No"] },
  { key: "finances_3", section: "finances", text: "How fulfilled are you in your current career or business?", type: "scale" },
  { key: "finances_4", section: "finances", text: "What is your biggest financial goal for the next 90 days?", type: "multiline", placeholder: "Describe your financial goal..." },
  { key: "finances_5", section: "finances", text: "How does your work align with your purpose and values?", type: "multiline", placeholder: "Describe the alignment..." },

  // --- Focus & Discipline (5 questions) ---
  { key: "focus_1", section: "focus", text: "What does your morning routine look like?", type: "multiline", placeholder: "Describe your morning routine..." },
  { key: "focus_2", section: "focus", text: "How often do you feel distracted or pulled away from your priorities?", type: "select", options: ["Rarely", "Sometimes", "Often", "Very often", "Constantly"] },
  { key: "focus_3", section: "focus", text: "On a scale of 1-10, how disciplined would you say you are right now?", type: "scale" },
  { key: "focus_4", section: "focus", text: "What is one habit you want to build in the next 90 days?", type: "multiline", placeholder: "Describe the habit..." },
  { key: "focus_5", section: "focus", text: "What is your biggest time waster, and what would you replace it with?", type: "multiline", placeholder: "Identify your time waster..." },

  // --- Future & Vision (6 questions) ---
  { key: "future_1", section: "future", text: "Where do you see yourself in 1 year if you stay fully committed?", type: "multiline", placeholder: "Describe your 1-year vision..." },
  { key: "future_2", section: "future", text: "Where do you see yourself in 5 years?", type: "multiline", placeholder: "Describe your 5-year vision..." },
  { key: "future_3", section: "future", text: "What is one dream you have been putting off?", type: "multiline", placeholder: "Share a dream you've delayed..." },
  { key: "future_4", section: "future", text: "What would you attempt if you knew you could not fail?", type: "multiline", placeholder: "Share your boldest ambition..." },
  { key: "future_5", section: "future", text: "On a scale of 1-10, how excited are you about the direction of your life right now?", type: "scale" },
  { key: "future_6", section: "future", text: "What is the single biggest thing standing between you and the man you want to become?", type: "multiline", placeholder: "Identify the obstacle..." },
];

export const TOTAL_ASSESSMENT_QUESTIONS = ASSESSMENT_QUESTIONS.length; // 39

// ---------------------------------------------------------------------------
// Streak Milestones
// ---------------------------------------------------------------------------

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

// ---------------------------------------------------------------------------
// Color Constants (matching Tailwind brand tokens)
// ---------------------------------------------------------------------------

export const COLORS = {
  // Brand palette
  gold: "#C9A84C",
  goldLight: "#D4B965",
  goldDark: "#B8943A",
  background: "#0F0F0F",
  card: "#1A1A1A",
  cardHover: "#222222",
  border: "#2A2A2A",
  borderActive: "#3A3A3A",

  // Text
  textPrimary: "#F5F5F5",
  textSecondary: "#A3A3A3",
  textMuted: "#737373",

  // Status
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  info: "#3B82F6",

  // Streak tier colors
  streakBronze: "#CD7F32",
  streakSilver: "#C0C0C0",
  streakGold: "#C9A84C",
  streakPlatinum: "#E5E4E2",
  streakDiamond: "#B9F2FF",
} as const;

// ---------------------------------------------------------------------------
// Default Times
// ---------------------------------------------------------------------------

export const DEFAULT_MORNING_TIME = "06:00" as const;
export const DEFAULT_EVENING_TIME = "21:00" as const;

// ---------------------------------------------------------------------------
// Day Rating
// ---------------------------------------------------------------------------

export const MIN_DAY_RATING = 1;
export const MAX_DAY_RATING = 10;

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export const MAX_PRIORITIES_PER_DAY = 3;
export const MAX_WINS_PER_DAY = 3;
export const MAX_STRUGGLES_PER_DAY = 3;
export const MAX_GRATITUDE_PER_DAY = 3;

export const BLUEPRINT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type BlueprintStatus =
  (typeof BLUEPRINT_STATUS)[keyof typeof BLUEPRINT_STATUS];
