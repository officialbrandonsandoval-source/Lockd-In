"use client";

import React from "react";
import { motion } from "framer-motion";

type ProgressBarVariant = "thin" | "thick";

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressBarVariant;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const heightStyles: Record<ProgressBarVariant, string> = {
  thin: "h-1.5",
  thick: "h-3",
};

export default function ProgressBar({
  value,
  variant = "thin",
  showPercentage = false,
  label,
  className = "",
  animated = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm text-brand-text font-sans">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-brand-text-secondary font-sans tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full bg-brand-border rounded-full overflow-hidden
          ${heightStyles[variant]}
        `}
      >
        <motion.div
          className={`${heightStyles[variant]} rounded-full bg-brand-gold`}
          initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={
            animated
              ? { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
}
