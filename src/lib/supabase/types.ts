// =============================================================================
// Database Types for Lockd In
// =============================================================================

// ---------------------------------------------------------------------------
// JSONB sub-types
// ---------------------------------------------------------------------------

export interface ChildDetail {
  name: string;
  age: number;
  gender?: string;
  notes?: string;
}

export interface NinetyDayTarget {
  area: string;
  target: string;
  measure: string;
  deadline?: string;
}

export interface DailyNonNegotiable {
  activity: string;
  time_of_day?: string;
  duration_minutes?: number;
}

export interface CoreValue {
  value: string;
  description: string;
  rank?: number;
}

export interface PriorityItem {
  text: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Table Row types
// ---------------------------------------------------------------------------

export interface Profile {
  id: string; // uuid, FK to auth.users
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null; // ISO date string
  city: string | null;
  state: string | null;
  faith_tradition: string | null;
  marital_status: string | null;
  has_children: boolean | null;
  number_of_children: number | null;
  children_details: ChildDetail[] | null; // jsonb
  occupation: string | null;
  entrepreneur: boolean | null;
  onboarding_completed: boolean;
  sms_opt_in: boolean;
  sms_morning_time: string | null; // HH:MM format
  sms_evening_time: string | null; // HH:MM format
  timezone: string | null;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface AssessmentResponse {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  section: string;
  question_key: string;
  question_text: string;
  response_text: string;
  response_metadata: Record<string, unknown> | null; // jsonb
  created_at: string; // ISO timestamp
}

export interface Blueprint {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  version: number;
  status: string; // e.g. "draft" | "active" | "archived"
  identity_statement: string | null;
  purpose_statement: string | null;
  family_vision: string | null;
  core_values: CoreValue[] | null; // jsonb
  ninety_day_targets: NinetyDayTarget[] | null; // jsonb
  daily_non_negotiables: DailyNonNegotiable[] | null; // jsonb
  faith_commitments: string | null;
  health_targets: string | null;
  financial_targets: string | null;
  relationship_commitments: string | null;
  full_blueprint_markdown: string | null;
  ai_analysis: Record<string, unknown> | null; // jsonb
  generated_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DailyCheckin {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  checkin_date: string; // ISO date string
  morning_priorities: PriorityItem[] | null; // jsonb
  morning_scripture: string | null;
  morning_intention: string | null;
  morning_completed_at: string | null; // ISO timestamp
  evening_wins: string[] | null; // jsonb
  evening_struggles: string[] | null; // jsonb
  evening_gratitude: string[] | null; // jsonb
  evening_tomorrow_focus: string | null;
  priorities_completed: number | null;
  day_rating: number | null; // 1-10
  evening_completed_at: string | null; // ISO timestamp
  ai_morning_message: string | null;
  ai_evening_message: string | null;
  created_at: string; // ISO timestamp
}

export interface Streak {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
  last_checkin_date: string | null; // ISO date string
  streak_started_at: string | null; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface WeeklyPulse {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  week_start: string; // ISO date string
  week_end: string; // ISO date string
  alignment_score: number | null;
  wins_summary: string | null;
  growth_areas: string | null;
  pattern_insights: string | null;
  next_week_focus: string | null;
  scripture_encouragement: string | null;
  full_pulse_markdown: string | null;
  generated_at: string; // ISO timestamp
}

export interface ShareCard {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  card_type: string;
  card_data: Record<string, unknown>; // jsonb
  share_url: string | null;
  share_code: string;
  views: number;
  created_at: string; // ISO timestamp
}

export interface Referral {
  id: string; // uuid
  referrer_id: string; // uuid, FK to auth.users
  referred_id: string | null; // uuid, FK to auth.users
  share_code: string;
  created_at: string; // ISO timestamp
}

export interface SmsLog {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users
  direction: string; // "inbound" | "outbound"
  message_type: string;
  message_body: string;
  twilio_sid: string | null;
  status: string;
  created_at: string; // ISO timestamp
}

// ---------------------------------------------------------------------------
// Insert / Update helpers
// ---------------------------------------------------------------------------

// Profile: id is required, nullable fields optional on insert, timestamps auto
export type ProfileInsert = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  city?: string | null;
  state?: string | null;
  faith_tradition?: string | null;
  marital_status?: string | null;
  has_children?: boolean | null;
  number_of_children?: number | null;
  children_details?: ChildDetail[] | null;
  occupation?: string | null;
  entrepreneur?: boolean | null;
  onboarding_completed?: boolean;
  sms_opt_in?: boolean;
  sms_morning_time?: string | null;
  sms_evening_time?: string | null;
  timezone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type ProfileUpdate = Partial<Omit<ProfileInsert, "id">>;

// AssessmentResponse: id and created_at auto-generated
export type AssessmentResponseInsert = {
  user_id: string;
  section: string;
  question_key: string;
  question_text: string;
  response_text: string;
  response_metadata?: Record<string, unknown> | null;
  id?: string;
  created_at?: string;
};
export type AssessmentResponseUpdate = Partial<Omit<AssessmentResponseInsert, "id">>;

// Blueprint: id, generated_at, updated_at auto-generated
export type BlueprintInsert = {
  user_id: string;
  version: number;
  status: string;
  identity_statement?: string | null;
  purpose_statement?: string | null;
  family_vision?: string | null;
  core_values?: CoreValue[] | null;
  ninety_day_targets?: NinetyDayTarget[] | null;
  daily_non_negotiables?: DailyNonNegotiable[] | null;
  faith_commitments?: string | null;
  health_targets?: string | null;
  financial_targets?: string | null;
  relationship_commitments?: string | null;
  full_blueprint_markdown?: string | null;
  ai_analysis?: Record<string, unknown> | null;
  id?: string;
  generated_at?: string;
  updated_at?: string;
};
export type BlueprintUpdate = Partial<Omit<BlueprintInsert, "id">>;

// DailyCheckin: id and created_at auto-generated; most fields nullable
export type DailyCheckinInsert = {
  user_id: string;
  checkin_date: string;
  morning_priorities?: PriorityItem[] | null;
  morning_scripture?: string | null;
  morning_intention?: string | null;
  morning_completed_at?: string | null;
  evening_wins?: string[] | null;
  evening_struggles?: string[] | null;
  evening_gratitude?: string[] | null;
  evening_tomorrow_focus?: string | null;
  priorities_completed?: number | null;
  day_rating?: number | null;
  evening_completed_at?: string | null;
  ai_morning_message?: string | null;
  ai_evening_message?: string | null;
  id?: string;
  created_at?: string;
};
export type DailyCheckinUpdate = Partial<Omit<DailyCheckinInsert, "id">>;

// Streak: id and updated_at auto-generated
export type StreakInsert = {
  user_id: string;
  current_streak?: number;
  longest_streak?: number;
  total_checkins?: number;
  last_checkin_date?: string | null;
  streak_started_at?: string | null;
  id?: string;
  updated_at?: string;
};
export type StreakUpdate = Partial<Omit<StreakInsert, "id">>;

// WeeklyPulse: id and generated_at auto-generated
export type WeeklyPulseInsert = {
  user_id: string;
  week_start: string;
  week_end: string;
  alignment_score?: number | null;
  wins_summary?: string | null;
  growth_areas?: string | null;
  pattern_insights?: string | null;
  next_week_focus?: string | null;
  scripture_encouragement?: string | null;
  full_pulse_markdown?: string | null;
  id?: string;
  generated_at?: string;
};
export type WeeklyPulseUpdate = Partial<Omit<WeeklyPulseInsert, "id">>;

// ShareCard: id, created_at, views auto-generated
export type ShareCardInsert = {
  user_id: string;
  card_type: string;
  card_data: Record<string, unknown>;
  share_code: string;
  share_url?: string | null;
  views?: number;
  id?: string;
  created_at?: string;
};
export type ShareCardUpdate = Partial<Omit<ShareCardInsert, "id">>;

// Referral: id and created_at auto-generated
export type ReferralInsert = {
  referrer_id: string;
  share_code: string;
  referred_id?: string | null;
  id?: string;
  created_at?: string;
};
export type ReferralUpdate = Partial<Omit<ReferralInsert, "id">>;

// SmsLog: id and created_at auto-generated
export type SmsLogInsert = {
  user_id: string;
  direction: string;
  message_type: string;
  message_body: string;
  status: string;
  twilio_sid?: string | null;
  id?: string;
  created_at?: string;
};
export type SmsLogUpdate = Partial<Omit<SmsLogInsert, "id">>;

// ---------------------------------------------------------------------------
// Database type (mirrors Supabase generated schema shape)
// ---------------------------------------------------------------------------

// Helper to satisfy Supabase GenericTable's Record<string, unknown> constraint
type WithIndex<T> = T & Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: WithIndex<Profile>;
        Insert: WithIndex<ProfileInsert>;
        Update: WithIndex<ProfileUpdate>;
        Relationships: [];
      };
      assessment_responses: {
        Row: WithIndex<AssessmentResponse>;
        Insert: WithIndex<AssessmentResponseInsert>;
        Update: WithIndex<AssessmentResponseUpdate>;
        Relationships: [];
      };
      blueprints: {
        Row: WithIndex<Blueprint>;
        Insert: WithIndex<BlueprintInsert>;
        Update: WithIndex<BlueprintUpdate>;
        Relationships: [];
      };
      daily_checkins: {
        Row: WithIndex<DailyCheckin>;
        Insert: WithIndex<DailyCheckinInsert>;
        Update: WithIndex<DailyCheckinUpdate>;
        Relationships: [];
      };
      streaks: {
        Row: WithIndex<Streak>;
        Insert: WithIndex<StreakInsert>;
        Update: WithIndex<StreakUpdate>;
        Relationships: [];
      };
      weekly_pulses: {
        Row: WithIndex<WeeklyPulse>;
        Insert: WithIndex<WeeklyPulseInsert>;
        Update: WithIndex<WeeklyPulseUpdate>;
        Relationships: [];
      };
      share_cards: {
        Row: WithIndex<ShareCard>;
        Insert: WithIndex<ShareCardInsert>;
        Update: WithIndex<ShareCardUpdate>;
        Relationships: [];
      };
      referrals: {
        Row: WithIndex<Referral>;
        Insert: WithIndex<ReferralInsert>;
        Update: WithIndex<ReferralUpdate>;
        Relationships: [];
      };
      sms_logs: {
        Row: WithIndex<SmsLog>;
        Insert: WithIndex<SmsLogInsert>;
        Update: WithIndex<SmsLogUpdate>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
