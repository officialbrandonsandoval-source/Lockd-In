"use client";

import { useEffect, useRef } from "react";

interface FreeTextQuestionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
}

export default function FreeTextQuestion({
  value,
  onChange,
  placeholder = "Type your answer...",
  type = "text",
}: FreeTextQuestionProps) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus with a small delay so the transition finishes first
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (type === "number") {
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full max-w-xs bg-[#141414] text-[#F5F0E8] font-sans
          border border-[#2A2A2A] rounded-xl
          px-6 py-4 text-2xl text-center
          placeholder:text-[#8A8578]/50
          focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
          transition-colors duration-200
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />
    );
  }

  return (
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="
        w-full bg-[#141414] text-[#F5F0E8] font-sans
        border border-[#2A2A2A] rounded-xl
        px-5 py-4 text-base leading-relaxed
        placeholder:text-[#8A8578]/50
        focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
        transition-colors duration-200
        resize-none
        min-h-[140px]
      "
    />
  );
}
