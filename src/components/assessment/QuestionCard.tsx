"use client";

import { motion } from "framer-motion";
import type { AssessmentQuestion } from "@/lib/utils/assessment-questions";
import ScaleInput from "./ScaleInput";
import MultiSelect from "./MultiSelect";
import FreeTextQuestion from "./FreeTextQuestion";

interface QuestionCardProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center"
    >
      {/* Section label */}
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="text-xs font-sans uppercase tracking-[0.2em] text-[#C9A84C] mb-6"
      >
        {question.section}
      </motion.span>

      {/* Question text */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="font-display text-[#E8E0D0] text-xl sm:text-2xl md:text-3xl text-center leading-snug mb-10 px-2"
      >
        {question.questionText}
      </motion.h2>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="w-full flex justify-center"
      >
        {question.type === "scale" && (
          <ScaleInput
            value={value ? parseInt(value, 10) : null}
            onChange={(v) => onChange(String(v))}
          />
        )}

        {question.type === "select" && question.options && (
          <MultiSelect
            options={question.options}
            value={value || null}
            onChange={onChange}
          />
        )}

        {(question.type === "text" || question.type === "number") && (
          <FreeTextQuestion
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
            type={question.type}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
