"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Blueprint } from "@/lib/supabase/types";
import { useAuth } from "./useAuth";
import { BLUEPRINT_STATUS } from "@/lib/utils/constants";

export interface UseBlueprintReturn {
  blueprint: Blueprint | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBlueprint(): UseBlueprintReturn {
  const supabase = createClient();
  const { user } = useAuth();

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlueprint = useCallback(async () => {
    if (!user) {
      setBlueprint(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("blueprints")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", BLUEPRINT_STATUS.ACTIVE)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        setBlueprint(null);
      } else {
        setBlueprint(data as Blueprint | null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch blueprint"
      );
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchBlueprint();
  }, [fetchBlueprint]);

  const refetch = useCallback(async () => {
    await fetchBlueprint();
  }, [fetchBlueprint]);

  return {
    blueprint,
    loading,
    error,
    refetch,
  };
}
