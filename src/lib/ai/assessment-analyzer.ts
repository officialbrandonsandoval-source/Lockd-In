// ---------------------------------------------------------------------------
// Assessment Analyzer
//
// Processes raw assessment responses into structured input for Blueprint
// generation. Groups responses by section and creates a narrative summary
// that Claude can use to generate a deeply personalised Blueprint.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawAssessmentResponse {
  questionId: string;
  questionText: string;
  section: string;
  answer: string | number | boolean | string[];
  questionType?: "text" | "scale" | "multiple_choice" | "multi_select" | "boolean";
}

export interface GroupedSection {
  sectionKey: string;
  sectionTitle: string;
  responses: {
    question: string;
    answer: string | number | boolean | string[];
    type?: string;
  }[];
}

export interface StructuredAssessment {
  sections: GroupedSection[];
  narrativeSummary: string;
  metadata: {
    totalQuestions: number;
    completedSections: string[];
    assessmentDate: string;
  };
  /** Flat key-value map grouped by section — ready to pass directly to
   *  `formatBlueprintUserMessage` as `assessmentResponses`. */
  grouped: Record<string, Record<string, string | number | boolean | string[]>>;
}

// ---------------------------------------------------------------------------
// Section display-name mapping
// ---------------------------------------------------------------------------

const SECTION_TITLES: Record<string, string> = {
  identity: "Identity & Self-Perception",
  purpose: "Purpose & Calling",
  faith: "Faith & Spirituality",
  family: "Family & Relationships",
  health: "Health & Fitness",
  finances: "Finances & Stewardship",
  career: "Career & Work",
  legacy: "Legacy & Impact",
  habits: "Habits & Daily Rhythms",
  mental_health: "Mental & Emotional Health",
  community: "Community & Brotherhood",
  marriage: "Marriage & Partnership",
  parenting: "Parenting & Fatherhood",
  leadership: "Leadership & Influence",
};

function getSectionTitle(key: string): string {
  return SECTION_TITLES[key] || formatKey(key);
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Core processing function
// ---------------------------------------------------------------------------

/**
 * Takes an array of raw assessment responses (flat list from the database)
 * and returns a structured assessment ready for Blueprint generation.
 */
export function processAssessmentResponses(
  responses: RawAssessmentResponse[],
  assessmentDate?: string
): StructuredAssessment {
  // 1. Group by section
  const sectionMap = new Map<string, GroupedSection>();

  for (const response of responses) {
    const key = response.section;

    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        sectionKey: key,
        sectionTitle: getSectionTitle(key),
        responses: [],
      });
    }

    sectionMap.get(key)!.responses.push({
      question: response.questionText,
      answer: response.answer,
      type: response.questionType,
    });
  }

  const sections = Array.from(sectionMap.values());

  // 2. Build flat grouped map for the Blueprint prompt
  const grouped: Record<string, Record<string, string | number | boolean | string[]>> = {};

  for (const section of sections) {
    const sectionData: Record<string, string | number | boolean | string[]> = {};
    for (const r of section.responses) {
      sectionData[r.question] = r.answer;
    }
    grouped[section.sectionKey] = sectionData;
  }

  // 3. Create a narrative summary
  const narrativeSummary = buildNarrativeSummary(sections);

  // 4. Metadata
  const completedSections = sections.map((s) => s.sectionTitle);

  return {
    sections,
    narrativeSummary,
    metadata: {
      totalQuestions: responses.length,
      completedSections,
      assessmentDate: assessmentDate || new Date().toISOString(),
    },
    grouped,
  };
}

// ---------------------------------------------------------------------------
// Narrative summary builder
// ---------------------------------------------------------------------------

/**
 * Creates a human-readable narrative of the assessment responses that gives
 * Claude additional context beyond the raw Q&A pairs.
 */
function buildNarrativeSummary(sections: GroupedSection[]): string {
  const paragraphs: string[] = [];

  for (const section of sections) {
    const lines: string[] = [];
    lines.push(`In the area of ${section.sectionTitle}:`);

    for (const r of section.responses) {
      const answerStr = formatAnswer(r.answer);
      lines.push(`- When asked "${r.question}", he responded: ${answerStr}`);
    }

    paragraphs.push(lines.join("\n"));
  }

  return paragraphs.join("\n\n");
}

/**
 * Formats an answer value into a readable string for the narrative.
 */
function formatAnswer(answer: string | number | boolean | string[]): string {
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  if (typeof answer === "boolean") {
    return answer ? "Yes" : "No";
  }
  if (typeof answer === "number") {
    return `${answer} (on a scale)`;
  }
  return `"${answer}"`;
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a specific section from processed assessment data.
 */
export function getSection(
  assessment: StructuredAssessment,
  sectionKey: string
): GroupedSection | undefined {
  return assessment.sections.find((s) => s.sectionKey === sectionKey);
}

/**
 * Checks whether all required sections are present in the assessment.
 * Returns a list of missing section keys.
 */
export function validateAssessmentCompleteness(
  assessment: StructuredAssessment,
  requiredSections: string[] = [
    "identity",
    "purpose",
    "faith",
    "family",
    "health",
    "finances",
  ]
): { complete: boolean; missingSections: string[] } {
  const presentKeys = new Set(assessment.sections.map((s) => s.sectionKey));
  const missingSections = requiredSections.filter((s) => !presentKeys.has(s));

  return {
    complete: missingSections.length === 0,
    missingSections,
  };
}

/**
 * Creates a concise summary object suitable for logging or analytics —
 * strips out full answers and keeps only counts and section names.
 */
export function getAssessmentSummary(assessment: StructuredAssessment): {
  totalQuestions: number;
  sections: { name: string; questionCount: number }[];
  date: string;
} {
  return {
    totalQuestions: assessment.metadata.totalQuestions,
    sections: assessment.sections.map((s) => ({
      name: s.sectionTitle,
      questionCount: s.responses.length,
    })),
    date: assessment.metadata.assessmentDate,
  };
}
