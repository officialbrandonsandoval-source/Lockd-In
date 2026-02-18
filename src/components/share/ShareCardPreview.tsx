"use client";

import React from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardType = "blueprint_summary" | "streak" | "weekly_win" | "invite";
type AspectRatio = "9:16" | "1:1";

interface ShareCardPreviewProps {
  cardType: CardType;
  cardData: Record<string, unknown>;
  aspectRatio?: AspectRatio;
}

// ---------------------------------------------------------------------------
// Noise overlay (inline for share card)
// ---------------------------------------------------------------------------

function CardNoise() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
      style={{
        opacity: 0.06,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Branding header
// ---------------------------------------------------------------------------

function CardBranding() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-center"
    >
      <p
        className="text-xs tracking-[0.35em] font-sans font-semibold uppercase"
        style={{ color: "#C9A84C" }}
      >
        LOCKD IN
      </p>
      <div
        className="mx-auto mt-2 h-px w-12"
        style={{ backgroundColor: "rgba(201, 168, 76, 0.3)" }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Card content renderers
// ---------------------------------------------------------------------------

function BlueprintContent({ data }: { data: Record<string, unknown> }) {
  const identity = (data.identity as string) || "";
  const purpose = (data.purpose as string) || "";
  const userName = (data.userName as string) || "";

  return (
    <div className="flex flex-col items-center text-center gap-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase font-sans mb-3" style={{ color: "#8A8578" }}>
          Identity Statement
        </p>
        <p className="font-display text-lg leading-relaxed" style={{ color: "#F5F0E8" }}>
          &ldquo;{identity}&rdquo;
        </p>
      </motion.div>

      <div className="h-px w-16" style={{ backgroundColor: "rgba(201, 168, 76, 0.2)" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase font-sans mb-3" style={{ color: "#8A8578" }}>
          Purpose
        </p>
        <p className="font-sans text-sm leading-relaxed" style={{ color: "#E8E0D0" }}>
          {purpose}
        </p>
      </motion.div>

      {userName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs font-sans mt-4"
          style={{ color: "#8A8578" }}
        >
          {userName}&apos;s Blueprint
        </motion.p>
      )}
    </div>
  );
}

function StreakContent({ data }: { data: Record<string, unknown> }) {
  const currentStreak = (data.currentStreak as number) || 0;
  const milestoneText = (data.milestoneText as string) || "";
  const tier = (data.tier as string) || "bronze";
  const userName = (data.userName as string) || "";

  const tierColors: Record<string, string> = {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#C9A84C",
    platinum: "#E5E4E2",
    diamond: "#B9F2FF",
  };

  const glowColor = tierColors[tier] || "#C9A84C";

  return (
    <div className="flex flex-col items-center text-center gap-4 px-4">
      {/* Fire glow effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${glowColor}22 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <p
          className="font-display text-7xl font-bold"
          style={{ color: glowColor }}
        >
          {currentStreak}
        </p>
        <p
          className="text-xs tracking-[0.25em] uppercase font-sans mt-1"
          style={{ color: "#8A8578" }}
        >
          Day Streak
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex items-center gap-2"
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: glowColor }}
        />
        <p className="text-xs font-sans uppercase tracking-wider" style={{ color: glowColor }}>
          {tier}
        </p>
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: glowColor }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="font-sans text-sm"
        style={{ color: "#E8E0D0" }}
      >
        {milestoneText}
      </motion.p>

      {userName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs font-sans mt-2"
          style={{ color: "#8A8578" }}
        >
          {userName} is locked in.
        </motion.p>
      )}
    </div>
  );
}

function WeeklyWinContent({ data }: { data: Record<string, unknown> }) {
  const winText = (data.winText as string) || "";
  const weekNumber = (data.weekNumber as number) || 0;
  const alignmentScore = data.alignmentScore as number | null;
  const userName = (data.userName as string) || "";

  return (
    <div className="flex flex-col items-center text-center gap-5 px-4">
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase font-sans mb-1" style={{ color: "#C9A84C" }}>
          Week {weekNumber} Win
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative"
      >
        {/* Gold accent line */}
        <div
          className="absolute -left-3 top-0 bottom-0 w-0.5 rounded-full"
          style={{ backgroundColor: "#C9A84C" }}
        />
        <p className="font-display text-lg leading-relaxed pl-4" style={{ color: "#F5F0E8" }}>
          &ldquo;{winText}&rdquo;
        </p>
      </motion.div>

      {alignmentScore !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-3"
        >
          <p className="font-display text-3xl font-bold" style={{ color: "#C9A84C" }}>
            {alignmentScore}
          </p>
          <div className="text-left">
            <p className="text-[10px] tracking-wider uppercase font-sans" style={{ color: "#8A8578" }}>
              Alignment
            </p>
            <p className="text-[10px] font-sans" style={{ color: "#8A8578" }}>
              Score / 10
            </p>
          </div>
        </motion.div>
      )}

      {userName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs font-sans mt-2"
          style={{ color: "#8A8578" }}
        >
          {userName}&apos;s Weekly Win
        </motion.p>
      )}
    </div>
  );
}

function InviteContent({ data }: { data: Record<string, unknown> }) {
  const inviterName = (data.inviterName as string) || "";
  const personalMessage = (data.personalMessage as string) || "";

  return (
    <div className="flex flex-col items-center text-center gap-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className="font-display text-2xl leading-snug" style={{ color: "#F5F0E8" }}>
          Join me on
        </p>
        <p className="font-display text-3xl font-bold mt-1" style={{ color: "#C9A84C" }}>
          Lockd In
        </p>
      </motion.div>

      <div className="h-px w-16" style={{ backgroundColor: "rgba(201, 168, 76, 0.3)" }} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="font-sans text-sm leading-relaxed max-w-[250px]"
        style={{ color: "#E8E0D0" }}
      >
        {personalMessage}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-2 px-6 py-2.5 rounded-xl"
        style={{ backgroundColor: "#C9A84C" }}
      >
        <p className="font-sans text-sm font-semibold" style={{ color: "#0A0A0A" }}>
          Get Started Free
        </p>
      </motion.div>

      {inviterName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs font-sans"
          style={{ color: "#8A8578" }}
        >
          Invited by {inviterName}
        </motion.p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ShareCardPreview({
  cardType,
  cardData,
  aspectRatio = "9:16",
}: ShareCardPreviewProps) {
  const isStory = aspectRatio === "9:16";

  const contentMap: Record<CardType, React.ReactNode> = {
    blueprint_summary: <BlueprintContent data={cardData} />,
    streak: <StreakContent data={cardData} />,
    weekly_win: <WeeklyWinContent data={cardData} />,
    invite: <InviteContent data={cardData} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        aspectRatio: isStory ? "9 / 16" : "1 / 1",
        width: isStory ? 280 : 320,
        background: "linear-gradient(180deg, #0A0A0A 0%, #141414 50%, #0A0A0A 100%)",
        border: "1px solid rgba(201, 168, 76, 0.15)",
      }}
    >
      <CardNoise />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent)",
        }}
      />

      {/* Content layout */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full py-8">
        {/* Top: Branding */}
        <CardBranding />

        {/* Center: Card content */}
        <div className="flex-1 flex items-center justify-center w-full">
          {contentMap[cardType]}
        </div>

        {/* Bottom: Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[9px] font-sans tracking-wider" style={{ color: "#8A8578" }}>
            lockdin.app
          </p>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent)",
        }}
      />
    </motion.div>
  );
}
