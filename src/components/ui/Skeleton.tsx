import React from "react";

type SkeletonVariant = "text" | "circle" | "card" | "custom";

interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Width - applies to all variants. Use Tailwind classes or inline value. */
  width?: string;
  /** Height - applies to text, card, and custom. */
  height?: string;
  /** Diameter - applies to circle variant. */
  size?: string;
  /** Number of text lines to render (only for variant="text"). */
  lines?: number;
  className?: string;
}

function ShimmerBar({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`
        bg-brand-card rounded-lg overflow-hidden relative
        ${className}
      `}
      style={style}
    >
      <div
        className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer"
        aria-hidden="true"
      />
    </div>
  );
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  size = "40px",
  lines = 3,
  className = "",
}: SkeletonProps) {
  if (variant === "circle") {
    return (
      <ShimmerBar
        className={`rounded-full flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-2xl overflow-hidden ${className}`}
        style={{ width: width || "100%", height: height || "160px" }}
      >
        <ShimmerBar className="w-full h-full rounded-2xl" />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div
        className={`flex flex-col gap-2.5 ${className}`}
        style={{ width: width || "100%" }}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerBar
            key={i}
            style={{
              height: height || "14px",
              width: i === lines - 1 && lines > 1 ? "70%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  // Custom variant - fully controlled via className and style
  return (
    <ShimmerBar
      className={className}
      style={{ width: width || "100%", height: height || "40px" }}
    />
  );
}
