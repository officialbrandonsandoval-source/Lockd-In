"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ASSESSMENT_QUESTIONS,
  TOTAL_QUESTIONS,
  getSectionProgress,
  getSections,
} from "@/lib/utils/assessment-questions";
import QuestionCard from "./QuestionCard";
import Button from "@/components/ui/Button";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function AssessmentStepper() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];
  const currentValue = responses[currentQuestion.questionKey] ?? "";
  const { current: sectionCurrent, total: sectionTotal, section } =
    getSectionProgress(currentIndex);
  const sections = getSections();
  const currentSectionIndex = sections.indexOf(section);
  const overallProgress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const isFirstQuestion = currentIndex === 0;

  // Check if the current answer is valid
  const isCurrentValid = useCallback(() => {
    const val = responses[currentQuestion.questionKey];
    if (!val || val.trim() === "") return false;
    if (currentQuestion.type === "number") {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0;
    }
    return true;
  }, [responses, currentQuestion]);

  // Set response value
  const handleChange = useCallback(
    (value: string) => {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.questionKey]: value,
      }));
      setError(null);
    },
    [currentQuestion.questionKey]
  );

  // Navigate forward
  const handleNext = useCallback(async () => {
    if (!isCurrentValid()) {
      setError("Please answer this question before continuing.");
      return;
    }
    setError(null);

    if (isLastQuestion) {
      // Submit all responses
      setIsSubmitting(true);
      try {
        const payload = ASSESSMENT_QUESTIONS.map((q) => ({
          section: q.section,
          questionKey: q.questionKey,
          questionText: q.questionText,
          response: responses[q.questionKey] ?? "",
        }));

        const res = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: payload }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to submit assessment");
        }

        router.push("/generating");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setIsSubmitting(false);
      }
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isCurrentValid, isLastQuestion, responses, router]);

  // Navigate backward
  const handleBack = useCallback(() => {
    if (isFirstQuestion) return;
    setError(null);
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  }, [isFirstQuestion]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Only advance for non-textarea types, or if it's a scale/select
        const isTextArea =
          currentQuestion.type === "text" && document.activeElement?.tagName === "TEXTAREA";
        if (!isTextArea) {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, currentQuestion.type]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Progress Header */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#2A2A2A]/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {/* Section indicator pills */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto">
            {sections.map((s, i) => (
              <div
                key={s}
                className={`
                  h-1 flex-1 rounded-full min-w-[24px] transition-colors duration-300
                  ${
                    i < currentSectionIndex
                      ? "bg-[#C9A84C]"
                      : i === currentSectionIndex
                        ? "bg-[#C9A84C]/60"
                        : "bg-[#2A2A2A]"
                  }
                `}
              />
            ))}
          </div>

          {/* Section label and count */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-[#8A8578]">
              {section} &middot; {sectionCurrent}/{sectionTotal}
            </span>
            <span className="text-sm font-sans text-[#8A8578] tabular-nums">
              {currentIndex + 1} / {TOTAL_QUESTIONS}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C9A84C] rounded-full"
              initial={false}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.25 },
            }}
            className="w-full max-w-2xl"
          >
            <QuestionCard
              question={currentQuestion}
              value={currentValue}
              onChange={handleChange}
            />
          </motion.div>
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-sm text-[#8B2500] font-sans text-center"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-t border-[#2A2A2A]/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={isFirstQuestion}
            className={isFirstQuestion ? "invisible" : ""}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back
          </Button>

          {/* Enter hint (desktop) */}
          {currentQuestion.type !== "text" && (
            <span className="hidden sm:block text-xs text-[#8A8578]/60 font-sans">
              Press Enter to continue
            </span>
          )}

          {/* Next / Submit button */}
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            loading={isSubmitting}
            disabled={!isCurrentValid()}
          >
            {isLastQuestion ? "Submit" : "Continue"}
            {!isLastQuestion && (
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
