// =============================================================================
// Assessment Questions -- 39 Questions Across 7 Sections
// =============================================================================

export type QuestionType = "text" | "number" | "scale" | "select";

export interface AssessmentQuestion {
  id: number;
  section: string;
  questionKey: string;
  questionText: string;
  type: QuestionType;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Section Labels
// ---------------------------------------------------------------------------

export const SECTION_LABELS = [
  "Identity",
  "Purpose",
  "Family & Relationships",
  "Faith",
  "Health & Discipline",
  "Finances & Provision",
  "The Lock In",
] as const;

export type SectionLabel = (typeof SECTION_LABELS)[number];

// ---------------------------------------------------------------------------
// All 39 Assessment Questions
// ---------------------------------------------------------------------------

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // =========================================================================
  // SECTION 1: IDENTITY (7 questions)
  // =========================================================================
  {
    id: 1,
    section: "Identity",
    questionKey: "identity_name",
    questionText: "What's your name and what do people call you?",
    type: "text",
    placeholder: "e.g. Marcus — most people call me Marc",
  },
  {
    id: 2,
    section: "Identity",
    questionKey: "identity_age",
    questionText: "How old are you?",
    type: "number",
    placeholder: "Enter your age",
  },
  {
    id: 3,
    section: "Identity",
    questionKey: "identity_self_description",
    questionText:
      "In one sentence, how would you describe yourself to a stranger?",
    type: "text",
    placeholder: "Who are you in one sentence...",
  },
  {
    id: 4,
    section: "Identity",
    questionKey: "identity_others_description",
    questionText:
      "In one sentence, how would the people closest to you describe you?",
    type: "text",
    placeholder: "How do others see you...",
  },
  {
    id: 5,
    section: "Identity",
    questionKey: "identity_hidden_pride",
    questionText:
      "What's one thing about yourself that you're proud of that most people don't know?",
    type: "text",
    placeholder: "Something you're proud of that stays hidden...",
  },
  {
    id: 6,
    section: "Identity",
    questionKey: "identity_needs_change",
    questionText:
      "What's one thing about yourself that you know needs to change?",
    type: "text",
    placeholder: "Be honest with yourself...",
  },
  {
    id: 7,
    section: "Identity",
    questionKey: "identity_self_awareness",
    questionText:
      "On a scale of 1-10, how well do you know who you really are — not your job title, not your roles — but YOU?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 2: PURPOSE (6 questions)
  // =========================================================================
  {
    id: 8,
    section: "Purpose",
    questionKey: "purpose_flow_state",
    questionText: "What work or activity makes you lose track of time?",
    type: "text",
    placeholder: "When do you get completely lost in the work...",
  },
  {
    id: 9,
    section: "Purpose",
    questionKey: "purpose_no_limits",
    questionText:
      "If money were irrelevant and failure impossible, what would you spend your life doing?",
    type: "text",
    placeholder: "Dream without limits...",
  },
  {
    id: 10,
    section: "Purpose",
    questionKey: "purpose_anger",
    questionText:
      "What problem in the world makes you angry enough to want to fix it?",
    type: "text",
    placeholder: "What injustice or problem fires you up...",
  },
  {
    id: 11,
    section: "Purpose",
    questionKey: "purpose_who_to_help",
    questionText:
      "Who do you want to help most in this world? Be specific.",
    type: "text",
    placeholder: "Be specific about who you want to serve...",
  },
  {
    id: 12,
    section: "Purpose",
    questionKey: "purpose_gods_pull",
    questionText:
      "Have you ever felt God pulling you toward something specific? What was it?",
    type: "text",
    placeholder: "Describe that pull or calling...",
  },
  {
    id: 13,
    section: "Purpose",
    questionKey: "purpose_clarity",
    questionText:
      "On a scale of 1-10, how clear are you on your life's purpose right now?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 3: FAMILY & RELATIONSHIPS (7 questions)
  // =========================================================================
  {
    id: 14,
    section: "Family & Relationships",
    questionKey: "family_relationship_status",
    questionText: "What's your relationship status?",
    type: "select",
    options: [
      { label: "Single", value: "single" },
      { label: "Dating", value: "dating" },
      { label: "Engaged", value: "engaged" },
      { label: "Married", value: "married" },
      { label: "Divorced", value: "divorced" },
      { label: "Widowed", value: "widowed" },
    ],
  },
  {
    id: 15,
    section: "Family & Relationships",
    questionKey: "family_children",
    questionText: "Do you have children? Tell me about them.",
    type: "text",
    placeholder:
      "Names, ages, or just tell me about being a father (or not yet)...",
  },
  {
    id: 16,
    section: "Family & Relationships",
    questionKey: "family_father_relationship",
    questionText:
      "Describe your relationship with your father in one sentence.",
    type: "text",
    placeholder: "One honest sentence...",
  },
  {
    id: 17,
    section: "Family & Relationships",
    questionKey: "family_legacy_meaning",
    questionText: "What does the word 'legacy' mean to you personally?",
    type: "text",
    placeholder: "What does legacy mean to you...",
  },
  {
    id: 18,
    section: "Family & Relationships",
    questionKey: "family_children_say",
    questionText:
      "What do you want your children (or future children) to say about you when they're 30?",
    type: "text",
    placeholder: "What will they say about the man you were...",
  },
  {
    id: 19,
    section: "Family & Relationships",
    questionKey: "family_needs_attention",
    questionText:
      "What's the biggest relationship in your life that needs attention right now?",
    type: "text",
    placeholder: "Which relationship needs the most work...",
  },
  {
    id: 20,
    section: "Family & Relationships",
    questionKey: "family_intentionality",
    questionText:
      "On a scale of 1-10, how intentional are you about building your family right now?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 4: FAITH (5 questions)
  // =========================================================================
  {
    id: 21,
    section: "Faith",
    questionKey: "faith_relationship_with_god",
    questionText:
      "Describe your relationship with God in one honest sentence.",
    type: "text",
    placeholder: "Just be real...",
  },
  {
    id: 22,
    section: "Faith",
    questionKey: "faith_spiritual_practice",
    questionText:
      "What spiritual practice (prayer, scripture, worship, etc.) has the most impact on your life?",
    type: "text",
    placeholder: "What practice moves you most...",
  },
  {
    id: 23,
    section: "Faith",
    questionKey: "faith_close_to_god",
    questionText:
      "When was the last time you felt genuinely close to God? What were you doing?",
    type: "text",
    placeholder: "Describe that moment...",
  },
  {
    id: 24,
    section: "Faith",
    questionKey: "faith_biggest_obstacle",
    questionText:
      "What's the biggest obstacle between you and a deeper faith right now?",
    type: "text",
    placeholder: "What's holding you back spiritually...",
  },
  {
    id: 25,
    section: "Faith",
    questionKey: "faith_foundation_strength",
    questionText:
      "On a scale of 1-10, how strong is your spiritual foundation today?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 5: HEALTH & DISCIPLINE (5 questions)
  // =========================================================================
  {
    id: 26,
    section: "Health & Discipline",
    questionKey: "health_physical_rating",
    questionText:
      "How would you rate your physical health right now? Be honest.",
    type: "scale",
  },
  {
    id: 27,
    section: "Health & Discipline",
    questionKey: "health_daily_routine",
    questionText:
      "What does your current daily routine look like? Walk me through a typical day.",
    type: "text",
    placeholder: "Morning to night — walk me through it...",
  },
  {
    id: 28,
    section: "Health & Discipline",
    questionKey: "health_keystone_habit",
    questionText:
      "What habit would change everything for you if you could lock it in?",
    type: "text",
    placeholder: "The one habit that would change the game...",
  },
  {
    id: 29,
    section: "Health & Discipline",
    questionKey: "health_vice",
    questionText:
      "What vice or bad habit has the most control over you right now?",
    type: "text",
    placeholder: "Be honest — no judgment here...",
  },
  {
    id: 30,
    section: "Health & Discipline",
    questionKey: "health_discipline_rating",
    questionText:
      "On a scale of 1-10, how disciplined are you with your body and health?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 6: FINANCES & PROVISION (5 questions)
  // =========================================================================
  {
    id: 31,
    section: "Finances & Provision",
    questionKey: "finances_trajectory",
    questionText:
      "Without sharing exact numbers — are you currently building wealth, breaking even, or falling behind?",
    type: "select",
    options: [
      { label: "Building wealth", value: "building" },
      { label: "Breaking even", value: "breaking_even" },
      { label: "Falling behind", value: "falling_behind" },
    ],
  },
  {
    id: 32,
    section: "Finances & Provision",
    questionKey: "finances_biggest_stress",
    questionText: "What's your biggest financial stress right now?",
    type: "text",
    placeholder: "What keeps you up at night financially...",
  },
  {
    id: 33,
    section: "Finances & Provision",
    questionKey: "finances_plan",
    questionText:
      "Do you have a financial plan or are you figuring it out as you go?",
    type: "select",
    options: [
      { label: "Clear plan in place", value: "clear_plan" },
      { label: "Some structure", value: "some_structure" },
      { label: "Winging it", value: "winging_it" },
    ],
  },
  {
    id: 34,
    section: "Finances & Provision",
    questionKey: "finances_freedom_vision",
    questionText:
      "What does financial freedom look like for your family specifically?",
    type: "text",
    placeholder: "Paint the picture of financial freedom...",
  },
  {
    id: 35,
    section: "Finances & Provision",
    questionKey: "finances_control_rating",
    questionText:
      "On a scale of 1-10, how in control of your finances do you feel?",
    type: "scale",
  },

  // =========================================================================
  // SECTION 7: THE LOCK IN (4 questions)
  // =========================================================================
  {
    id: 36,
    section: "The Lock In",
    questionKey: "lockin_why_here",
    questionText:
      "Why are you here? What made you start this assessment today?",
    type: "text",
    placeholder: "What brought you here right now...",
  },
  {
    id: 37,
    section: "The Lock In",
    questionKey: "lockin_one_thing",
    questionText:
      "What's the ONE thing that, if it changed in the next 90 days, would change everything?",
    type: "text",
    placeholder: "The one domino that knocks everything else down...",
  },
  {
    id: 38,
    section: "The Lock In",
    questionKey: "lockin_ready",
    questionText:
      "Are you ready to lock in — not just today, but to show up every single day for the next 90 days and do the work?",
    type: "select",
    options: [
      { label: "Yes, I'm ready", value: "yes_im_ready" },
      { label: "I'm nervous, but yes", value: "im_nervous_but_yes" },
      { label: "I need to think about it", value: "i_need_to_think_about_it" },
    ],
  },
  {
    id: 39,
    section: "The Lock In",
    questionKey: "lockin_final_words",
    questionText:
      "Anything else you want God — and your future self — to know right now?",
    type: "text",
    placeholder: "Say what you need to say...",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total number of assessment questions */
export const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length; // 39

/** Get all unique sections in order */
export function getSections(): string[] {
  const seen = new Set<string>();
  const sections: string[] = [];
  for (const q of ASSESSMENT_QUESTIONS) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push(q.section);
    }
  }
  return sections;
}

/** Get questions for a specific section */
export function getQuestionsForSection(section: string): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.filter((q) => q.section === section);
}

/** Get the section a question belongs to by index */
export function getSectionForIndex(index: number): string {
  return ASSESSMENT_QUESTIONS[index]?.section ?? "";
}

/** Get the question count for the current section up to and including the given index */
export function getSectionProgress(index: number): {
  current: number;
  total: number;
  section: string;
} {
  const currentSection = ASSESSMENT_QUESTIONS[index]?.section ?? "";
  const sectionQuestions = ASSESSMENT_QUESTIONS.filter(
    (q) => q.section === currentSection
  );
  const firstInSection = ASSESSMENT_QUESTIONS.findIndex(
    (q) => q.section === currentSection
  );
  return {
    current: index - firstInSection + 1,
    total: sectionQuestions.length,
    section: currentSection,
  };
}
