"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  accentBorder?: boolean;
  hoverable?: boolean;
  className?: string;
}

export default function Card({
  children,
  header,
  footer,
  accentBorder = false,
  hoverable = true,
  className = "",
  ...motionProps
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hoverable
          ? {
              borderColor: "rgba(201, 168, 76, 0.3)",
              boxShadow: "0 0 16px rgba(201, 168, 76, 0.08)",
            }
          : undefined
      }
      transition={{ duration: 0.2 }}
      className={`
        bg-brand-card border border-brand-border rounded-2xl
        transition-colors duration-200
        ${accentBorder ? "border-l-2 border-l-brand-gold" : ""}
        ${className}
      `}
      {...motionProps}
    >
      {header && (
        <div className="px-5 py-4 border-b border-brand-border">{header}</div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-brand-border">{footer}</div>
      )}
    </motion.div>
  );
}
