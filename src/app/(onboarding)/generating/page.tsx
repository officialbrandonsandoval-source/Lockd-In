"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Analyzing your responses...",
  "Building your identity statement...",
  "Mapping your purpose...",
  "Architecting your legacy...",
  "Finalizing your Blueprint...",
];

const MESSAGE_DURATION = 2500; // ms each message stays visible

// Animated lock icon SVG
function AnimatedLockIcon() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="relative w-20 h-20 mb-10"
    >
      {/* Outer ring */}
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="absolute inset-0 w-full h-full"
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.4"
        />
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="#C9A84C"
          strokeWidth="1"
          opacity="0.2"
        />
      </svg>

      {/* Compass / Cross */}
      <motion.svg
        viewBox="0 0 80 80"
        fill="none"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        {/* Vertical line */}
        <line
          x1="40"
          y1="18"
          x2="40"
          y2="62"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Horizontal line */}
        <line
          x1="18"
          y1="40"
          x2="62"
          y2="40"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx="40" cy="40" r="3" fill="#C9A84C" />
        {/* North pointer */}
        <polygon points="40,20 37,28 43,28" fill="#C9A84C" opacity="0.8" />
      </motion.svg>

      {/* Pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(201, 168, 76, 0)",
            "0 0 30px 10px rgba(201, 168, 76, 0.15)",
            "0 0 0 0 rgba(201, 168, 76, 0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default function GeneratingPage() {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [apiDone, setApiDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // Text cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < LOADING_MESSAGES.length - 1) return prev + 1;
        return prev; // Stay on last message
      });
    }, MESSAGE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Call the blueprint generation API
  useEffect(() => {
    let cancelled = false;

    async function generateBlueprint() {
      try {
        const res = await fetch("/api/blueprint/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to generate blueprint");
        }

        const data = await res.json();
        if (!cancelled) {
          setBlueprintId(data.blueprintId);
          setApiDone(true);
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(
            err instanceof Error
              ? err.message
              : "Something went wrong generating your blueprint."
          );
        }
      }
    }

    generateBlueprint();
    return () => {
      cancelled = true;
    };
  }, []);

  // When both the message sequence is done and API is done, trigger the flash + redirect
  const handleTransition = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      router.push(`/blueprint-reveal${blueprintId ? `?id=${blueprintId}` : ""}`);
    }, 800);
  }, [router, blueprintId]);

  useEffect(() => {
    if (apiDone && messageIndex >= LOADING_MESSAGES.length - 1) {
      // Wait a beat after the last message, then transition
      const timer = setTimeout(handleTransition, 1500);
      return () => clearTimeout(timer);
    }
  }, [apiDone, messageIndex, handleTransition]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Gold flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#C9A84C]/20"
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated icon */}
        <AnimatedLockIcon />

        {/* Loading messages */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-display text-[#E8E0D0] text-lg sm:text-xl"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle progress dots */}
        <div className="flex items-center gap-2 mt-8">
          {LOADING_MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                i <= messageIndex ? "bg-[#C9A84C]" : "bg-[#2A2A2A]"
              }`}
              animate={
                i === messageIndex
                  ? { scale: [1, 1.5, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Error state */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-[#8B2500] font-sans text-sm mb-4">{apiError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#C9A84C] font-sans text-sm underline underline-offset-4 hover:text-[#E8E0D0] transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
