"use client";

import { motion } from "framer-motion";

interface ScaleInputProps {
  value: number | null;
  onChange: (value: number) => void;
}

export default function ScaleInput({ value, onChange }: ScaleInputProps) {
  const points = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full">
      {/* Scale points */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {points.map((point) => {
          const isSelected = value === point;
          return (
            <motion.button
              key={point}
              type="button"
              onClick={() => onChange(point)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={
                isSelected
                  ? { scale: [1, 1.15, 1.05], backgroundColor: "#C9A84C" }
                  : { scale: 1, backgroundColor: "transparent" }
              }
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className={`
                relative w-10 h-10 sm:w-12 sm:h-12 rounded-full
                flex items-center justify-center
                text-sm sm:text-base font-sans font-medium
                transition-colors duration-200 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]
                ${
                  isSelected
                    ? "text-[#0A0A0A] shadow-gold"
                    : "text-[#8A8578] border border-[#2A2A2A] hover:border-[#C9A84C]/40 hover:text-[#F5F0E8]"
                }
              `}
            >
              {point}
              {isSelected && (
                <motion.div
                  layoutId="scale-ring"
                  className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/50"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ margin: "-3px" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-xs text-[#8A8578] font-sans">Not at all</span>
        <span className="text-xs text-[#8A8578] font-sans">Completely</span>
      </div>
    </div>
  );
}
