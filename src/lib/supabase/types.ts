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

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> &
  Partial<Pick<Profile, "created_at" | "updated_at">>;
export type ProfileUpdate = Partial<Omit<Profile, "id">>;

export type AssessmentResponseInsert = Omit<AssessmentResponse, "id" | "created_at"> &
  Partial<Pick<AssessmentResponse, "id" | "created_at">>;
export type AssessmentResponseUpdate = Partial<Omit<AssessmentResponse, "id">>;

export type BlueprintInsert = Omit<Blueprint, "id" | "generated_at" | "updated_at"> &
  Partial<Pick<Blueprint, "id" | "generated_at" | "updated_at">>;
export type BlueprintUpdate = Partial<Omit<Blueprint, "id">>;

export type DailyCheckinInsert = Omit<DailyCheckin, "id" | "created_at"> &
  Partial<Pick<DailyCheckin, "id" | "created_at">>;
export type DailyCheckinUpdate = Partial<Omit<DailyCheckin, "id">>;

export type StreakInsert = Omit<Streak, "id" | "updated_at"> &
  Partial<Pick<Streak, "id" | "updated_at">>;
export type StreakUpdate = Partial<Omit<Streak, "id">>;

export type WeeklyPulseInsert = Omit<WeeklyPulse, "id" | "generated_at"> &
  Partial<Pick<WeeklyPulse, "id" | "generated_at">>;
export type WeeklyPulseUpdate = Partial<Omit<WeeklyPulse, "id">>;

export type ShareCardInsert = Omit<ShareCard, "id" | "created_at" | "views"> &
  Partial<Pick<ShareCard, "id" | "created_at" | "views">>;
export type ShareCardUpdate = Partial<Omit<ShareCard, "id">>;

export type ReferralInsert = Omit<Referral, "id" | "created_at"> &
  Partial<Pick<Referral, "id" | "created_at">>;
export type ReferralUpdate = Partial<Omit<Referral, "id">>;

export type SmsLogInsert = Omit<SmsLog, "id" | "created_at"> &
  Partial<Pick<SmsLog, "id" | "created_at">>;
export type SmsLogUpdate = Partial<Omit<SmsLog, "id">>;

// ---------------------------------------------------------------------------
// Database type (mirrors Supabase generated schema shape)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      assessment_responses: {
        Row: AssessmentResponse;
        Insert: AssessmentResponseInsert;
        Update: AssessmentResponseUpdate;
      };
      blueprints: {
        Row: Blueprint;
        Insert: BlueprintInsert;
        Update: BlueprintUpdate;
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: DailyCheckinInsert;
        Update: DailyCheckinUpdate;
      };
      streaks: {
        Row: Streak;
        Insert: StreakInsert;
        Update: StreakUpdate;
      };
      weekly_pulses: {
        Row: WeeklyPulse;
        Insert: WeeklyPulseInsert;
        Update: WeeklyPulseUpdate;
      };
      share_cards: {
        Row: ShareCard;
        Insert: ShareCardInsert;
        Update: ShareCardUpdate;
      };
      referrals: {
        Row: Referral;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
      };
      sms_logs: {
        Row: SmsLog;
        Insert: SmsLogInsert;
        Update: SmsLogUpdate;
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
