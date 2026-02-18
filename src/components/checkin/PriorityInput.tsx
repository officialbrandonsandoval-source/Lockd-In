'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PriorityInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  alignmentTag?: string;
}

export default function PriorityInput({
  index,
  value,
  onChange,
  placeholder = 'Enter your priority...',
  alignmentTag,
}: PriorityInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex items-start gap-3"
    >
      {/* Number Badge */}
      <div
        className="flex-shrink-0 mt-2.5 flex items-center justify-center w-8 h-8 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10"
      >
        <span className="text-sm font-semibold font-sans text-[#C9A84C]">
          {index + 1}
        </span>
      </div>

      {/* Input Area */}
      <div className="flex-1 flex flex-col gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full bg-[#141414] text-[#F5F0E8] font-sans
            border border-[#2A2A2A] rounded-xl
            px-4 py-3 text-sm
            placeholder:text-[#8A8578]/50
            focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
            transition-colors duration-200
          "
          maxLength={200}
        />

        {/* Optional Blueprint Alignment Tag */}
        {alignmentTag && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5 ml-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60" />
            <span className="text-xs text-[#8A8578] font-sans">
              Aligns with: {alignmentTag}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
