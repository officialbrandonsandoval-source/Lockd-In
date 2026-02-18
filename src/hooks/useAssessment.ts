"use client";

import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentResponseInsert } from "@/lib/supabase/types";
import { useAuth } from "./useAuth";
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_SECTIONS,
  TOTAL_ASSESSMENT_QUESTIONS,
  type AssessmentSection,
} from "@/lib/utils/constants";

export interface UseAssessmentReturn {
  /** Index of the current question (0-based) */
  currentStep: number;
  /** Current section name */
  currentSection: AssessmentSection;
  /** Map of question key -> response text */
  responses: Record<string, string>;
  /** Set a response for a given question key */
  setResponse: (questionKey: string, value: string) => void;
  /** Move to the next question */
  nextStep: () => void;
  /** Move to the previous question */
  prevStep: () => void;
  /** Jump to a specific step index */
  goToStep: (step: number) => void;
  /** Total number of questions */
  totalSteps: number;
  /** Progress as a number between 0 and 1 */
  progress: number;
  /** Number of answered questions */
  answeredCount: number;
  /** Whether the current question has been answered */
  isCurrentAnswered: boolean;
  /** Submit all assessment responses to Supabase */
  submitAssessment: () => Promise<{ error: string | null }>;
  /** Whether a submission is in progress */
  submitting: boolean;
}

export function useAssessment(): UseAssessmentReturn {
  const supabase = createClient();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = TOTAL_ASSESSMENT_QUESTIONS;

  const currentQuestion = ASSESSMENT_QUESTIONS[currentStep];
  const currentSection = currentQuestion.section;

  const answeredCount = useMemo(
    () =>
      Object.values(responses).filter(
        (v) => v !== undefined && v.trim() !== ""
      ).length,
    [responses]
  );

  const progress = totalSteps > 0 ? answeredCount / totalSteps : 0;

  const isCurrentAnswered =
    currentQuestion &&
    responses[currentQuestion.key] !== undefined &&
    responses[currentQuestion.key].trim() !== "";

  const setResponse = useCallback(
    (questionKey: string, value: string) => {
      setResponses((prev) => ({
        ...prev,
        [questionKey]: value,
      }));
    },
    []
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const submitAssessment = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    if (!user) {
      return { error: "Not authenticated" };
    }

    setSubmitting(true);

    try {
      // Build the rows to insert
      const rows: AssessmentResponseInsert[] = ASSESSMENT_QUESTIONS.filter(
        (q) => responses[q.key] && responses[q.key].trim() !== ""
      ).map((q) => ({
        user_id: user.id,
        section: q.section,
        question_key: q.key,
        question_text: q.text,
        response_text: responses[q.key],
        response_metadata: q.type === "scale" ? { numericValue: Number(responses[q.key]) } : null,
      }));

      if (rows.length === 0) {
        return { error: "No responses to submit" };
      }

      // Delete existing responses for this user (fresh assessment)
      const { error: deleteError } = await supabase
        .from("assessment_responses")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      // Insert all responses
      const { error: insertError } = await supabase
        .from("assessment_responses")
        .insert(rows);

      if (insertError) {
        return { error: insertError.message };
      }

      return { error: null };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Failed to submit assessment",
      };
    } finally {
      setSubmitting(false);
    }
  }, [user, supabase, responses]);

  return {
    currentStep,
    currentSection,
    responses,
    setResponse,
    nextStep,
    prevStep,
    goToStep,
    totalSteps,
    progress,
    answeredCount,
    isCurrentAnswered,
    submitAssessment,
    submitting,
  };
}
