import React from "react";

type BadgeVariant = "gold" | "success" | "danger" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  success: "bg-brand-success/20 text-green-400 border-green-500/30",
  danger: "bg-brand-danger/20 text-red-400 border-red-500/30",
  neutral:
    "bg-brand-border/50 text-brand-text-secondary border-brand-border",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-0.5 rounded-full
        text-xs font-medium font-sans
        border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
