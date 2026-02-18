"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Streak } from "@/lib/supabase/types";
import { useAuth } from "./useAuth";
import {
  isStreakMilestone,
  getStreakMessage,
} from "@/lib/utils/streaks";

export interface UseStreakReturn {
  streak: Streak | null;
  loading: boolean;
  isMilestone: boolean;
  streakMessage: string;
}

export function useStreak(): UseStreakReturn {
  const supabase = createClient();
  const { user } = useAuth();

  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }

    const fetchStreak = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // If no streak record exists yet, that is okay
          if (error.code === "PGRST116") {
            setStreak(null);
          } else {
            console.error("Error fetching streak:", error.message);
          }
        } else {
          setStreak(data as Streak);
        }
      } catch (err) {
        console.error("Failed to fetch streak:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [user, supabase]);

  const currentCount = streak?.current_streak ?? 0;
  const isMilestone = currentCount > 0 && isStreakMilestone(currentCount);
  const streakMessage =
    currentCount > 0
      ? getStreakMessage(currentCount)
      : "Start your first check-in to begin building your streak!";

  return {
    streak,
    loading,
    isMilestone,
    streakMessage,
  };
}
