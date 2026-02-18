"use client";

import { motion } from "framer-motion";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
}

export default function MultiSelect({
  options,
  value,
  onChange,
}: MultiSelectProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`
              relative w-full text-left px-6 py-4 rounded-xl
              font-sans text-base
              transition-all duration-200 cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]
              ${
                isSelected
                  ? "bg-[#C9A84C]/10 border-2 border-[#C9A84C] text-[#F5F0E8]"
                  : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#8A8578] hover:border-[#C9A84C]/30 hover:text-[#F5F0E8]"
              }
            `}
          >
            <div className="flex items-center gap-4">
              {/* Radio indicator */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex-shrink-0
                  flex items-center justify-center transition-colors duration-200
                  ${
                    isSelected
                      ? "border-[#C9A84C] bg-[#C9A84C]"
                      : "border-[#2A2A2A]"
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                    }}
                    className="w-2 h-2 rounded-full bg-[#0A0A0A]"
                  />
                )}
              </div>

              <span className="leading-snug">{option.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
