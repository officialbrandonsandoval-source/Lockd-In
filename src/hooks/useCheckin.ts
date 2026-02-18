"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  DailyCheckin,
  DailyCheckinInsert,
  DailyCheckinUpdate,
  PriorityItem,
} from "@/lib/supabase/types";
import { useAuth } from "./useAuth";
import { getTodayISO } from "@/lib/utils/dates";

export interface MorningCheckinData {
  priorities: PriorityItem[];
  scripture: string;
  intention: string;
}

export interface EveningCheckinData {
  wins: string[];
  struggles: string[];
  gratitude: string[];
  tomorrowFocus: string;
  dayRating: number;
  prioritiesCompleted: number;
}

export interface UseCheckinReturn {
  todayCheckin: DailyCheckin | null;
  loading: boolean;
  submitMorning: (
    data: MorningCheckinData
  ) => Promise<{ error: string | null }>;
  submitEvening: (
    data: EveningCheckinData
  ) => Promise<{ error: string | null }>;
  hasMorningCheckin: boolean;
  hasEveningCheckin: boolean;
}

export function useCheckin(): UseCheckinReturn {
  const supabase = createClient();
  const { user } = useAuth();

  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [loading, setLoading] = useState(true);

  const todayISO = getTodayISO();

  useEffect(() => {
    if (!user) {
      setTodayCheckin(null);
      setLoading(false);
      return;
    }

    const fetchTodayCheckin = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", user.id)
          .eq("checkin_date", todayISO)
          .maybeSingle();

        if (error) {
          console.error("Error fetching today's check-in:", error.message);
          setTodayCheckin(null);
        } else {
          setTodayCheckin(data as DailyCheckin | null);
        }
      } catch (err) {
        console.error("Failed to fetch check-in:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayCheckin();
  }, [user, supabase, todayISO]);

  const submitMorning = useCallback(
    async (
      data: MorningCheckinData
    ): Promise<{ error: string | null }> => {
      if (!user) {
        return { error: "Not authenticated" };
      }

      try {
        const now = new Date().toISOString();

        if (todayCheckin) {
          // Update existing check-in with morning data
          const updates: DailyCheckinUpdate = {
            morning_priorities: data.priorities,
            morning_scripture: data.scripture,
            morning_intention: data.intention,
            morning_completed_at: now,
          };

          const { data: updated, error: updateError } = await supabase
            .from("daily_checkins")
            .update(updates)
            .eq("id", todayCheckin.id)
            .select()
            .single();

          if (updateError) return { error: updateError.message };
          setTodayCheckin(updated as DailyCheckin);
        } else {
          // Create new check-in
          const newCheckin: DailyCheckinInsert = {
            user_id: user.id,
            checkin_date: todayISO,
            morning_priorities: data.priorities,
            morning_scripture: data.scripture,
            morning_intention: data.intention,
            morning_completed_at: now,
          };

          const { data: created, error: createError } = await supabase
            .from("daily_checkins")
            .insert(newCheckin)
            .select()
            .single();

          if (createError) return { error: createError.message };
          setTodayCheckin(created as DailyCheckin);
        }

        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to submit morning check-in",
        };
      }
    },
    [user, supabase, todayCheckin, todayISO]
  );

  const submitEvening = useCallback(
    async (
      data: EveningCheckinData
    ): Promise<{ error: string | null }> => {
      if (!user) {
        return { error: "Not authenticated" };
      }

      try {
        const now = new Date().toISOString();

        if (todayCheckin) {
          // Update existing check-in with evening data
          const updates: DailyCheckinUpdate = {
            evening_wins: data.wins,
            evening_struggles: data.struggles,
            evening_gratitude: data.gratitude,
            evening_tomorrow_focus: data.tomorrowFocus,
            day_rating: data.dayRating,
            priorities_completed: data.prioritiesCompleted,
            evening_completed_at: now,
          };

          const { data: updated, error: updateError } = await supabase
            .from("daily_checkins")
            .update(updates)
            .eq("id", todayCheckin.id)
            .select()
            .single();

          if (updateError) return { error: updateError.message };
          setTodayCheckin(updated as DailyCheckin);
        } else {
          // Create new check-in with evening data only (missed morning)
          const newCheckin: DailyCheckinInsert = {
            user_id: user.id,
            checkin_date: todayISO,
            evening_wins: data.wins,
            evening_struggles: data.struggles,
            evening_gratitude: data.gratitude,
            evening_tomorrow_focus: data.tomorrowFocus,
            day_rating: data.dayRating,
            priorities_completed: data.prioritiesCompleted,
            evening_completed_at: now,
          };

          const { data: created, error: createError } = await supabase
            .from("daily_checkins")
            .insert(newCheckin)
            .select()
            .single();

          if (createError) return { error: createError.message };
          setTodayCheckin(created as DailyCheckin);
        }

        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to submit evening reflection",
        };
      }
    },
    [user, supabase, todayCheckin, todayISO]
  );

  const hasMorningCheckin = todayCheckin?.morning_completed_at !== null && todayCheckin?.morning_completed_at !== undefined;
  const hasEveningCheckin = todayCheckin?.evening_completed_at !== null && todayCheckin?.evening_completed_at !== undefined;

  return {
    todayCheckin,
    loading,
    submitMorning,
    submitEvening,
    hasMorningCheckin,
    hasEveningCheckin,
  };
}
