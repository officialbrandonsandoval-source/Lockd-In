"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate } from "@/lib/supabase/types";
import { useAuth } from "./useAuth";

export interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>;
}

export function useProfile(): UseProfileReturn {
  const supabase = createClient();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<{ error: string | null }> => {
      if (!user) {
        return { error: "Not authenticated" };
      }

      try {
        const { data, error: updateError } = await supabase
          .from("profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", user.id)
          .select()
          .single();

        if (updateError) {
          return { error: updateError.message };
        }

        setProfile(data as Profile);
        return { error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        return { error: message };
      }
    },
    [user, supabase]
  );

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
